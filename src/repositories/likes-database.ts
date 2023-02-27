import {CommentLikeInsertDbType, LikeStatus, PostLikeInsertDbType} from "../types/types";
import {LikeInCommentModelClass, LikeInPostModelClass} from "./db";

export const likesForCommentsRepo = {
    async createNewLike(newLike: CommentLikeInsertDbType): Promise<void> {
        const likeInCommentInstance = new LikeInCommentModelClass(newLike)
        await likeInCommentInstance.save()
        return
    },
    async updateLikeStatus(commentId: string, userId: string, likeStatus: LikeStatus): Promise<void> {
        const likeInCommentInstance = await LikeInCommentModelClass.findOne({
            commentId: commentId,
            userId: userId
        })
        if (likeInCommentInstance) {
            likeInCommentInstance.likeStatus = likeStatus
            await likeInCommentInstance.save()
            return
        } else return
    },
    async deleteAllLikesWhenCommentIsDeleted(commentId: string): Promise<void> {
        await LikeInCommentModelClass.deleteMany({commentId: commentId})
        return
    }
}

export const likesForPostsRepo = {
    async createNewLike(newLike: PostLikeInsertDbType): Promise<void> {
        const likeInPostInstance = new LikeInPostModelClass(newLike)
        await likeInPostInstance.save()
        return
    },
    async updateLikeStatus(postId: string, userId: string, likeStatus: LikeStatus): Promise<void> {
        const likeInPostInstance = await LikeInPostModelClass.findOne({
            postId: postId,
            userId: userId
        })
        if (likeInPostInstance) {
            likeInPostInstance.likeStatus = likeStatus
            await likeInPostInstance.save()
            return
        } else return
    },
    async deleteAllLikesWhenPostIsDeleted(postId: string): Promise<void> {
        await LikeInPostModelClass.deleteMany({postId: postId})
        return
    }
}