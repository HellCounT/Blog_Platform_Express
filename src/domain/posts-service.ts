import {postsRepo} from "../repositories/posts-database";
import {LikeStatus, PostDbClass, PostViewType, StatusType} from "../types/types";
import {ObjectId} from "mongodb";
import {blogsQueryRepo, postsQueryRepo} from "../repositories/queryRepo";
import {likesForPostsService} from "./likes-service";

class PostServiceClass {
    async createPost(postTitle: string, short: string, text: string, blogId: string): Promise<PostViewType | null> {
        const foundBlog = await blogsQueryRepo.findBlogById(blogId)
        if (!foundBlog) return null
        const newPost = new PostDbClass(
            new ObjectId(),
            postTitle,
            short,
            text,
            blogId,
            foundBlog.name,
            new Date(),
            {
                likesCount: 0,
                dislikesCount: 0
            }
        )
        return await postsRepo.createPost(newPost)
    }

    async updatePost(inputId: string, postTitle: string, short: string, text: string, blogId: string): Promise<boolean | null> {
        return await postsRepo.updatePost(inputId, postTitle, short, text, blogId)
    }

    async deletePost(inputId: string): Promise<boolean | null> {
        await likesForPostsService.deleteAllLikesWhenPostIsDeleted(inputId)
        return await postsRepo.deletePost(inputId)
    }

    async updateBlogNameInAllRelatedPosts(blogId: string, blogName: string): Promise<void> {
        return await postsRepo.updateBlogNameInAllRelatedPosts(blogId, blogName)
    }

    async updateLikeStatus(postId: string, activeUserId: ObjectId, activeUserLogin: string, inputLikeStatus: LikeStatus): Promise<StatusType> {
        const foundPost = await postsQueryRepo.findPostById(postId, activeUserId.toString())
        if (!foundPost) {
            return {
                status: "Not Found",
                code: 404,
                message: 'Comment is not found'
            }
        } else {
            const foundUserLike = await postsQueryRepo.getUserLikeForPost(activeUserId.toString(), postId)
            let currentLikesCount = foundPost.extendedLikesInfo.likesCount
            let currentDislikesCount = foundPost.extendedLikesInfo.dislikesCount
            switch (inputLikeStatus) {
                case (LikeStatus.like):
                    if (!foundUserLike || foundUserLike.likeStatus === LikeStatus.none) {
                        currentLikesCount++
                        break
                    }
                    if (foundUserLike.likeStatus === LikeStatus.dislike) {
                        currentLikesCount++
                        currentDislikesCount--
                        break
                    }
                    break
                case (LikeStatus.dislike):
                    if (!foundUserLike || foundUserLike.likeStatus === LikeStatus.none) {
                        currentDislikesCount++
                        break
                    }
                    if (foundUserLike.likeStatus === LikeStatus.like) {
                        currentLikesCount--
                        currentDislikesCount++
                        break
                    }
                    break
                case (LikeStatus.none):
                    if (foundUserLike?.likeStatus === LikeStatus.like) {
                        currentLikesCount--
                        break
                    }
                    if (foundUserLike?.likeStatus === LikeStatus.dislike) {
                        currentDislikesCount--
                        break
                    }
                    break
            }
            if (!foundUserLike) {
                await likesForPostsService.createNewLike(postId, activeUserId.toString(), activeUserLogin, inputLikeStatus)
                await postsRepo.updateLikesCounters(currentLikesCount, currentDislikesCount, postId)
                return {
                    status: "No content",
                    code: 204,
                    message: "Like has been created"
                }
            } else {
                await likesForPostsService.updateLikeStatus(postId, activeUserId.toString(), inputLikeStatus)
                await postsRepo.updateLikesCounters(currentLikesCount, currentDislikesCount, postId)
                return {
                    status: "No content",
                    code: 204,
                    message: "Like status has been updated"
                }
            }
        }
    }
}

export const postsService = new PostServiceClass()