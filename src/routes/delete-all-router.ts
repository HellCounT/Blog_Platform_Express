import {Request, Response, Router} from "express";
import {
    ActiveSessionModelClass,
    BlogModelClass,
    CommentModelClass,
    ExpiredTokenModelClass, LikeInCommentModelClass, LikeInPostModelClass,
    PostModelClass,
    UserModelClass
} from "../repositories/db";

export const deleteAllRouter = Router({})

deleteAllRouter.delete('/all-data', async (req: Request, res: Response) => {
    await BlogModelClass.deleteMany({})
    await PostModelClass.deleteMany({})
    await UserModelClass.deleteMany({})
    await CommentModelClass.deleteMany({})
    await ExpiredTokenModelClass.deleteMany({})
    await ActiveSessionModelClass.deleteMany({})
    await LikeInCommentModelClass.deleteMany({})
    await LikeInPostModelClass.deleteMany({})
    res.sendStatus(204)
})