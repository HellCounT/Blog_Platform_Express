import nodemailer from 'nodemailer'
import {settings} from "../settings";

export const transport = nodemailer.createTransport({
    service: 'gmail',
    host: 'smtp.gmail.com',
    auth: {
        user: settings.EMAIL_LOGIN,
        pass: settings.EMAIL_PASSWORD
    },
});