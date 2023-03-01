import {CommentLikeDbClass, LikeStatus, PostLikeDbClass} from "../types/types";
import {likesForCommentsRepo, likesForPostsRepo} from "../repositories/likes-database";
import {ObjectId} from "mongodb";

class LikesForCommentsServiceClass {
    async createNewLike(commentId: string, userId: string, likeStatus: LikeStatus): Promise<void> {
        const newLike = new CommentLikeDbClass(
            new ObjectId(),
            commentId,
            userId,
            likeStatus
        )
        await likesForCommentsRepo.createNewLike(newLike)
        return
    }
    async updateLikeStatus(commentId: string, userId: string, likeStatus: LikeStatus): Promise<void> {
        await likesForCommentsRepo.updateLikeStatus(commentId, userId, likeStatus)
        return
    }
    async deleteAllLikesWhenCommentIsDeleted(commentId: string): Promise<void> {
        await likesForCommentsRepo.deleteAllLikesWhenCommentIsDeleted(commentId)
        return
    }
}
class LikesForPostsServiceClass {
    async createNewLike(postId: string, userId: string, userLogin: string, likeStatus: LikeStatus): Promise<void> {
        const newLike = new PostLikeDbClass(
            new ObjectId(),
            postId,
            userId,
            userLogin,
            new Date(),
            likeStatus
        )
        await likesForPostsRepo.createNewLike(newLike)
        return
    }
    async updateLikeStatus(postId: string, userId: string, likeStatus: LikeStatus): Promise<void> {
        await likesForPostsRepo.updateLikeStatus(postId, userId, likeStatus)
        return
    }
    async deleteAllLikesWhenPostIsDeleted(postId: string): Promise<void> {
        await likesForPostsRepo.deleteAllLikesWhenPostIsDeleted(postId)
        return
    }
}

export const likesForCommentsService = new LikesForCommentsServiceClass()
export const likesForPostsService = new LikesForPostsServiceClass()