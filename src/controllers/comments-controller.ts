import {CommentsServiceClass} from "../domain/comments-service";
import {Request, Response} from "express";
import {commentsQueryRepo} from "../repositories/query-repo";
import {inject, injectable} from "inversify";

@injectable()
export class CommentsControllerClass {
    constructor(@inject(CommentsServiceClass) protected commentsService: CommentsServiceClass) {
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