import {Request, Response, Router} from "express";
import {DevicesServiceClass} from "../domain/devices-service";
import {authMiddleware} from "../middleware/auth-middleware";
import {usersQueryRepo} from "../repositories/queryRepo";

export const devicesRouter = Router({})

class DevicesControllerClass {
    private devicesService: DevicesServiceClass;
    constructor() {
        this.devicesService = new DevicesServiceClass()
    }
    async getAllSessions(req: Request, res: Response) {
        const refreshToken = req.cookies.refreshToken
        const result = await usersQueryRepo.getAllSessions(refreshToken)
        res.status(200).send(result)
    }

    async deleteAllOtherSessions(req: Request, res: Response) {
        const refreshToken = req.cookies.refreshToken
        const result = await this.devicesService.deleteAllOtherSessions(req.user?._id, refreshToken)
        if (!result) res.sendStatus(404)
        if (result.code === 204) res.sendStatus(204)
        if (result.code === 401) res.sendStatus(401)
    }

    async deleteSession(req: Request, res: Response) {
        const refreshToken = req.cookies.refreshToken
        const result = await this.devicesService.deleteSession(refreshToken, req.user?._id, req.params.deviceId)
        if (!result) res.sendStatus(404)
        if (result.code === 204) res.sendStatus(204)
        if (result.code === 404) res.sendStatus(404)
        if (result.code === 403) res.sendStatus(403)
    }
}

const devicesController = new DevicesControllerClass()

devicesRouter.get('/', authMiddleware.refreshTokenCheck, devicesController.getAllSessions.bind(devicesController))

devicesRouter.delete('/', authMiddleware.refreshTokenCheck, devicesController.deleteAllOtherSessions.bind(devicesController))

devicesRouter.delete('/:deviceId', authMiddleware.refreshTokenCheck, devicesController.deleteSession.bind(devicesController))