import {NextFunction, Request, Response} from "express";
import {settings} from "../settings";
import {usersQueryRepo} from "../repositories/queryRepo";
import {jwtService} from "../application/jwt-service";
import {expiredTokensRepo} from "../repositories/expired-tokens-database";

export const authMiddleware = {
    async checkCredentials(req: Request, res: Response, next: NextFunction) {
        if (!req.headers.authorization) {
            res.sendStatus(401)
        } else {
            const token = req.headers.authorization.split(' ')[1]
            const userId = await jwtService.getUserIdByToken(token, settings.JWT_SECRET)
            if (userId) {
                req.user = await usersQueryRepo.findUserById(userId)
                next()
            } else {
                res.sendStatus(401)
            }
        }
    },

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
                req.user = await usersQueryRepo.findUserById(userId)
                next()
            } else res.sendStatus(401)
        }
    },

    async parseUserIdByToken(req: Request, res: Response, next: NextFunction) {
        if (!req.headers.authorization) next()
        else {
            const token = req.headers.authorization.split(' ')[1]
            const userId = await jwtService.getUserIdByToken(token, settings.JWT_SECRET)
            if (userId) {
                req.user = await usersQueryRepo.findUserById(userId)
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