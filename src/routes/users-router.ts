import {Request, Response, Router} from "express";
import {usersQueryRepo} from "../repositories/queryRepo";
import {inputValidation, userDataValidator} from "../middleware/data-validation";
import {usersService} from "../domain/users-service";
import {basicAuth} from "../middleware/auth";
import {parseUserQueryPagination} from "../application/queryParsers";
import {UserQueryParser} from "../types/types";

export const usersRouter = Router({})

class UsersControllerClass {
    async getAllUsers(req: Request, res: Response) {
        // query validation and parsing
        let queryParams: UserQueryParser = parseUserQueryPagination(req)
        res.status(200).send(await usersQueryRepo.viewAllUsers(queryParams))
    }

    async createUser(req: Request, res: Response) {
        //User creation
        const userCreationResult = await usersService.createUser(req.body.login, req.body.password, req.body.email)
        if (!userCreationResult) res.sendStatus(400)
        return res.status(201).send(userCreationResult)
    }

    async deleteUser(req: Request, res: Response) {
        if (await usersService.deleteUser(req.params.id)) {
            res.sendStatus(204)
        } else {
            res.sendStatus(404)
        }
    }
}

const userController = new UsersControllerClass()

usersRouter.get('/', basicAuth, userController.getAllUsers)

usersRouter.post('/', basicAuth,
    //Input validation
    userDataValidator.loginCheck,
    userDataValidator.passwordCheck,
    userDataValidator.emailCheck,
    inputValidation,
    //Handlers
    userController.createUser)

usersRouter.delete('/:id', basicAuth, userController.deleteUser)