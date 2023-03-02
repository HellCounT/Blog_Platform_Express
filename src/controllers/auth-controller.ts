import {UsersServiceClass} from "../domain/users-service";
import {DevicesServiceClass} from "../domain/devices-service";
import {Request, Response} from "express";
import {usersQueryRepo} from "../repositories/queryRepo";
import {jwtService} from "../composition-root";
import {inject, injectable} from "inversify";

const refreshTokenCookieOptions = {
    httpOnly: true,
    secure: true,
}

@injectable()
export class AuthControllerClass {
    constructor(@inject(UsersServiceClass) protected usersService: UsersServiceClass,
                @inject(DevicesServiceClass) protected devicesService: DevicesServiceClass) {
    }

    async getMyInfo(req: Request, res: Response) {
        const token = req.headers.authorization!.split(' ')[1]
        const result = await usersQueryRepo.getMyInfo(token)
        res.status(200).send(result)
    }

    async login(req: Request, res: Response) {
        const checkResult = await this.usersService.checkCredentials(req.body.loginOrEmail, req.body.password)
        if (checkResult) {
            const ipAddress = req.ip
            const deviceName = req.headers["user-agent"]!
            const accessToken = {"accessToken": jwtService.createJwt(checkResult)}
            const newRefreshToken = await jwtService.createRefreshJwt(checkResult, ipAddress, deviceName)
            res.status(200).cookie('refreshToken', newRefreshToken, refreshTokenCookieOptions).json(accessToken)
        } else res.sendStatus(401)
    }

    async logout(req: Request, res: Response) {
        await jwtService.addTokenToDb(req.user!._id, req.cookies.refreshToken)
        await this.devicesService.logoutSession(req.cookies.refreshToken)
        res.status(204).cookie('refreshToken', '', refreshTokenCookieOptions).send()
    }

    async updateRefreshToken(req: Request, res: Response) {
        const newRefreshToken = await jwtService.updateRefreshJwt(req.user, req.cookies?.refreshToken)
        const accessToken = {
            "accessToken": jwtService.createJwt(req.user)
        }
        res.status(200).cookie('refreshToken', newRefreshToken, refreshTokenCookieOptions).json(accessToken)
    }

    async registerUser(req: Request, res: Response) {
        //User registration
        const userRegResult = await this.usersService.registerUser(req.body.login, req.body.password, req.body.email)
        if (userRegResult) res.sendStatus(204)
    }

    async confirmUserEmail(req: Request, res: Response) {
        const result = await this.usersService.confirmUserEmail(req.body.code)
        console.log(result)
        if (!result) res.sendStatus(400)
        else return res.sendStatus(204)
    }

    async resendActivationCode(req: Request, res: Response) {
        const result = await this.usersService.resendActivationCode(req.body.email)
        if (!result) res.sendStatus(400)
        else return res.sendStatus(204)
    }

    async passwordRecovery(req: Request, res: Response) {
        const result = await this.usersService.sendPasswordRecoveryCode(req.body.email)
        if (!result) res.sendStatus(400)
        else res.sendStatus(204)
    }

    async setNewPassword(req: Request, res: Response) {
        const result = await this.usersService.updatePasswordByRecoveryCode(req.body.recoveryCode, req.body.newPassword)
        if (!result) {
            const errorsMessages = [{
                message: "Incorrect recovery code",
                field: "recoveryCode"
            }]
            res.status(400).send({errorsMessages})
        } else res.sendStatus(204)
    }

}