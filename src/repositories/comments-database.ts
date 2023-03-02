import {ObjectId} from "mongodb";
import {CommentDbType, CommentViewType, LikeStatus} from "../types/types";
import {CommentModelClass} from "./db";
import {injectable} from "inversify";

@injectable()
export class CommentsRepoClass {
    async createComment(newComment: CommentDbType): Promise<CommentViewType | null> {
        const commentInstance = new CommentModelClass(newComment)
        const result = await commentInstance.save()
        return {
            id: result._id.toString(),
            content: result.content,
            commentatorInfo: {
                userId: result.commentatorInfo.userId,
                userLogin: result.commentatorInfo.userLogin,
            },
            createdAt: result.createdAt,
            likesInfo: {
                likesCount: result.likesInfo.likesCount,
                dislikesCount: result.likesInfo.dislikesCount,
                myStatus: LikeStatus.none
            }
        }
    }

    async updateComment(commentId: string, content: string): Promise<boolean | null> {
        const commentInstance = await CommentModelClass.findOne({_id: new ObjectId(commentId)})
        if (!commentInstance) return null
        else {
            commentInstance.content = content
            await commentInstance.save()
            return true
        }
    }

    async deleteComment(commentId: string): Promise<boolean | null> {
        if (ObjectId.isValid(commentId)) {
            const commentInstance = await CommentModelClass.findOne({_id: new ObjectId(commentId)})
            if (commentInstance) {
                await commentInstance.deleteOne()
                return true
            } else return false
        } else return null
    }

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