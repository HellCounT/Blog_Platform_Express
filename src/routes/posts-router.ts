import {Request, Response, Router} from "express";
import {basicAuth} from "../middleware/auth";
import {
    postDataValidator,
    inputValidation,
    commentDataValidator,
    paramIdInputValidation, likeInputValidator
} from "../middleware/data-validation";
import {parseQueryPagination} from "../application/queryParsers";
import {QueryParser} from "../types/types";
import {authMiddleware} from "../middleware/auth-middleware";
import {PostServiceClass} from "../domain/posts-service";
import {CommentsServiceClass} from "../domain/comments-service";
import {commentsQueryRepo, postsQueryRepo} from "../repositories/queryRepo";


export const postsRouter = Router({})

class PostsControllerClass {
    private postsService: PostServiceClass;
    private commentsService: CommentsServiceClass;
    constructor() {
        this.postsService = new PostServiceClass()
        this.commentsService = new CommentsServiceClass()
    }
    async getAllPosts(req: Request, res: Response) {
        // query validation and parsing
        let queryParams: QueryParser = parseQueryPagination(req)
        res.status(200).send(await postsQueryRepo.viewAllPosts(queryParams, req.user?._id.toString()))
    }

    async getPostById(req: Request, res: Response) {
        const postIdSearchResult = await postsQueryRepo.findPostById(req.params.id, req.user?._id.toString())
        if (postIdSearchResult) {
            res.status(200).send(postIdSearchResult)
        } else {
            res.sendStatus(404)
        }
    }

    async getCommentsByPostId(req: Request, res: Response) {
        // query validation and parsing
        let queryParams = parseQueryPagination(req)
        const commentsByPostIdSearchResult = await commentsQueryRepo.findCommentsByPostId(req.params.postId, queryParams, req.user?._id.toString())
        if (commentsByPostIdSearchResult) res.status(200).send(commentsByPostIdSearchResult)
        else res.sendStatus(404)
    }

    async createPost(req: Request, res: Response) {
        const postAddResult = await this.postsService.createPost(req.body.title, req.body.shortDescription, req.body.content, req.body.blogId)
        if (postAddResult) {
            res.status(201).send(postAddResult)
        } else {
            res.sendStatus(400)
        }
    }

    async createComment(req: Request, res: Response) {
        const createdComment = await this.commentsService.createComment(req.params.postId, req.user!._id, req.body.content)
        if (createdComment) return res.status(201).send(createdComment)
        else res.status(400)
    }

    async updatePost(req: Request, res: Response) {
        const flagUpdate = await this.postsService.updatePost(req.params.id, req.body.title, req.body.shortDescription, req.body.content, req.body.blogId)
        if (flagUpdate) {
            res.sendStatus(204)
        } else {
            res.sendStatus(404)
        }
    }

    async deletePost(req: Request, res: Response) {
        if (await this.postsService.deletePost(req.params.id)) {
            res.sendStatus(204)
        } else {
            res.sendStatus(404)
        }
    }

    async updateLikeStatus(req: Request, res: Response) {
        const result = await this.postsService.updateLikeStatus(req.params.postId, req.user?._id, req.user?.accountData.login, req.body.likeStatus)
        if (result.status === 'No content') res.sendStatus(204)
        if (result.status === 'Not Found') res.sendStatus(404)
    }
}

const postController = new PostsControllerClass()

postsRouter.get('/',
    authMiddleware.parseUserIdByToken,
    postController.getAllPosts.bind(postController))

postsRouter.get('/:id',
    authMiddleware.parseUserIdByToken,
    postController.getPostById.bind(postController))

postsRouter.get('/:postId/comments',
    //Input validation
    commentDataValidator.postIdParamCheck,
    paramIdInputValidation,
    authMiddleware.parseUserIdByToken,
    //Handlers
    postController.getCommentsByPostId.bind(postController))

postsRouter.post('/', basicAuth,
    //Input validation
    postDataValidator.titleCheck,
    postDataValidator.shortDescriptionCheck,
    postDataValidator.contentCheck,
    postDataValidator.blogIdCheck,
    inputValidation,
    //Handlers
    postController.createPost.bind(postController))

postsRouter.post('/:postId/comments',
    authMiddleware.checkCredentials,
    commentDataValidator.postIdParamCheck,
    paramIdInputValidation,
    commentDataValidator.contentCheck,
    inputValidation,
    postController.createComment.bind(postController))

postsRouter.put('/:id', basicAuth,
    //Input validation
    postDataValidator.titleCheck,
    postDataValidator.shortDescriptionCheck,
    postDataValidator.contentCheck,
    postDataValidator.blogIdCheck,
    inputValidation,
    //Handlers
    postController.updatePost.bind(postController))

postsRouter.delete('/:id', basicAuth, postController.deletePost.bind(postController))

postsRouter.put('/:postId/like-status',
    authMiddleware.checkCredentials,
    likeInputValidator,
    inputValidation,
    postController.updateLikeStatus.bind(postController))