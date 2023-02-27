import {Request, Response, Router} from "express";
import {
    activeSessionsCollection,
    blogsCollection,
    commentsCollection,
    expiredTokensCollection, likesInCommentsCollection,
    postsCollection,
    usersCollection
} from "../repositories/db";

export const deleteAllRouter = Router({})

deleteAllRouter.delete('/all-data', async (req: Request, res: Response) => {
    await blogsCollection.deleteMany({})
    await postsCollection.deleteMany({})
    await usersCollection.deleteMany({})
    await commentsCollection.deleteMany({})
    await expiredTokensCollection.deleteMany({})
    await activeSessionsCollection.deleteMany({})
    await likesInCommentsCollection.deleteMany({})
    res.sendStatus(204)
})