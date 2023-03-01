import {PostServiceClass} from "../domain/posts-service";
import {BlogsServiceClass} from "../domain/blogs-service";
import {Request, Response} from "express";
import {QueryParser} from "../types/types";
import {parseQueryPagination} from "../application/queryParsers";
import {blogsQueryRepo, postsQueryRepo} from "../repositories/queryRepo";

export class BlogsControllerClass {
    constructor(protected blogsService: BlogsServiceClass,
                protected postsService: PostServiceClass) {
    }

    async getAllBlogs(req: Request, res: Response) {
        // query validation and parsing
        let queryParams: QueryParser = parseQueryPagination(req)
        res.status(200).send(await blogsQueryRepo.viewAllBlogs(queryParams));
    }

    async getBlogById(req: Request, res: Response) {
        const blogIdSearchResult = await blogsQueryRepo.findBlogById(req.params.id)
        if (blogIdSearchResult) {
            res.status(200).send(blogIdSearchResult)
        } else {
            res.sendStatus(404)
        }
    }

    async getPostsForBlogId(req: Request, res: Response) {
        let queryParams: QueryParser = parseQueryPagination(req)
        const postsByBlogIdSearchResult = await postsQueryRepo.findPostsByBlogId(req.params.id, queryParams, req.user?._id.toString())
        if (postsByBlogIdSearchResult) {
            res.status(200).send(postsByBlogIdSearchResult)
        } else {
            res.sendStatus(404)
        }
    }

    async createBlog(req: Request, res: Response) {
        // Blog adding
        const blogAddResult = await this.blogsService.createBlog(req.body.name, req.body.description, req.body.websiteUrl)
        return res.status(201).send(blogAddResult)
    }

    async createPostForBlogId(req: Request, res: Response) {
        const postAddResult = await this.postsService.createPost(req.body.title, req.body.shortDescription, req.body.content, req.params.id)
        if (postAddResult) {
            res.status(201).send(postAddResult)
        } else {
            res.sendStatus(400)
        }
    }

    async updateBlog(req: Request, res: Response) {
        const flagUpdate = await this.blogsService.updateBlog(req.params.id, req.body.name, req.body.description, req.body.websiteUrl)
        if (flagUpdate) {
            res.sendStatus(204)
        } else {
            res.sendStatus(404)
        }
    }

    async deleteBlog(req: Request, res: Response) {
        if (await this.blogsService.deleteBlog(req.params.id)) {
            res.sendStatus(204)
        } else {
            res.sendStatus(404)
        }
    }
}