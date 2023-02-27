import {ObjectId, WithId} from "mongodb";
import {ExpiredTokenInsertDbType} from "../types/types";
import {ExpiredTokenClass} from "./db";

export const expiredTokensRepo = {
    async addTokenToDb(token: string, userId: ObjectId) {
        const expiredToken: ExpiredTokenInsertDbType = {
            userId: userId,
            refreshToken: token,
        }
        const expiredTokenInstance = new ExpiredTokenClass(expiredToken)
        await expiredTokenInstance.save()
        return
    },
    async findToken(token: string): Promise<WithId<ExpiredTokenInsertDbType> | null> {
        return ExpiredTokenClass.findOne({refreshToken: token})
    }
}