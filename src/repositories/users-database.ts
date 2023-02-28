import {ObjectId, WithId} from "mongodb";
import {UserCreateType, UserInsertDbType, UserViewType} from "../types/types";
import {UserModelClass} from "./db";

class UsersRepoClass {
    async findByLoginOrEmail(loginOrEmail: string) {
        return UserModelClass.findOne({
            $or: [{'accountData.email': loginOrEmail},
                {'accountData.login': loginOrEmail}]
        }).lean()
    }
    async findByConfirmationCode(emailConfirmationCode: string): Promise<WithId<UserInsertDbType> | null> {
        return UserModelClass.findOne(
            {'emailConfirmationData.confirmationCode': emailConfirmationCode})
    }
    async findByRecoveryCode(recoveryCode: string): Promise<WithId<UserInsertDbType> | null> {
        return UserModelClass.findOne(
            {'recoveryCodeData.recoveryCode': recoveryCode}
        )
    }
    async createUser(newUser: UserCreateType, hash: string): Promise<UserViewType> {
        const insertDbUser: UserInsertDbType = {
            accountData: {
                login: newUser.login,
                email: newUser.email,
                hash: hash,
                createdAt: newUser.createdAt
            },
            emailConfirmationData: {
                confirmationCode: newUser.confirmationCode,
                expirationDate: newUser.expirationDate,
                isConfirmed: newUser.isConfirmed
            },
            recoveryCodeData: {
                recoveryCode: undefined,
                expirationDate: undefined
            }
        }
        const userInstance = new UserModelClass(insertDbUser)
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

export const usersRepo = new UsersRepoClass()