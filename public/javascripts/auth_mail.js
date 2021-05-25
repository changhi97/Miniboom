const nodemailer = require('nodemailer');
const transporter = nodemailer.createTransport({
  service: 'gmail',
  host: 'smtp.gmail.com',
  port: 587,
  secure: false,
  auth: {
    user: 'changhee.project@gmail.com',
    pass: 'rlackdgml97@',
  }
});

module.exports = transporter
