import {ObjectId} from "mongodb";
import {LikeStatus, PostCreateType, PostViewType} from "../types/types";
import {BlogModelClass, PostModelClass} from "./db";

class PostsRepoClass {
    async createPost(newPost: PostCreateType): Promise<PostViewType | null> {
        const foundBlog = await BlogModelClass.findOne({_id: new ObjectId(newPost.blogId)})
        if (foundBlog) {
            const mappedPost = {
                title: newPost.title,
                shortDescription: newPost.shortDescription,
                content: newPost.content,
                blogId: newPost.blogId,
                blogName: foundBlog.name,
                createdAt: newPost.createdAt,
                likesInfo: {
                    likesCount: 0,
                    dislikesCount: 0
                }
            }
            const postInstance = new PostModelClass(mappedPost)
            const saveResult = await postInstance.save()
            return {
                id: saveResult._id.toString(),
                title: mappedPost.title,
                shortDescription: mappedPost.shortDescription,
                content: mappedPost.content,
                blogId: mappedPost.blogId,
                blogName: mappedPost.blogName,
                createdAt: mappedPost.createdAt.toISOString(),
                extendedLikesInfo: {
                    likesCount: mappedPost.likesInfo.likesCount,
                    dislikesCount: mappedPost.likesInfo.dislikesCount,
                    myStatus: LikeStatus.none,
                    newestLikes: []
                }
            }
        } else return null
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
    async updateBlogNameInAllRelatedPosts(blogId: string, blogName: string): Promise<void> {
        await PostModelClass.updateMany({blogId: blogId}, {$set:
                {
                    blogName: blogName
                }})
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

export const postsRepo = new PostsRepoClass()