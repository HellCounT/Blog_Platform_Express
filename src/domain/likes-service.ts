import {LikeStatus} from "../types/types";
import {ObjectId} from "mongodb";
import {LikesForCommentsRepoClass, LikesForPostsRepoClass} from "../repositories/likes-repo";
import {inject, injectable} from "inversify";
import {CommentLikeDbClass, PostLikeDbClass} from "../types/dbClasses";

@injectable()
export class LikesForCommentsServiceClass {
    constructor(@inject(LikesForCommentsRepoClass) protected likesForCommentsRepo: LikesForCommentsRepoClass) {
    }
    async createNewLike(commentId: string, userId: string, likeStatus: LikeStatus): Promise<void> {
        const newLike = new CommentLikeDbClass(
            new ObjectId(),
            commentId,
            userId,
            likeStatus
        )
        await this.likesForCommentsRepo.createNewLike(newLike)
        return
    }
    async updateLikeStatus(commentId: string, userId: string, likeStatus: LikeStatus): Promise<void> {
        await this.likesForCommentsRepo.updateLikeStatus(commentId, userId, likeStatus)
        return
    }
    async deleteAllLikesWhenCommentIsDeleted(commentId: string): Promise<void> {
        await this.likesForCommentsRepo.deleteAllLikesWhenCommentIsDeleted(commentId)
        return
    }
}

@injectable()
export class LikesForPostsServiceClass {
    constructor(@inject(LikesForPostsRepoClass) protected likesForPostsRepo: LikesForPostsRepoClass) {
    }
    async createNewLike(postId: string, userId: string, userLogin: string, likeStatus: LikeStatus): Promise<void> {
        const newLike = new PostLikeDbClass(
            new ObjectId(),
            postId,
            userId,
            userLogin,
            new Date(),
            likeStatus
        )
        await this.likesForPostsRepo.createNewLike(newLike)
        return
    }
    async updateLikeStatus(postId: string, userId: string, likeStatus: LikeStatus): Promise<void> {
        await this.likesForPostsRepo.updateLikeStatus(postId, userId, likeStatus)
        return
    }
    async deleteAllLikesWhenPostIsDeleted(postId: string): Promise<void> {
        await this.likesForPostsRepo.deleteAllLikesWhenPostIsDeleted(postId)
        return
    }
}