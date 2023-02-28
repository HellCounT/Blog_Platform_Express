import {ObjectId} from "mongodb";
import {devicesRepo} from "../repositories/devices-database";
import {jwtService} from "../application/jwt-service";
import {StatusType} from "../types/types";
import {usersQueryRepo} from "../repositories/queryRepo";

class DevicesServiceClass {
    async deleteSession(refreshToken: string, userId: ObjectId, deviceId: string): Promise<StatusType> {
        const foundSession = await usersQueryRepo.findSessionByDeviceId(new ObjectId(deviceId))
        if (foundSession) {
            if (foundSession.userId.toString() === userId.toString()) {
                await devicesRepo.deleteSessionById(new ObjectId(deviceId))
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
            await devicesRepo.deleteSessionById(sessionId)
            return
        }
    }
    async deleteAllOtherSessions(userId: ObjectId, refreshToken: string): Promise<StatusType> {
        const deviceId = await jwtService.getDeviceIdByRefreshToken(refreshToken)
        if (deviceId) {
            await devicesRepo.deleteAllOtherSessions(userId, deviceId)
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
        await devicesRepo.addSessionToDb(refreshTokenMeta, deviceId, userId, ip, deviceName, issueDate, expDate)
    }
    async updateSessionWithDeviceId(newRefreshToken: string, deviceId: string,
                                    issueDate: Date, expDate: Date) {
        const newRefreshTokenMeta = this._createMeta(newRefreshToken)
        return await devicesRepo.updateSessionWithDeviceId(newRefreshTokenMeta, deviceId, issueDate, expDate)
    }
    _createMeta(refreshToken: string): string {
        const header = refreshToken.split('.')[0]
        const payload = refreshToken.split('.')[1]
        return header + '.' + payload
    }
}

export const devicesService = new DevicesServiceClass()