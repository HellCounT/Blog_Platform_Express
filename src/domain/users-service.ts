import bcrypt from 'bcrypt'
import {UsersRepoClass} from "../repositories/users-repo";
import {UserDbClass, UserDbType, UserViewType} from "../types/types";
import {ObjectId, WithId} from "mongodb";
import {v4 as uuidv4} from "uuid";
import add from 'date-fns/add'
import {emailManager} from "../managers/email-manager";
import {inject, injectable} from "inversify";

@injectable()
export class UsersServiceClass {
    constructor(@inject(UsersRepoClass) protected usersRepo: UsersRepoClass) {
    }

    async registerUser(login: string, password: string, email: string): Promise<UserViewType | null> {
        const passwordHash = await this._generateHash(password)
        const currentDate = new Date()
        const newUser = new UserDbClass(
            new ObjectId(),
            {
                login: login,
                email: email,
                hash: passwordHash,
                createdAt: currentDate.toISOString()
            },
            {
                confirmationCode: uuidv4(),
                expirationDate: add(currentDate, {hours: 1}).toISOString(),
                isConfirmed: false
            },
            {
                recoveryCode: undefined,
                expirationDate: undefined
            }
        )
        const createUserResult = await this.usersRepo.createUser(newUser)
        try {
            await emailManager.sendEmailRegistrationCode(newUser.accountData.email, newUser.emailConfirmationData.confirmationCode)
        } catch (error) {
            console.error(error)
            await this.usersRepo.deleteUser(createUserResult.id)
            return null
        }
        return createUserResult
    }

    async createUser(login: string, password: string, email: string): Promise<UserViewType | null> {
        const passwordHash = await this._generateHash(password)
        const currentDate = new Date()
        const newUser = new UserDbClass(
            new ObjectId(),
            {
                login: login,
                email: email,
                hash: passwordHash,
                createdAt: currentDate.toISOString()
            },
            {
                confirmationCode: "User Created by SuperAdmin",
                expirationDate: "User Created by SuperAdmin",
                isConfirmed: true
            },
            {
                recoveryCode: undefined,
                expirationDate: undefined
            }
        )
        if (await this.usersRepo.findByLoginOrEmail(login) ||
            await this.usersRepo.findByLoginOrEmail(email)) return null
        return await this.usersRepo.createUser(newUser)
    }

    async deleteUser(id: string): Promise<boolean | null> {
        return await this.usersRepo.deleteUser(id)
    }

    async checkCredentials(loginOrEmail: string, password: string): Promise<WithId<UserDbType> | null> {
        const foundUser = await this.usersRepo.findByLoginOrEmail(loginOrEmail)
        if (!foundUser) return null
        if (!foundUser.emailConfirmationData.isConfirmed) return null
        else {
            //const passwordHash = await usersService._generateHash(password)
            if (await bcrypt.compare(password, foundUser.accountData.hash)) return foundUser
            else return null
        }
    }

    async confirmUserEmail(code: string): Promise<boolean> {
        const foundUser = await this.usersRepo.findByConfirmationCode(code)
        if (!foundUser) return false
        if (foundUser.emailConfirmationData.isConfirmed) return false
        if (foundUser.emailConfirmationData.confirmationCode !== code) return false
        if (new Date(foundUser.emailConfirmationData.expirationDate) < new Date()) return false
        return await this.usersRepo.confirmationSetUser(foundUser._id.toString())
    }

    async resendActivationCode(email: string): Promise<boolean> {
        const foundUser = await this.usersRepo.findByLoginOrEmail(email)
        if (!foundUser) return false
        if (foundUser.emailConfirmationData.isConfirmed) return false
        const newCode = uuidv4()
        await this.usersRepo.updateConfirmationCode(foundUser._id, newCode)
        try {
            await emailManager.resendEmailRegistrationCode(foundUser.accountData.email, newCode)
            return true
        } catch (error) {
            console.error(error)
            return false
        }
    }

    async sendPasswordRecoveryCode(email: string) {
        const newCode = uuidv4()
        const foundUser = await this.usersRepo.findByLoginOrEmail(email)
        if (foundUser) {
            await this.usersRepo.updateRecoveryCode(foundUser._id, newCode)
        }
        try {
            await emailManager.sendRecoveryCode(email, newCode)
            return true
        } catch (error) {
            console.error(error)
            return false
        }
    }

    async updatePasswordByRecoveryCode(recoveryCode: string, newPassword: string) {
        const foundUser = await this.usersRepo.findByRecoveryCode(recoveryCode)
        if (!foundUser) return false
        else {
            const newPasswordHash = await this._generateHash(newPassword)
            await this.usersRepo.updateHashByRecoveryCode(foundUser._id, newPasswordHash)
            return true
        }
    }

    async _generateHash(password: string) {
        const salt = await bcrypt.genSalt(10)
        return await bcrypt.hash(password, salt)
    }
}