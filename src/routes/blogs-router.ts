import {Request, Response, Router} from "express";
import {basicAuth} from "../middleware/auth";
import {
    blogDataValidator,
    paramIdInputValidation,
    inputValidation,
    postDataValidator
} from "../middleware/data-validation";
import {blogsService} from "../domain/blogs-service";
import {blogsQueryRepo, postsQueryRepo} from "../repositories/queryRepo";
import {postsService} from "../domain/posts-service";
import {QueryParser} from "../types/types";
import {parseQueryPagination} from "../application/queryParsers";
import {parseUserIdByToken} from "../middleware/auth-middleware";

export const blogsRouter = Router({})


blogsRouter.get('/', async (req: Request, res: Response) => {
    // query validation and parsing
    let queryParams: QueryParser = parseQueryPagination(req)
    res.status(200).send(await blogsQueryRepo.viewAllBlogs(queryParams));
})

blogsRouter.get('/:id', async (req: Request, res: Response) => {
    const blogIdSearchResult = await blogsQueryRepo.findBlogById(req.params.id)
    if (blogIdSearchResult) {
        res.status(200).send(blogIdSearchResult)
    } else {
        res.sendStatus(404)
    }
})

blogsRouter.get('/:id/posts',
    //InputValidation
    parseUserIdByToken,
    postDataValidator.blogIdParamCheck,
    paramIdInputValidation,
    //Handlers
    async (req: Request, res: Response) => {
        let queryParams: QueryParser = parseQueryPagination(req)
        const postsByBlogIdSearchResult = await postsQueryRepo.findPostsByBlogId(req.params.id, queryParams, req.user?._id.toString())
        if (postsByBlogIdSearchResult) {
            res.status(200).send(postsByBlogIdSearchResult)
        } else {
            res.sendStatus(404)
        }
    })

blogsRouter.post('/', basicAuth,
    //Input validation
    blogDataValidator.nameCheck,
    blogDataValidator.descriptionCheck,
    blogDataValidator.urlCheck,
    inputValidation,
    //Handlers
    async (req: Request, res: Response) => {
        // Blog adding
        const blogAddResult = await blogsService.createBlog(req.body.name, req.body.description, req.body.websiteUrl)
        return res.status(201).send(blogAddResult)
    })

blogsRouter.post('/:id/posts', basicAuth,
    //Input validation
    postDataValidator.blogIdParamCheck,
    paramIdInputValidation,
    postDataValidator.titleCheck,
    postDataValidator.shortDescriptionCheck,
    postDataValidator.contentCheck,
    inputValidation,
    //Handlers
    async (req: Request, res: Response) => {
        const postAddResult = await postsService.createPost(req.body.title, req.body.shortDescription, req.body.content, req.params.id)
        if (postAddResult) {
            res.status(201).send(postAddResult)
        } else {
            res.sendStatus(400)
        }
    }
)

blogsRouter.put('/:id', basicAuth,
    //Input validation
    blogDataValidator.nameCheck,
    blogDataValidator.descriptionCheck,
    blogDataValidator.urlCheck,
    inputValidation,
    //Handlers
    async (req: Request, res: Response) => {
        const flagUpdate = await blogsService.updateBlog(req.params.id, req.body.name, req.body.description, req.body.websiteUrl)
        if (flagUpdate) {
            res.sendStatus(204)
        } else {
            res.sendStatus(404)
        }
    })

blogsRouter.delete('/:id', basicAuth, async (req: Request, res: Response) => {
    if (await blogsService.deleteBlog(req.params.id)) {
        res.sendStatus(204)
    } else {
        res.sendStatus(404)
    }
})