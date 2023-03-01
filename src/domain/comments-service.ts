import {commentsRepo} from "../repositories/comments-database";
import {CommentDbClass, CommentViewType, LikeStatus, StatusType} from "../types/types";
import {ObjectId} from "mongodb";
import {commentsQueryRepo, postsQueryRepo, usersQueryRepo} from "../repositories/queryRepo";
import {likesForCommentsService} from "./likes-service";

class CommentsServiceClass {
    async createComment(postId: string, userId: ObjectId, content: string): Promise<CommentViewType | null> {
        const foundUser = await usersQueryRepo.findUserById(userId)
        const foundPost = await postsQueryRepo.findPostById(postId, userId.toString())
        if (!foundUser || !foundPost) return null
        const newComment = new CommentDbClass(
            new ObjectId(),
            content,
            {
                userId: userId.toString(),
                userLogin: foundUser.accountData.login,
            },
            postId,
            new Date().toISOString(),
            {
                likesCount: 0,
                dislikesCount: 0
            }
        )
        return await commentsRepo.createComment(newComment)
    }

    async updateComment(commentId: string, userId: ObjectId, content: string): Promise<StatusType> {
        const foundComment = await commentsQueryRepo.findCommentById(commentId, userId.toString())
        if (!foundComment) return {status: "Not Found"}
        if (foundComment.commentatorInfo.userId === userId.toString()) {
            await commentsRepo.updateComment(commentId, content)
            return {
                status: "Updated",
                code: 204,
                message: "Comment has been updated"
            }
        } else return {
            status: "Forbidden",
            code: 403,
            message: "User is not allowed to edit other user's comment"
        }
    }

    async deleteComment(commentId: string, userId: ObjectId): Promise<StatusType> {
        const foundComment = await commentsQueryRepo.findCommentById(commentId, userId.toString())
        if (!foundComment) return {
            status: "Not Found",
            code: 404,
            message: "Comment is not found"
        }
        if (foundComment.commentatorInfo.userId === userId.toString()) {
            await commentsRepo.deleteComment(commentId)
            await likesForCommentsService.deleteAllLikesWhenCommentIsDeleted(commentId)
            return {
                status: "Deleted",
                code: 204,
                message: 'Comment has been deleted'
            }
        } else return {
            status: "Forbidden",
            code: 403,
            message: "User is not allowed to delete other user's comment"
        }
    }

    async updateLikeStatus(commentId: string, activeUserId: ObjectId, inputLikeStatus: LikeStatus): Promise<StatusType> {
        const foundComment = await commentsQueryRepo.findCommentById(commentId, activeUserId.toString())
        if (!foundComment) {
            return {
                status: "Not Found",
                code: 404,
                message: 'Comment is not found'
            }
        } else {
            const foundUserLike = await commentsQueryRepo.getUserLikeForComment(activeUserId.toString(), commentId)
            let currentLikesCount = foundComment.likesInfo.likesCount
            let currentDislikesCount = foundComment.likesInfo.dislikesCount
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
                await likesForCommentsService.createNewLike(commentId, activeUserId.toString(), inputLikeStatus)
                await commentsRepo.updateLikesCounters(currentLikesCount, currentDislikesCount, commentId)
                return {
                    status: "No content",
                    code: 204,
                    message: "Like has been created"
                }
            } else {
                await likesForCommentsService.updateLikeStatus(commentId, activeUserId.toString(), inputLikeStatus)
                await commentsRepo.updateLikesCounters(currentLikesCount, currentDislikesCount, commentId)
                return {
                    status: "No content",
                    code: 204,
                    message: "Like status has been updated"
                }
            }
        }

    }
}

export const commentsService = new CommentsServiceClass()