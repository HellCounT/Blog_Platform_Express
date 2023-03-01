import {Request, Response, Router} from "express";
import {commentDataValidator, inputValidation, likeInputValidator} from "../middleware/data-validation";
import {authMiddleware} from "../middleware/auth-middleware";
import {CommentsServiceClass} from "../domain/comments-service";
import {commentsQueryRepo} from "../repositories/queryRepo";

export const commentsRouter = Router({})

class CommentsControllerClass {
    private commentsService: CommentsServiceClass;
    constructor() {
        this.commentsService = new CommentsServiceClass()
    }
    async getCommentById(req: Request, res: Response) {
        const commentIdSearchResult = await commentsQueryRepo.findCommentById(req.params.id, req.user?._id.toString())
        if (commentIdSearchResult) return res.status(200).send(commentIdSearchResult)
        else res.sendStatus(404)
    }

    async updateComment(req: Request, res: Response) {
        const updateStatus = await this.commentsService.updateComment(req.params.commentId, req.user!._id, req.body.content)
        if (updateStatus.status === "Updated") res.sendStatus(204)
        if (updateStatus.status === "Not Found") res.sendStatus(404)
        if (updateStatus.status === "Forbidden") res.sendStatus(403)
    }

    async deleteComment(req: Request, res: Response) {
        const deleteStatus = await this.commentsService.deleteComment(req.params.commentId, req.user!._id)
        if (deleteStatus.status === "Deleted") res.sendStatus(204)
        if (deleteStatus.status === "Not Found") res.sendStatus(404)
        if (deleteStatus.status === "Forbidden") res.sendStatus(403)
    }

    async updateLikeStatus(req: Request, res: Response) {
        const result = await this.commentsService.updateLikeStatus(req.params.commentId, req.user?._id, req.body.likeStatus)
        if (result.status === 'No content') res.sendStatus(204)
        if (result.status === 'Not Found') res.sendStatus(404)
    }
}

const commentsController = new CommentsControllerClass()

commentsRouter.get('/:id',
    authMiddleware.parseUserIdByToken,
    commentsController.getCommentById.bind(commentsController))

commentsRouter.put('/:commentId',
    authMiddleware.checkCredentials,
    //InputValidation
    commentDataValidator.contentCheck,
    inputValidation,
    //Handlers
    commentsController.updateComment.bind(commentsController))

commentsRouter.delete('/:commentId',
    authMiddleware.checkCredentials,
    //Handlers
    commentsController.deleteComment.bind(commentsController))

commentsRouter.put('/:commentId/like-status',
    authMiddleware.checkCredentials,
    likeInputValidator,
    inputValidation,
    //Handlers
    commentsController.updateLikeStatus.bind(commentsController))