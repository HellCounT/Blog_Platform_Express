import {blogsRepo} from '../repositories/blogs-database'
import {BlogDbClass, BlogViewType} from "../types/types";
import {ObjectId} from "mongodb";

class BlogsServiceClass {
    async createBlog(title: string, desc: string, website: string): Promise<BlogViewType> {
        const newBlog = new BlogDbClass(
            new ObjectId(),
            title,
            desc,
            website,
            new Date().toISOString()
        )
        const result = await blogsRepo.createBlog(newBlog)
        return {
            id: result._id.toString(),
            ...newBlog
        }
    }
    async updateBlog(inputId: string, title: string, desc: string, website: string): Promise<boolean | null> {
        return await blogsRepo.updateBlog(inputId, title, desc, website)
    }
    async deleteBlog(inputId: string): Promise<boolean | null> {
        return await blogsRepo.deleteBlog(inputId)
    }
}

export const blogsService = new BlogsServiceClass()