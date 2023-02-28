import {Request, Response, Router} from "express";
import {refreshTokenCheck} from "../middleware/auth-middleware";
import {usersQueryRepo} from "../repositories/queryRepo";
import {devicesService} from "../domain/devices-service";

export const devicesRouter = Router({})

devicesRouter.get('/', refreshTokenCheck, async (req: Request, res: Response) => {
    const refreshToken = req.cookies.refreshToken
    const result = await usersQueryRepo.getAllSessions(refreshToken)
    res.status(200).send(result)
})

devicesRouter.delete('/', refreshTokenCheck, async (req: Request, res: Response) => {
    const refreshToken = req.cookies.refreshToken
    const result = await devicesService.deleteAllOtherSessions(req.user?._id, refreshToken)
    if (!result) res.sendStatus(404)
    if (result.code === 204) res.sendStatus(204)
    if (result.code === 401) res.sendStatus(401)
})

devicesRouter.delete('/:deviceId', refreshTokenCheck, async (req: Request, res: Response) => {
    const refreshToken = req.cookies.refreshToken
    const result = await devicesService.deleteSession(refreshToken, req.user?._id, req.params.deviceId)
    if (!result) res.sendStatus(404)
    if (result.code === 204) res.sendStatus(204)
    if (result.code === 404) res.sendStatus(404)
    if (result.code === 403) res.sendStatus(403)
})