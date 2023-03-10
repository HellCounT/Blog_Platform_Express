import {NextFunction, Request, Response} from "express";
import {settings} from "../settings";
import {jwtService} from "../application/jwt-service";
import {expiredTokensRepo} from "../repositories/expired-tokens-repo";
import {UsersQueryRepo} from "../repositories/query-repo";
import {inject, injectable} from "inversify";

@injectable()
export class AuthMiddleware {
    constructor(@inject(UsersQueryRepo) protected usersQueryRepo: UsersQueryRepo) {
    }
    async checkCredentials(req: Request, res: Response, next: NextFunction) {
        if (!req.headers.authorization) {
            res.sendStatus(401)
        } else {
            const token = req.headers.authorization.split(' ')[1]
            const userId = await jwtService.getUserIdByToken(token, settings.JWT_SECRET)
            if (userId) {
                req.user = await this.usersQueryRepo.findUserById(userId)
                next()
            } else {
                res.sendStatus(401)
            }
        }
    }

    async refreshTokenCheck(req: Request, res: Response, next: NextFunction) {
        if (!req.cookies.refreshToken) {
            res.sendStatus(401)
        } else {
            const token = req.cookies.refreshToken
            if (await expiredTokensRepo.findToken(token)) {
                res.sendStatus(401)
                return
            }
            const userId = await jwtService.getUserIdByToken(token, settings.JWT_REFRESH_SECRET)
            if (userId) {
                req.user = await this.usersQueryRepo.findUserById(userId)
                next()
            } else res.sendStatus(401)
        }
    }

    async parseUserIdByToken(req: Request, res: Response, next: NextFunction) {
        if (!req.headers.authorization) next()
        else {
            const token = req.headers.authorization.split(' ')[1]
            const userId = await jwtService.getUserIdByToken(token, settings.JWT_SECRET)
            if (userId) {
                req.user = await this.usersQueryRepo.findUserById(userId)
                next()
            } else {
                next()
            }
        }
    }
}

// export const authMiddleware = async (req: Request, res: Response, next: NextFunction) => {
//     if (!req.headers.authorization) {
//         res.sendStatus(401)
//     } else {
//         const token = req.headers.authorization.split(' ')[1]
//         const userId = await jwtService.getUserIdByToken(token, settings.JWT_SECRET)
//         if (userId) {
//             req.user = await usersQueryRepo.findUserById(userId)
//             next()
//         } else {
//             res.sendStatus(401)
//         }
//     }
// }
// export const refreshTokenCheck = async (req: Request, res: Response, next: NextFunction) => {
//     if (!req.cookies.refreshToken) {
//         res.sendStatus(401)
//     } else {
//         const token = req.cookies.refreshToken
//         if (await expiredTokensRepo.findToken(token)) {
//             res.sendStatus(401)
//             return
//         }
//         const userId = await jwtService.getUserIdByToken(token, settings.JWT_REFRESH_SECRET)
//         if (userId) {
//             req.user = await usersQueryRepo.findUserById(userId)
//             next()
//         } else res.sendStatus(401)
//     }
// }
// export const parseUserIdByToken = async (req: Request, res: Response, next: NextFunction) => {
//     if (!req.headers.authorization) next()
//     else {
//         const token = req.headers.authorization.split(' ')[1]
//         const userId = await jwtService.getUserIdByToken(token, settings.JWT_SECRET)
//         if (userId) {
//             req.user = await usersQueryRepo.findUserById(userId)
//             next()
//         } else {
//             next()
//         }
//     }
//
// }