import {Request, Response, Router} from "express";
import {refreshTokenCheck} from "../middleware/auth-middleware";
import {usersQueryRepo} from "../repositories/queryRepo";
import {devicesService} from "../domain/devices-service";

export const devicesRouter = Router({})

class DevicesControllerClass {
    async getAllSessions(req: Request, res: Response) {
        const refreshToken = req.cookies.refreshToken
        const result = await usersQueryRepo.getAllSessions(refreshToken)
        res.status(200).send(result)
    }

    async deleteAllOtherSessions(req: Request, res: Response) {
        const refreshToken = req.cookies.refreshToken
        const result = await devicesService.deleteAllOtherSessions(req.user?._id, refreshToken)
        if (!result) res.sendStatus(404)
        if (result.code === 204) res.sendStatus(204)
        if (result.code === 401) res.sendStatus(401)
    }

    async deleteSession(req: Request, res: Response) {
        const refreshToken = req.cookies.refreshToken
        const result = await devicesService.deleteSession(refreshToken, req.user?._id, req.params.deviceId)
        if (!result) res.sendStatus(404)
        if (result.code === 204) res.sendStatus(204)
        if (result.code === 404) res.sendStatus(404)
        if (result.code === 403) res.sendStatus(403)
    }
}

const devicesController = new DevicesControllerClass()

devicesRouter.get('/', refreshTokenCheck, devicesController.getAllSessions)

devicesRouter.delete('/', refreshTokenCheck, devicesController.deleteAllOtherSessions)

devicesRouter.delete('/:deviceId', refreshTokenCheck, devicesController.deleteSession)