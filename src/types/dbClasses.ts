import {ObjectId} from "mongodb";
import {LikeStatus} from "./types";

export class BlogDbClass {
    constructor(
        public _id: ObjectId,
        public name: string,
        public description: string,
        public websiteUrl: string,
        public createdAt: string,
    ) {
    }
}

export class PostDbClass {
    constructor(
        public _id: ObjectId,
        public title: string,
        public shortDescription: string,
        public content: string,
        public blogId: string,
        public blogName: string,
        public createdAt: Date,
        public likesInfo: {
            likesCount: number,
            dislikesCount: number
        }
    ) {
    }
}

export class PostLikeDbClass {
    constructor(
        public _id: ObjectId,
        public postId: string,
        public userId: string,
        public userLogin: string,
        public addedAt: Date,
        public likeStatus: LikeStatus
    ) {
    }
}

export class UserDbClass {
    constructor(
        public _id: ObjectId,
        public accountData: {
            login: string,
            email: string,
            hash: string,
            createdAt: string,
        },
        public emailConfirmationData: {
            confirmationCode: string,
            expirationDate: string,
            isConfirmed: boolean,
        },
        public recoveryCodeData: {
            recoveryCode?: string,
            expirationDate?: Date,
        }) {
    }
}

export class CommentDbClass {
    constructor(
        public _id: ObjectId,
        public content: string,
        public commentatorInfo: {
            userId: string,
            userLogin: string
        },
        public postId: string,
        public createdAt: string,
        public likesInfo: {
            likesCount: number,
            dislikesCount: number
        }
    ) {
    }
}

export class CommentLikeDbClass {
    constructor(
        public _id: ObjectId,
        public commentId: string,
        public userId: string,
        public likeStatus: LikeStatus
    ) {
    }
}

export class ActiveSessionDbClass {
    constructor(
        public _id: ObjectId, //Session Device ID
        public userId: ObjectId,
        public ip: string,
        public deviceName: string,
        public issuedAt: Date,
        public expirationDate: Date,
        public refreshTokenMeta: string
    ) {
    }
}