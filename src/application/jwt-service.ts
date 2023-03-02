import jwt from 'jsonwebtoken'
import {ObjectId, WithId} from "mongodb";
import {UserDbType} from "../types/types";
import {settings} from "../settings";
import {DevicesServiceClass} from "../domain/devices-service";
import {ExpiredTokensRepoClass} from "../repositories/expired-tokens-database";
import {inject, injectable} from "inversify";

@injectable()
export class JwtServiceClass {
    constructor(@inject(DevicesServiceClass) protected devicesService: DevicesServiceClass,
                @inject(ExpiredTokensRepoClass) protected expiredTokensRepo: ExpiredTokensRepoClass) {
    }
    createJwt(user: WithId<UserDbType>): string {
        return jwt.sign({userId: user._id}, settings.JWT_SECRET, {expiresIn: 600})
    }
    async createRefreshJwt(user: WithId<UserDbType>, ip: string, deviceName: string): Promise<string> {
        const deviceId = new ObjectId()
        const issueDate = new Date()
        const expDateSec = Math.floor( issueDate.getTime() / 1000) + 20*60
        const expDate = new Date(expDateSec * 1000)
        const refreshToken = jwt.sign({
            userId: user._id,
            deviceId: deviceId.toString(), ///// ObjectId or String?
            exp: expDateSec
        }, settings.JWT_REFRESH_SECRET)
        await this.devicesService.startNewSession(refreshToken, user._id, deviceId, deviceName, ip, issueDate, expDate)
        return refreshToken
    }
    async updateRefreshJwt(user: WithId<UserDbType>, refreshToken: string): Promise<string> {
        const oldRefreshToken: any = jwt.verify(refreshToken, settings.JWT_REFRESH_SECRET)
        await this.expiredTokensRepo.addTokenToDb(refreshToken, user._id)
        const issueDate = new Date()
        const expDateSec = Math.floor( issueDate.getTime() / 1000) + 20*60
        const expDate = new Date(expDateSec * 1000)
        const newRefreshToken = jwt.sign({
            userId: user._id,
            deviceId: oldRefreshToken.deviceId,
            exp: expDateSec
        }, settings.JWT_REFRESH_SECRET)
        await this.devicesService.updateSessionWithDeviceId(newRefreshToken, oldRefreshToken.deviceId, issueDate, expDate)
        return newRefreshToken
    }
    async getUserIdByToken(token: string, secret: string): Promise<ObjectId | null> {
        try {
            const result: any = jwt.verify(token, secret)
            return new ObjectId(result.userId)
        } catch (error) {
            return null
        }
    }
    async addTokenToDb(user: WithId<UserDbType>, refreshToken: string): Promise<void> {
        await this.expiredTokensRepo.addTokenToDb(refreshToken, user._id)
        return
    }
    async getDeviceIdByRefreshToken(refreshToken: string): Promise<ObjectId | null> {
        try {
            const result: any = jwt.verify(refreshToken, settings.JWT_REFRESH_SECRET)
            return new ObjectId(result.deviceId)
        } catch (error) {
            return null
        }
    }
}