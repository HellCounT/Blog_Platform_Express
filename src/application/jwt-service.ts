import jwt from 'jsonwebtoken'
import {ObjectId, WithId} from "mongodb";
import {RefreshTokenResult} from "../types/types";
import {settings} from "../settings";
import {expiredTokensRepo} from "../repositories/expired-tokens-repo";
import {UserDbType} from "../types/dbTypes";

export const jwtService = {
    createJwt(user: WithId<UserDbType>): string {
        return jwt.sign({userId: user._id}, settings.JWT_SECRET, {expiresIn: 600})
    },
    async createRefreshJwt(user: WithId<UserDbType>): Promise<RefreshTokenResult> {
        const deviceId = new ObjectId()
        const issueDate = new Date()
        const expDateSec = Math.floor( issueDate.getTime() / 1000) + 20*60
        const expDate = new Date(expDateSec * 1000)
        const refreshToken = jwt.sign({
            userId: user._id,
            deviceId: deviceId.toString(), ///// ObjectId or String?
            exp: expDateSec
        }, settings.JWT_REFRESH_SECRET)
        return {
            refreshToken: refreshToken,
            userId: user._id,
            deviceId: deviceId,
            issueDate: issueDate,
            expDate: expDate
        }
    },
    async updateRefreshJwt(user: WithId<UserDbType>, refreshToken: string): Promise<RefreshTokenResult> {
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
        return {
            refreshToken: newRefreshToken,
            userId: user._id,
            deviceId: oldRefreshToken.deviceId,
            issueDate: issueDate,
            expDate: expDate
        }
    },
    async getUserIdByToken(token: string, secret: string): Promise<ObjectId | null> {
        try {
            const result: any = jwt.verify(token, secret)
            return new ObjectId(result.userId)
        } catch (error) {
            return null
        }
    },
    async addTokenToDb(user: WithId<UserDbType>, refreshToken: string): Promise<void> {
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