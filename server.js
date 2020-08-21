const express = require('express');
const logger = require('morgan');
const bodyParser = require('body-parser');
const cors = require('cors');
const helmet = require('helmet');
const xss = require('xss-clean');
const rateLimit = require('express-rate-limit');
const nodemailer = require('nodemailer');
const { body, validationResult } = require('express-validator');
const axios = require('axios');

require('dotenv').config();
const PORT = process.env.PORT || 5000;

const app = express();

// Body Parser Middleware
app.use(express.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(logger('dev'));
app.use(cors());
app.use(xss());
app.use(helmet());
app.use(express.json({ limit: '10kb' }));

// rate limite
const apiLimiter = rateLimit({
  windowMs: 10 * 60 * 1000, // 15 minutes
  max: 5,
});
app.use('/', apiLimiter);

const sendLimiter = rateLimit({
  windowMs: 10 * 60 * 1000,
  max: 5, // start blocking after 5 requests
  message: 'Too many requests  from this IP, please try again after 10 minutes',
});

app.post(
  '/api/contact',
  sendLimiter,
  [
    body('email').isEmail().normalizeEmail(),
    body('name').not().isEmpty().trim().escape(),
    body('subject').not().isEmpty().trim().escape(),
    body('message').not().isEmpty().trim().escape(),
    body('recaptcha_response').not().isEmpty().trim().escape(),
  ],
  async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(422).json({ errors: errors.array() });
    }
    const { name, email, subject, message } = req.body;
    const secretKey = process.env.CAPTCHA_SECRET_KEY;
    const url = `https://www.google.com/recaptcha/api/siteverify?secret=${secretKey}&response=${req.body.recaptcha_response}`;
    axios.post(url).then((data) => {
      console.log(data.data);
      if (!data.data['action']) {
        return res.status(422).json({
          status: 422,
          res: data.data,
          msg: 'Please refresh the page if you want to send another message',
        });
      }
      const output = `
<p>You have a new contact request</p>
<h3>Contact Details</h3>
<ul>  
  <li>Name: ${name}</li>
  <li>Email: ${email}</li>
</ul>
<p><strong>Message: </strong> ${message}</p>
<strong>Please don't reply to this message</strong>
`;
      let mailOptions = {
        from: `"Website Contact" <${process.env.EMAIL}>`,
        to: process.env.TOEMAIL,
        subject: subject,
        html: output,
      };
      let transporter = nodemailer.createTransport({
        host: process.env.HOST,
        port: process.env.MAILPORT,
        auth: {
          user: process.env.EMAIL,
          pass: process.env.PASSWORD,
        },
        debug: true, // show debug output
        logger: true, // log information in console
      });
      try {
        transporter.sendMail(mailOptions, (err, data) => {
          if (err) {
            return next(err);
          }
          if (data) {
            res.status(200).json({
              status: 200,
              msg:
                'Your message was successfully submitted, We will contact you soon..',
              fail: false,
              info: data,
            });
            next();
          }
        });
      } catch (error) {
        next(error);
      }
    });
  }
);

app.use((error, request, response, next) => {
  response.status(error.status || 500);
  response.json({ error: error.message });
  next();
});

const server = app.listen(PORT, function () {
  const host = server.address().address;
  const port = server.address().port;
  console.log('App is listening on http://%s:%s', host, port);
});

module.exports = app;
