import {Request, Response, Router} from "express";

export const deleteAllRouter = Router({})

deleteAllRouter.delete('/all-data', async (req: Request, res: Response) => {
    await blogsCollection.deleteMany({})
    await postsCollection.deleteMany({})
    await usersCollection.deleteMany({})
    await commentsCollection.deleteMany({})
    await expiredTokensCollection.deleteMany({})
    await activeSessionsCollection.deleteMany({})
    await likesInCommentsCollection.deleteMany({})
    await likesInPostsCollection.deleteMany({})
    res.sendStatus(204)
})