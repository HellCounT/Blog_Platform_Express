import {LikeStatus, StatusType} from "../types/types";
import {ObjectId} from "mongodb";
import {PostsRepoClass} from "../repositories/posts-repo";
import {LikesForPostsServiceClass} from "./likes-service";
import {BlogsQueryRepo, PostsQueryRepo} from "../repositories/query-repo";
import {inject, injectable} from "inversify";
import {PostDbClass} from "../types/dbClasses";
import {PostViewType} from "../types/viewTypes";

@injectable()
export class PostServiceClass {
    constructor(@inject(PostsRepoClass) protected postsRepo: PostsRepoClass,
                @inject(LikesForPostsServiceClass) protected likesForPostsService: LikesForPostsServiceClass,
                @inject(BlogsQueryRepo) protected blogsQueryRepo: BlogsQueryRepo,
                @inject(PostsQueryRepo) protected postsQueryRepo: PostsQueryRepo) {
    }
    async createPost(postTitle: string, short: string, text: string, blogId: string): Promise<PostViewType | null> {
        const foundBlog = await this.blogsQueryRepo.findBlogById(blogId)
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
        return await this.postsRepo.createPost(newPost)
    }

    async updatePost(inputId: string, postTitle: string, short: string, text: string, blogId: string): Promise<boolean | null> {
        return await this.postsRepo.updatePost(inputId, postTitle, short, text, blogId)
    }

    async deletePost(inputId: string): Promise<boolean | null> {
        await this.likesForPostsService.deleteAllLikesWhenPostIsDeleted(inputId)
        return await this.postsRepo.deletePost(inputId)
    }

    async updateLikeStatus(postId: string, activeUserId: ObjectId, activeUserLogin: string, inputLikeStatus: LikeStatus): Promise<StatusType> {
        const foundPost = await this.postsQueryRepo.findPostById(postId, activeUserId.toString())
        if (!foundPost) {
            return {
                status: "Not Found",
                code: 404,
                message: 'Comment is not found'
            }
        } else {
            const foundUserLike = await this.postsQueryRepo.getUserLikeForPost(activeUserId.toString(), postId)
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
                await this.likesForPostsService.createNewLike(postId, activeUserId.toString(), activeUserLogin, inputLikeStatus)
                await this.postsRepo.updateLikesCounters(currentLikesCount, currentDislikesCount, postId)
                return {
                    status: "No content",
                    code: 204,
                    message: "Like has been created"
                }
            } else {
                await this.likesForPostsService.updateLikeStatus(postId, activeUserId.toString(), inputLikeStatus)
                await this.postsRepo.updateLikesCounters(currentLikesCount, currentDislikesCount, postId)
                return {
                    status: "No content",
                    code: 204,
                    message: "Like status has been updated"
                }
            }
        }
    }
}