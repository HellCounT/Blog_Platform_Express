import {ObjectId, WithId} from "mongodb";
import {UserDbType, UserViewType} from "../types/types";
import {UserModelClass} from "./db";

export class UsersRepoClass {
    async findByLoginOrEmail(loginOrEmail: string) {
        return UserModelClass.findOne({
            $or: [{'accountData.email': loginOrEmail},
                {'accountData.login': loginOrEmail}]
        }).lean()
    }
    async findByConfirmationCode(emailConfirmationCode: string): Promise<WithId<UserDbType> | null> {
        return UserModelClass.findOne(
            {'emailConfirmationData.confirmationCode': emailConfirmationCode})
    }
    async findByRecoveryCode(recoveryCode: string): Promise<WithId<UserDbType> | null> {
        return UserModelClass.findOne(
            {'recoveryCodeData.recoveryCode': recoveryCode}
        )
    }
    async createUser(newUser: UserDbType): Promise<UserViewType> {
        const userInstance = new UserModelClass(newUser)
        const result = await userInstance.save()
        return {
            id: result._id.toString(),
            login: result.accountData.login,
            email: result.accountData.email,
            createdAt: result.accountData.createdAt
        }
    }
    async deleteUser(id: string): Promise<boolean | null> {
        const userInstance = await UserModelClass.findOne({_id: new ObjectId(id)})
        if (!userInstance) return false
        await userInstance.deleteOne()
        return true
    }
    async confirmationSetUser(id: string): Promise<boolean> {
        const userInstance = await UserModelClass.findOne({_id: id})
        if (!userInstance) return false
        userInstance.emailConfirmationData.isConfirmed = true
        userInstance.save()
        return true
    }
    async updateConfirmationCode(id: ObjectId, newCode: string): Promise<void> {
        const userInstance = await UserModelClass.findOne({_id: id})
        if (!userInstance) {
            return
        } else {
            userInstance.emailConfirmationData.confirmationCode = newCode
            await userInstance.save()
            return
        }
    }
    async updateRecoveryCode(id: ObjectId, newRecoveryCode: string): Promise<void> {
        const userInstance = await UserModelClass.findOne({_id: id})
        if (!userInstance) {
            return
        } else {
            userInstance.recoveryCodeData.recoveryCode = newRecoveryCode
            userInstance.recoveryCodeData.expirationDate = new Date()
            await userInstance.save()
            return
        }
    }
    async updateHashByRecoveryCode(id: ObjectId, newHash: string): Promise<void> {
        const userInstance = await UserModelClass.findOne({_id: id})
        if (!userInstance) {
            return
        } else {
            userInstance.accountData.hash = newHash
            await userInstance.save()
            return
        }
    }
}