## Express API example with nodemailer and Google Recaptcha

This example demonstrates how to use nodemailer and Google Recaptcha with an Express JS application. It is an API style application that is secured using nodemailer and Google Recaptcha. When a user send a contact form, they are issued a token by Google. The client then attaches the token to every request to verify it and send an email template with the client details to the destination

### Setup

Make sure you have Nodejs installed on your system by following the instructions found in the [Node.js®](https://nodejs.org/en/).

In the root directory of the application create a hidden file called `.env` and add the following information:

```
HOST=host.com
EMAIL=example@host.com
PASSWORD=your account password
TOEMAIL=to@host.com
MAILPORT=your smtp port
PORT=3000 // server port
captcha secretKey
CAPTCHA_SECRET_KEY=...

```

You will need to modify the above to your needs. If you need more information about how it works, please refer to the [dotenv documentation](https://www.npmjs.com/package/dotenv) and take particular note of the FAQ section.

### What's included?

Here is a list of npm modules I'm using:

- `express` - The application server
- `dotenv` - To configure the application
- `body-parser` - To parse JSON
- `morgan` - To log activity
- `cors` - To allow requests from other domains
- `helmet` - For a bit of extra security
- `express-rate-limit` - Setting limiter on routes
- `xss-clean` - Data Sanitization against XSS attacks
- `nodemailer` - To send SMTP messages
- `axios` - To send a request to google to verify the token
