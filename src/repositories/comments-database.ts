import {ObjectId} from "mongodb";
import {CommentCreateType, CommentInsertDbType, CommentViewType, LikeStatus} from "../types/types";
import {CommentModelClass, PostModelClass, UserModelClass} from "./db";

export const commentsRepo = {
    async createComment(newComment: CommentCreateType): Promise<CommentViewType | null> {
        const foundUser = await UserModelClass.findOne({_id: new ObjectId(newComment.userId)})
        const foundPost = await PostModelClass.findOne({_id: new ObjectId(newComment.postId)})
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
            const commentInstance = new CommentModelClass(mappedComment)
            const result = await commentInstance.save()
            return {
                id: result._id.toString(),
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
        const commentInstance = await CommentModelClass.findOne({_id: new ObjectId(commentId)})
        if (!commentInstance) return null
        else {
            commentInstance.content = content
            await commentInstance.save()
            return true
        }
    },
    async deleteComment(commentId: string): Promise<boolean | null> {
        if (ObjectId.isValid(commentId)) {
            const commentInstance = await CommentModelClass.findOne({_id: new ObjectId(commentId)})
            if (commentInstance) {
                await commentInstance.deleteOne()
                return true
            } else return false
        } else return null
    },
    async updateLikesCounters(newLikesCount: number, newDislikesCount: number, commentId: string) {
        const commentInstance = await CommentModelClass.findOne({_id: new ObjectId(commentId)})
        if (commentInstance) {
            commentInstance.likesInfo.likesCount = newLikesCount
            commentInstance.likesInfo.dislikesCount = newDislikesCount
            await commentInstance.save()
            return
        }
        return
    }
}