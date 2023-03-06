import {UsersServiceClass} from "../domain/users-service";
import {Request, Response} from "express";
import {UserQueryParser} from "../types/types";
import {parseUserQueryPagination} from "../application/queryParsers";
import {usersQueryRepo} from "../repositories/query-repo";
import {inject, injectable} from "inversify";

@injectable()
export class UsersControllerClass {
    constructor(@inject(UsersServiceClass) protected usersService: UsersServiceClass) {
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