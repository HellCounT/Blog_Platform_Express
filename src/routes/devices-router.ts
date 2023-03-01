import {Router} from "express";
import {authMiddleware} from "../middleware/auth-middleware";
import {devicesController} from "../composition-root";

export const devicesRouter = Router({})

devicesRouter.get('/', authMiddleware.refreshTokenCheck, devicesController.getAllSessions.bind(devicesController))

devicesRouter.delete('/', authMiddleware.refreshTokenCheck, devicesController.deleteAllOtherSessions.bind(devicesController))

devicesRouter.delete('/:deviceId', authMiddleware.refreshTokenCheck, devicesController.deleteSession.bind(devicesController))