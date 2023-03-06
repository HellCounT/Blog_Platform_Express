import {BlogDbClass, BlogViewType} from "../types/types";
import {ObjectId} from "mongodb";
import {BlogsRepoClass} from "../repositories/blogs-repo";
import {inject, injectable} from "inversify";

@injectable()
export class BlogsServiceClass {
    constructor(@inject(BlogsRepoClass) protected blogsRepo: BlogsRepoClass) {
    }
    async createBlog(title: string, desc: string, website: string): Promise<BlogViewType> {
        const newBlog = new BlogDbClass(
            new ObjectId(),
            title,
            desc,
            website,
            new Date().toISOString()
        )
        const result = await this.blogsRepo.createBlog(newBlog)
        return {
            id: result._id.toString(),
            ...newBlog
        }
    }
    async updateBlog(inputId: string, title: string, desc: string, website: string): Promise<boolean | null> {
        return await this.blogsRepo.updateBlog(inputId, title, desc, website)
    }
    async deleteBlog(inputId: string): Promise<boolean | null> {
        return await this.blogsRepo.deleteBlog(inputId)
    }
}