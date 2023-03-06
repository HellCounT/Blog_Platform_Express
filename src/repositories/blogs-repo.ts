import {ObjectId} from "mongodb";
import {BlogModelClass, PostModelClass} from "./db";
import {injectable} from "inversify";
import {BlogDbType} from "../types/dbTypes";

@injectable()
export class BlogsRepoClass {
    async createBlog(newBlog: BlogDbType): Promise<BlogDbType> {
        const blogInstance = new BlogModelClass(newBlog)
        await blogInstance.save()
        return newBlog
    }

    async updateBlog(inputId: string, title: string, desc: string, website: string): Promise<boolean> {
        const blogInstance = await BlogModelClass.findOne({_id: new ObjectId(inputId)})
        if (!blogInstance) return false
        if (title) {
            blogInstance.name = title
            await PostModelClass.updateMany({blogId: inputId}, {
                $set:
                    {
                        blogName: title
                    }
            })
        }
        if (desc) blogInstance.description = desc
        if (website) blogInstance.websiteUrl = website
        await blogInstance.save()
        return true
    }

    async deleteBlog(inputId: string): Promise<boolean> {
        const blogInstance = await BlogModelClass.findOne({_id: new ObjectId(inputId)})
        if (!blogInstance) return false
        await blogInstance.deleteOne()
        return true
    }
}