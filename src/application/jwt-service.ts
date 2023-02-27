import jwt from 'jsonwebtoken'
import {ObjectId, WithId} from "mongodb";
import {UserInsertDbType} from "../types/types";
import {settings} from "../settings";
import {expiredTokensRepo} from "../repositories/expired-tokens-database";
import {devicesService} from "../domain/devices-sevice";

export const jwtService = {
    createJwt(user: WithId<UserInsertDbType>): string {
        return jwt.sign({userId: user._id}, settings.JWT_SECRET, {expiresIn: 600})
    },
    async createRefreshJwt(user: WithId<UserInsertDbType>, ip: string, deviceName: string): Promise<string> {
        const deviceId = new ObjectId()
        const issueDate = new Date()
        const expDateSec = Math.floor( issueDate.getTime() / 1000) + 20*60
        const expDate = new Date(expDateSec * 1000)
        const refreshToken = jwt.sign({
            userId: user._id,
            deviceId: deviceId.toString(), ///// ObjectId or String?
            exp: expDateSec
        }, settings.JWT_REFRESH_SECRET)
        await devicesService.startNewSession(refreshToken, user._id, deviceId, deviceName, ip, issueDate, expDate)
        return refreshToken
    },
    async updateRefreshJwt(user: WithId<UserInsertDbType>, refreshToken: string): Promise<string> {
        const oldRefreshToken: any = jwt.verify(refreshToken, settings.JWT_REFRESH_SECRET)
        await expiredTokensRepo.addTokenToDb(refreshToken, user._id)
        const issueDate = new Date()
        const expDateSec = Math.floor( issueDate.getTime() / 1000) + 20*60
        const expDate = new Date(expDateSec * 1000)
        const newRefreshToken = jwt.sign({
            userId: user._id,
            deviceId: oldRefreshToken.deviceId,
            exp: expDateSec
        }, settings.JWT_REFRESH_SECRET)
        await devicesService.updateSessionWithDeviceId(newRefreshToken, oldRefreshToken.deviceId, issueDate, expDate)
        return newRefreshToken
    },
    async getUserIdByToken(token: string, secret: string): Promise<ObjectId | null> {
        try {
            const result: any = jwt.verify(token, secret)
            return new ObjectId(result.userId)
        } catch (error) {
            return null
        }
    },
    async addTokenToDb(user: WithId<UserInsertDbType>, refreshToken: string): Promise<void> {
        await expiredTokensRepo.addTokenToDb(refreshToken, user._id)
        return
    },
    async getDeviceIdByRefreshToken(refreshToken: string): Promise<ObjectId | null> {
        try {
            const result: any = jwt.verify(refreshToken, settings.JWT_REFRESH_SECRET)
            return new ObjectId(result.deviceId)
        } catch (error) {
            return null
        }
    }
}
