import {Request, Response, Router} from "express";
import {inputValidation, userDataValidator} from "../middleware/data-validation";
import {UsersServiceClass} from "../domain/users-service";
import {basicAuth} from "../middleware/auth";
import {parseUserQueryPagination} from "../application/queryParsers";
import {UserQueryParser} from "../types/types";
import {usersQueryRepo} from "../repositories/queryRepo";

export const usersRouter = Router({})

class UsersControllerClass {
    private usersService: UsersServiceClass;
    constructor() {
        this.usersService = new UsersServiceClass()
    }
    async getAllUsers(req: Request, res: Response) {
        // query validation and parsing
        let queryParams: UserQueryParser = parseUserQueryPagination(req)
        res.status(200).send(await usersQueryRepo.viewAllUsers(queryParams))
    }

    async createUser(req: Request, res: Response) {
        //User creation
        const userCreationResult = await this.usersService.createUser(req.body.login, req.body.password, req.body.email)
        if (!userCreationResult) res.sendStatus(400)
        return res.status(201).send(userCreationResult)
    }

    async deleteUser(req: Request, res: Response) {
        if (await this.usersService.deleteUser(req.params.id)) {
            res.sendStatus(204)
        } else {
            res.sendStatus(404)
        }
    }
}

const userController = new UsersControllerClass()

usersRouter.get('/', basicAuth, userController.getAllUsers.bind(userController))

usersRouter.post('/', basicAuth,
    //Input validation
    userDataValidator.loginCheck,
    userDataValidator.passwordCheck,
    userDataValidator.emailCheck,
    inputValidation,
    //Handlers
    userController.createUser.bind(userController))

usersRouter.delete('/:id', basicAuth, userController.deleteUser.bind(userController))