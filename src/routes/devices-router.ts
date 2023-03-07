import {Router} from "express";
import {container} from "../composition-root";
import {DevicesControllerClass} from "../controllers/devices-controller";
import {AuthMiddleware} from "../middleware/auth-middleware";

export const devicesRouter = Router({})

const devicesController = container.resolve(DevicesControllerClass)
const authMiddleware = container.resolve(AuthMiddleware)

devicesRouter.get('/', authMiddleware.refreshTokenCheck, devicesController.getAllSessions.bind(devicesController))

devicesRouter.delete('/', authMiddleware.refreshTokenCheck, devicesController.deleteAllOtherSessions.bind(devicesController))

devicesRouter.delete('/:deviceId', authMiddleware.refreshTokenCheck, devicesController.deleteSession.bind(devicesController))