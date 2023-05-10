import nodemailer from 'nodemailer';

import * as dotenv from 'dotenv';

dotenv.config();

class EmailService {
  constructor() {
    this.transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: process.env.SMTP_PORT,
      secure: true,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASSWORD,
      },
    });
  }

  async sendActivationMail(email, link) {
    await this.transporter.sendMail({
      from: process.env.SMTP_USER,
      to: email,
      subject: 'MyKinoList account activation',
      text: '*здесь могла быть ваша реклама*',
      html: `
        <div>
          <h1>Click on the link to activate your MyKinoList account</h1>
          <a href="${link}">${link}</a>
        </div>
      `,
    });
  }
}

export default new EmailService();
