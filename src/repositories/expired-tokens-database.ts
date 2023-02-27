import {ObjectId, WithId} from "mongodb";
import {ExpiredTokenInsertDbType} from "../types/types";
import {expiredTokensCollection} from "./db";

export const expiredTokensRepo = {
    async addTokenToDb(token: string, userId: ObjectId) {
        const expiredToken: ExpiredTokenInsertDbType = {
            userId: userId,
            refreshToken: token,
        }
        await expiredTokensCollection.insertOne(expiredToken)
        return
    },
    async findToken(token: string): Promise<WithId<ExpiredTokenInsertDbType> | null> {
        return await expiredTokensCollection.findOne({refreshToken: token})
    }
}