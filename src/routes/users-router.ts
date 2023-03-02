import {Router} from "express";
import {inputValidation, userDataValidator} from "../middleware/data-validation";
import {basicAuth} from "../middleware/auth";
import {container} from "../composition-root";
import {UsersControllerClass} from "../controllers/users-controller";

export const usersRouter = Router({})

const usersController = container.resolve(UsersControllerClass)

usersRouter.get('/', basicAuth, usersController.getAllUsers.bind(usersController))

usersRouter.post('/', basicAuth,
    //Input validation
    userDataValidator.loginCheck,
    userDataValidator.passwordCheck,
    userDataValidator.emailCheck,
    inputValidation,
    //Handlers
    usersController.createUser.bind(usersController))

usersRouter.delete('/:id', basicAuth, usersController.deleteUser.bind(usersController))