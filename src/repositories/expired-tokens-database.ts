import {ObjectId, WithId} from "mongodb";
import {ExpiredTokenInsertDbType} from "../types/types";
import {ExpiredTokenModelClass} from "./db";

class ExpiredTokensRepoClass {
    async addTokenToDb(token: string, userId: ObjectId) {
        const expiredToken: ExpiredTokenInsertDbType = {
            userId: userId,
            refreshToken: token,
        }
        const expiredTokenInstance = new ExpiredTokenModelClass(expiredToken)
        await expiredTokenInstance.save()
        return
    }
    async findToken(token: string): Promise<WithId<ExpiredTokenInsertDbType> | null> {
        return ExpiredTokenModelClass.findOne({refreshToken: token})
    }
}

export const expiredTokensRepo = new ExpiredTokensRepoClass()