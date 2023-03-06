import {ObjectId} from "mongodb";
import {LikeStatus} from "../types/types";
import {BlogModelClass, PostModelClass} from "./db";
import {injectable} from "inversify";
import {PostDbType} from "../types/dbTypes";
import {PostViewType} from "../types/viewTypes";

@injectable()
export class PostsRepoClass {
    async createPost(newPost: PostDbType): Promise<PostViewType | null> {
            const postInstance = new PostModelClass(newPost)
            const saveResult = await postInstance.save()
            return {
                id: saveResult._id.toString(),
                title: saveResult.title,
                shortDescription: saveResult.shortDescription,
                content: saveResult.content,
                blogId: saveResult.blogId,
                blogName: saveResult.blogName,
                createdAt: saveResult.createdAt.toISOString(),
                extendedLikesInfo: {
                    likesCount: saveResult.likesInfo.likesCount,
                    dislikesCount: saveResult.likesInfo.dislikesCount,
                    myStatus: LikeStatus.none,
                    newestLikes: []
                }
            }
    }
    async updatePost(inputId: string, postTitle: string, short: string, text: string, blogId: string): Promise<boolean | null> {
        const foundBlog = await BlogModelClass.findOne({_id: new ObjectId(blogId)})
        if (!foundBlog) return null
        else {
            const postInstance = await PostModelClass.findOne({_id: new ObjectId(inputId)})
            if (!postInstance) return false
            postInstance.title = postTitle
            postInstance.shortDescription = short
            postInstance.content = text
            postInstance.blogId = blogId
            postInstance.blogName = foundBlog.name
            await postInstance.save()
            return true
        }
    }
    async deletePost(inputId: string): Promise<boolean | null> {
        if (ObjectId.isValid(inputId)) {
            const postInstance = await PostModelClass.findOne({_id: new ObjectId(inputId)})
            if (!postInstance) return false
            await postInstance.deleteOne()
            return true
        } else return null
    }
    async updateLikesCounters(newLikesCount: number, newDislikesCount: number, postId: string) {
        const postInstance = await PostModelClass.findOne({_id: new ObjectId(postId)})
        if (postInstance) {
            postInstance.likesInfo.likesCount = newLikesCount
            postInstance.likesInfo.dislikesCount = newDislikesCount
            await postInstance.save()
            return
        } else return
    }
}