import {ObjectId} from "mongodb";
import {BlogDbType} from "../types/types";
import {postsService} from "../domain/posts-service";
import {BlogModelClass, PostModelClass} from "./db";

export const blogsRepo = {
    async createBlog(newBlog: BlogDbType): Promise<BlogDbType> {
        const blogInstance = new PostModelClass(newBlog)
        await blogInstance.save()
        return newBlog
    },
    async updateBlog(inputId: string, title: string, desc: string, website: string): Promise<boolean> {
        if (title) await postsService.updateBlogNameInAllRelatedPosts(inputId, title)
        const blogInstance = await BlogModelClass.findOne({_id: new ObjectId(inputId)})
        if (!blogInstance) return false
        blogInstance.name = title
        blogInstance.description = desc
        blogInstance.websiteUrl = website
        await blogInstance.save()
        return true
    },
    async deleteBlog(inputId: string): Promise<boolean> {
        const blogInstance = await BlogModelClass.findOne({_id: new ObjectId(inputId)})
        if (!blogInstance) return false
        await blogInstance.deleteOne()
        return true
    }
}