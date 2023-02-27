import {ActiveSessionDbType} from "../types/types";
import {ObjectId} from "mongodb";
import {ActiveSessionClass} from "./db";

export const devicesRepo = {
    async addSessionToDb(refreshTokenMeta: string, deviceId: ObjectId,
                         userId: ObjectId, ip: string, deviceName: string,
                         issueDate: Date, expDate: Date): Promise<void> {
        const newSession: ActiveSessionDbType = {
            _id: deviceId,
            userId: userId,
            ip: ip,
            deviceName: deviceName,
            issuedAt: issueDate,
            expirationDate: expDate,
            refreshTokenMeta: refreshTokenMeta
        }
        const activeSessionInstance = new ActiveSessionClass(newSession)
        await activeSessionInstance.save()
        return
    },
    async updateSessionWithDeviceId(newRefreshTokenMeta: string, deviceId: string,
                                    issueDate: Date, expDate: Date): Promise<boolean> {
        const activeSessionInstance = await ActiveSessionClass.findOne({_id: new ObjectId(deviceId)})
        if (activeSessionInstance) {
            activeSessionInstance.issuedAt = issueDate
            activeSessionInstance.expirationDate = expDate
            activeSessionInstance.refreshTokenMeta = newRefreshTokenMeta
            await activeSessionInstance.save()
            return true
        } else return false
    },
    async deleteSessionById(deviceId: ObjectId): Promise<boolean> {
        const activeSessionInstance = await ActiveSessionClass.findOne({_id: new ObjectId(deviceId)})
        if (!activeSessionInstance) return false
        await activeSessionInstance.deleteOne()
        return true
    },
    async deleteAllOtherSessions(userId: ObjectId, deviceId: ObjectId): Promise<boolean> {
        const result = await ActiveSessionClass.deleteMany({
            "userId": userId,
            "_id": {$ne: deviceId}
        })
        return result.deletedCount >= 1
    }
}