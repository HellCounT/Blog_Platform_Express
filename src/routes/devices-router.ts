import {Router} from "express";
import {authMiddleware} from "../middleware/auth-middleware";
import {container} from "../composition-root";
import {DevicesControllerClass} from "../controllers/devices-controller";

export const devicesRouter = Router({})

const devicesController = container.resolve(DevicesControllerClass)

devicesRouter.get('/', authMiddleware.refreshTokenCheck, devicesController.getAllSessions.bind(devicesController))

devicesRouter.delete('/', authMiddleware.refreshTokenCheck, devicesController.deleteAllOtherSessions.bind(devicesController))

devicesRouter.delete('/:deviceId', authMiddleware.refreshTokenCheck, devicesController.deleteSession.bind(devicesController))