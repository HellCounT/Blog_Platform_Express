import {ObjectId} from "mongodb";
import {LikeStatus} from "./types";

export type BlogDbType = {
    _id: ObjectId,
    name: string,
    description: string,
    websiteUrl: string,
    createdAt: string,
}
export type PostDbType = {
    _id: ObjectId,
    title: string,
    shortDescription: string,
    content: string,
    blogId: string,
    blogName: string,
    createdAt: Date,
    likesInfo: {
        likesCount: number,
        dislikesCount: number
    }
}
export type PostLikeDbType = {
    _id: ObjectId,
    postId: string,
    userId: string,
    userLogin: string,
    addedAt: Date,
    likeStatus: LikeStatus
}
export type UserDbType = {
    _id: ObjectId,
    accountData: {
        login: string,
        email: string,
        hash: string,
        createdAt: string,
    },
    emailConfirmationData: {
        confirmationCode: string,
        expirationDate: string,
        isConfirmed: boolean,
    },
    recoveryCodeData: {
        recoveryCode?: string,
        expirationDate?: Date,
    }
}
export type CommentDbType = {
    content: string,
    commentatorInfo: {
        userId: string,
        userLogin: string
    },
    postId: string,
    createdAt: string,
    likesInfo: {
        likesCount: number,
        dislikesCount: number
    }
}
export type CommentLikeDbType = {
    _id: ObjectId,
    commentId: string,
    userId: string,
    likeStatus: LikeStatus
}
export type ExpiredTokenInsertDbType = {
    userId: ObjectId,
    refreshToken: string,
}
export type ActiveSessionDbType = {
    _id: ObjectId, //Session Device ID
    userId: ObjectId,
    ip: string,
    deviceName: string,
    issuedAt: Date,
    expirationDate: Date,
    refreshTokenMeta: string
}