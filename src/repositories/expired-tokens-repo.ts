import {ObjectId, WithId} from "mongodb";
import {ExpiredTokenModelClass} from "./db";
import {ExpiredTokenInsertDbType} from "../types/dbTypes";

export const expiredTokensRepo = {
    async addTokenToDb(token: string, userId: ObjectId) {
        const expiredToken: ExpiredTokenInsertDbType = {
            userId: userId,
            refreshToken: token,
        }
        const expiredTokenInstance = new ExpiredTokenModelClass(expiredToken)
        await expiredTokenInstance.save()
        return
    },
    async findToken(token: string): Promise<WithId<ExpiredTokenInsertDbType> | null> {
        return ExpiredTokenModelClass.findOne({refreshToken: token})
    }
}