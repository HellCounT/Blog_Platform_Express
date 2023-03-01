import {Router} from "express";
import {basicAuth} from "../middleware/auth";
import {
    commentDataValidator,
    inputValidation,
    likeInputValidator,
    paramIdInputValidation,
    postDataValidator
} from "../middleware/data-validation";
import {authMiddleware} from "../middleware/auth-middleware";
import {postsController} from "../composition-root";


export const postsRouter = Router({})

postsRouter.get('/',
    authMiddleware.parseUserIdByToken,
    postsController.getAllPosts.bind(postsController))

postsRouter.get('/:id',
    authMiddleware.parseUserIdByToken,
    postsController.getPostById.bind(postsController))

postsRouter.get('/:postId/comments',
    //Input validation
    commentDataValidator.postIdParamCheck,
    paramIdInputValidation,
    authMiddleware.parseUserIdByToken,
    //Handlers
    postsController.getCommentsByPostId.bind(postsController))

postsRouter.post('/', basicAuth,
    //Input validation
    postDataValidator.titleCheck,
    postDataValidator.shortDescriptionCheck,
    postDataValidator.contentCheck,
    postDataValidator.blogIdCheck,
    inputValidation,
    //Handlers
    postsController.createPost.bind(postsController))

postsRouter.post('/:postId/comments',
    authMiddleware.checkCredentials,
    commentDataValidator.postIdParamCheck,
    paramIdInputValidation,
    commentDataValidator.contentCheck,
    inputValidation,
    postsController.createComment.bind(postsController))

postsRouter.put('/:id', basicAuth,
    //Input validation
    postDataValidator.titleCheck,
    postDataValidator.shortDescriptionCheck,
    postDataValidator.contentCheck,
    postDataValidator.blogIdCheck,
    inputValidation,
    //Handlers
    postsController.updatePost.bind(postsController))

postsRouter.delete('/:id', basicAuth, postsController.deletePost.bind(postsController))

postsRouter.put('/:postId/like-status',
    authMiddleware.checkCredentials,
    likeInputValidator,
    inputValidation,
    postsController.updateLikeStatus.bind(postsController))