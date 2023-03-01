import {Router} from "express";
import {inputValidation, userDataValidator} from "../middleware/data-validation";
import {basicAuth} from "../middleware/auth";
import {usersController} from "../composition-root";

export const usersRouter = Router({})

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