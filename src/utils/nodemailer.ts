import nodemailer from "nodemailer";
  
let transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 587,
    secure: false,
    auth: {
        user: 'test.dev.mailsend@gmail.com',
        pass: 'Qwerty123456!'
    }
});

export default (message: any) => {
    transporter.sendMail(message, (err: any, info: any) => {
        if(err) return console.log(err);
    });
}