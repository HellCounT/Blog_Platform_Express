import {CommentLikeInsertDbType, LikeStatus, PostLikeInsertDbType} from "../types/types";
import {likesInCommentsCollection, likesInPostsCollection} from "./db";

export const likesForCommentsRepo = {
    async createNewLike(NewLike: CommentLikeInsertDbType): Promise<void> {
        await likesInCommentsCollection.insertOne(NewLike)
        return
    },
    async updateLikeStatus(commentId: string, userId: string, likeStatus: LikeStatus): Promise<void> {
        await likesInCommentsCollection.updateOne({
            commentId: commentId,
            userId: userId
        }, {
            $set: {
                likeStatus: likeStatus
            }
        })
        return
    },
    async deleteAllLikesWhenCommentIsDeleted(commentId: string): Promise<void> {
        await likesInCommentsCollection.deleteMany({commentId: commentId})
        return
    }
}

export const likesForPostsRepo = {
    async createNewLike(NewLike: PostLikeInsertDbType): Promise<void> {
        await likesInPostsCollection.insertOne(NewLike)
        return
    },
    async updateLikeStatus(postId: string, userId: string, likeStatus: LikeStatus): Promise<void> {
        await likesInPostsCollection.updateOne({
            postId: postId,
            userId: userId
        }, {
            $set: {
                likeStatus: likeStatus
            }
        })
    },
    async deleteAllLikesWhenPostIsDeleted(postId: string): Promise<void> {
        await likesInPostsCollection.deleteMany({postId: postId})
        return
    }
}