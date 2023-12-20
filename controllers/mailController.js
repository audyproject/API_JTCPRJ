// import reactemail from "react-email"
const reactemail = require('@react-email/render')
const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  host: "217.21.73.155",
  port: 465,
  secure: true,
  auth: {
    user: 'no-reply@jtcprj.org',
    pass: 'Jtcprj@2023'
  },
  tls: {
    rejectUnauthorized: false
  }
});

var mailOptions = {
  from: 'no-reply@jtcprj.org',
  to: '',
  subject: '',
  html: '',
};

const mail = async ({to, subject, html}) => {
    mailOptions.to = to
    mailOptions.subject = subject
    mailOptions.html = html
    
    const sendmail = await new Promise((resolve, reject) => {
        transporter.sendMail(mailOptions, (err, info) => {
          if (err) {
            console.error(err);
            reject(err);
          } else {
            resolve(info);
          }
        });
      });
      
    if(sendmail.rejected.length > 0){
        return -1
    } else {
        return 0
    }
}

const reactmail = async ({to, subject, html}) => {
    mailOptions.to = to
    mailOptions.subject = subject
    mailOptions.html = reactemail.render(ticketTemplate)
    
    const sendmail = await new Promise((resolve, reject) => {
        transporter.sendMail(mailOptions, (err, info) => {
          if (err) {
            console.error(err);
            reject(err);
          } else {
            resolve(info);
          }
        });
      });
      
    if(sendmail.rejected.length > 0){
        return -1
    } else {
        return 0
    }
}

module.exports = {
    mail,
    reactmail
}