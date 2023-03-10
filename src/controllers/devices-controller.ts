import {DevicesServiceClass} from "../domain/devices-service";
import {Request, Response} from "express";
import {inject, injectable} from "inversify";
import {UsersQueryRepo} from "../repositories/query-repo";

@injectable()
export class DevicesControllerClass {
    constructor(
        @inject(DevicesServiceClass) protected devicesService: DevicesServiceClass,
        @inject(UsersQueryRepo) protected usersQueryRepo: UsersQueryRepo
        ) {
    }

    async getAllSessions(req: Request, res: Response) {
        const refreshToken = req.cookies.refreshToken
        const result = await this.usersQueryRepo.getAllSessions(refreshToken)
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