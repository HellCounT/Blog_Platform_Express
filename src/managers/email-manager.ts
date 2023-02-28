import {transport} from "../adapters/email-adapter";

class EmailManagerClass {
    async sendEmailRegistrationCode(email: string, code: string) {
        await transport.sendMail({
            from: 'Blog Platform <hellcount.test@gmail.com>',
            to: email,
            subject: "Your email confirmation code",
            html: "<h1>Thank you for your registration</h1>\n" +
                "       <p>To finish registration please follow the link below:\n" +
                `          <a href='https://somesite.com/confirm-email?code=${code}'>complete registration</a>\n` +
                "      </p>"
        })
    }
    async resendEmailRegistrationCode(email: string, code: string) {
        await transport.sendMail({
            from: 'Blog Platform <hellcount.test@gmail.com>',
            to: email,
            subject: "Resending your email confirmation code",
            html: "<h1>Your request for activation code resending is completed</h1>\n" +
                "       <p>To finish registration please follow the link below:\n" +
                `          <a href='https://somesite.com/confirm-email?code=${code}'>complete registration</a>\n` +
                "      </p>"
        })
    }
    async sendRecoveryCode(email: string, code: string) {
        await transport.sendMail({
            from: 'Blog Platform <hellcount.test@gmail.com>',
            to: email,
            subject: "Password Recovery",
            html: "<h1>Password recovery</h1>\n" +
                "       <p>To finish password recovery please follow the link below:\n" +
                `          <a href='https://somesite.com/password-recovery?recoveryCode=${code}'>recovery password</a>\n` +
                "      </p>"
        })
    }
}

export const emailManager = new EmailManagerClass()