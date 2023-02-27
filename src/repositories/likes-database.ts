import {CommentLikeInsertDbType, LikeStatus, PostLikeInsertDbType} from "../types/types";
import {LikeInCommentClass, LikeInPostClass} from "./db";

export const likesForCommentsRepo = {
    async createNewLike(newLike: CommentLikeInsertDbType): Promise<void> {
        const likeInCommentInstance = new LikeInCommentClass(newLike)
        await likeInCommentInstance.save()
        return
    },
    async updateLikeStatus(commentId: string, userId: string, likeStatus: LikeStatus): Promise<void> {
        const likeInCommentInstance = await LikeInCommentClass.findOne({
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
        await LikeInCommentClass.deleteMany({commentId: commentId})
        return
    }
}

export const likesForPostsRepo = {
    async createNewLike(newLike: PostLikeInsertDbType): Promise<void> {
        const likeInPostInstance = new LikeInPostClass(newLike)
        await likeInPostInstance.save()
        return
    },
    async updateLikeStatus(postId: string, userId: string, likeStatus: LikeStatus): Promise<void> {
        const likeInPostInstance = await LikeInPostClass.findOne({
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
        await LikeInPostClass.deleteMany({postId: postId})
        return
    }
}