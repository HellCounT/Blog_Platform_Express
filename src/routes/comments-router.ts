import {Router} from "express";
import {commentDataValidator, inputValidation, likeInputValidator} from "../middleware/data-validation";
import {authMiddleware} from "../middleware/auth-middleware";
import {commentsController} from "../composition-root";

export const commentsRouter = Router({})

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