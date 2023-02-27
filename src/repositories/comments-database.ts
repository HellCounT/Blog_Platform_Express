import {ObjectId} from "mongodb";
import {commentsCollection, postsCollection, usersCollection} from "./db";
import {CommentCreateType, CommentInsertDbType, CommentViewType, LikeStatus} from "../types/types";

export const commentsRepo = {
    async createComment(newComment: CommentCreateType): Promise<CommentViewType | null> {
        const foundUser = await usersCollection.findOne({_id: new ObjectId(newComment.userId)})
        const foundPost = await postsCollection.findOne({_id: new ObjectId(newComment.postId)})
        if (foundPost && foundUser) {
            const mappedComment: CommentInsertDbType = {
                content: newComment.content,
                commentatorInfo: {
                    userId: newComment.userId,
                    userLogin: foundUser.accountData.login,
                },
                postId: newComment.postId,
                createdAt: newComment.createdAt,
                likesInfo: {
                    likesCount: 0,
                    dislikesCount: 0,
                }
            }
            const result = await commentsCollection.insertOne({...mappedComment})
            return {
                id: result.insertedId.toString(),
                content: mappedComment.content,
                commentatorInfo: {
                    userId: mappedComment.commentatorInfo.userId,
                    userLogin: mappedComment.commentatorInfo.userLogin,
                },
                createdAt: mappedComment.createdAt,
                likesInfo: {
                    likesCount: mappedComment.likesInfo.likesCount,
                    dislikesCount: mappedComment.likesInfo.dislikesCount,
                    myStatus: LikeStatus.none
                }
            }
        } else return null
    },
    async updateComment(commentId: string, content: string): Promise<boolean | null> {
        const foundComment = await commentsCollection.findOne({_id: new ObjectId(commentId)})
        if (!foundComment) return null
        else {
            const result = await commentsCollection.updateOne({_id: new ObjectId(commentId)},
                {
                    $set:
                        {
                            content: content
                        }
                })
            return result.matchedCount === 1
        }
    },
    async deleteComment(commentId: string): Promise<boolean | null> {
        if (ObjectId.isValid(commentId)) {
            const result = await commentsCollection.deleteOne({_id: new ObjectId(commentId)})
            return result.deletedCount === 1
        } else return null
    },
    async updateLikesCounters(newLikesCount: number, newDislikesCount: number, commentId: string) {
        await commentsCollection.updateOne({_id: new ObjectId(commentId)}, {
            $set:
                {
                    "likesInfo.likesCount": newLikesCount,
                    "likesInfo.dislikesCount": newDislikesCount
                }
        })
        return
    }
}