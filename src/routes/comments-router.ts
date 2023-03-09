import {Router} from "express";
import {commentDataValidator, inputValidation, likeInputValidator} from "../middleware/data-validation";
import {container} from "../composition-root";
import {CommentsControllerClass} from "../controllers/comments-controller";
import {AuthMiddleware} from "../middleware/auth-middleware";

export const commentsRouter = Router({})

const commentsController = container.resolve(CommentsControllerClass)
const authMiddleware = container.resolve(AuthMiddleware)

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