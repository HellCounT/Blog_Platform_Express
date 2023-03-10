import {ObjectId} from "mongodb";
import {ActiveSessionModelClass} from "./db";
import {injectable} from "inversify";
import {ActiveSessionDbClass} from "../types/dbClasses";

@injectable()
export class DevicesRepoClass {
    async addSessionToDb(newSession: ActiveSessionDbClass): Promise<void> {
        const activeSessionInstance = new ActiveSessionModelClass(newSession)
        await activeSessionInstance.save()
        return
    }
    async updateSessionWithDeviceId(newRefreshTokenMeta: string, deviceId: string,
                                    issueDate: Date, expDate: Date): Promise<boolean> {
        const activeSessionInstance = await ActiveSessionModelClass.findOne({_id: new ObjectId(deviceId)})
        if (activeSessionInstance) {
            activeSessionInstance.issuedAt = issueDate
            activeSessionInstance.expirationDate = expDate
            activeSessionInstance.refreshTokenMeta = newRefreshTokenMeta
            await activeSessionInstance.save()
            return true
        } else return false
    }
    async deleteSessionById(deviceId: ObjectId): Promise<boolean> {
        const activeSessionInstance = await ActiveSessionModelClass.findOne({_id: new ObjectId(deviceId)})
        if (!activeSessionInstance) return false
        await activeSessionInstance.deleteOne()
        return true
    }
    async deleteAllOtherSessions(userId: ObjectId, deviceId: ObjectId): Promise<boolean> {
        const result = await ActiveSessionModelClass.deleteMany({
            "userId": userId,
            "_id": {$ne: deviceId}
        })
        return result.deletedCount >= 1
    }
}