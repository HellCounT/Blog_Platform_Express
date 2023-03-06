import {ObjectId} from "mongodb";
import {StatusType} from "../types/types";
import {DevicesRepoClass} from "../repositories/devices-repo";
import {inject, injectable} from "inversify";
import {jwtService} from "../application/jwt-service";
import {UsersQueryRepo} from "../repositories/query-repo";
import {ActiveSessionDbClass} from "../types/dbClasses";

@injectable()
export class DevicesServiceClass {
    constructor(@inject(DevicesRepoClass) protected devicesRepo: DevicesRepoClass,
                @inject(UsersQueryRepo) protected usersQueryRepo: UsersQueryRepo) {
    }
    async deleteSession(refreshToken: string, userId: ObjectId, deviceId: string): Promise<StatusType> {
        const foundSession = await this.usersQueryRepo.findSessionByDeviceId(new ObjectId(deviceId))
        if (foundSession) {
            if (foundSession.userId.toString() === userId.toString()) {
                await this.devicesRepo.deleteSessionById(new ObjectId(deviceId))
                return {
                    status: "Deleted",
                    code: 204,
                    message: 'Session has been deleted'
                }
            } else {
                return {
                    status: "Forbidden",
                    code: 403,
                    message: 'Attempt to delete the deviceId of other user'
                }
            }
        } else {
            return {
                status: "Not Found",
                code: 404,
                message: "Session doesn't exist or expired"
            }
        }
    }
    async logoutSession(refreshToken: string): Promise<void> {
        const sessionId = await jwtService.getDeviceIdByRefreshToken(refreshToken)
        if (sessionId) {
            await this.devicesRepo.deleteSessionById(sessionId)
            return
        }
    }
    async deleteAllOtherSessions(userId: ObjectId, refreshToken: string): Promise<StatusType> {
        const deviceId = await jwtService.getDeviceIdByRefreshToken(refreshToken)
        if (deviceId) {
            await this.devicesRepo.deleteAllOtherSessions(userId, deviceId)
            return {
                status: "Deleted",
                code: 204,
                message: 'Sessions have been deleted'
            }
        } else {
            return {
                status: "Unauthorized",
                code: 401,
                message: "Session doesn't exist or expired"
            }
        }
    }
    async startNewSession(refreshToken: string, userId: ObjectId,
                          deviceId: ObjectId, deviceName: string,
                          ip: string, issueDate: Date, expDate: Date): Promise<void> {
        const refreshTokenMeta = this._createMeta(refreshToken)
        const newSession = new ActiveSessionDbClass(
            deviceId,
            userId,
            ip,
            deviceName,
            issueDate,
            expDate,
            refreshTokenMeta
        )
        await this.devicesRepo.addSessionToDb(newSession)
    }
    async updateSessionWithDeviceId(newRefreshToken: string, deviceId: string,
                                    issueDate: Date, expDate: Date) {
        const newRefreshTokenMeta = this._createMeta(newRefreshToken)
        return await this.devicesRepo.updateSessionWithDeviceId(newRefreshTokenMeta, deviceId, issueDate, expDate)
    }
    _createMeta(refreshToken: string): string {
        const header = refreshToken.split('.')[0]
        const payload = refreshToken.split('.')[1]
        return header + '.' + payload
    }
}