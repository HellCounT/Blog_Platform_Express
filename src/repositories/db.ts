import dotenv from "dotenv"
import {
    ActiveSessionDbType,
    CommentDbType,
    ExpiredTokenInsertDbType, CommentLikeDbType,
    UserDbType, PostLikeDbType, PostDbType, LikeStatus, BlogDbType
} from "../types/types"
import {settings} from "../settings"
import mongoose from "mongoose"
import {ObjectId} from "mongodb";
dotenv.config()

const mongoUri = settings.MONGO_URI

if (!mongoUri) {
    throw new Error('MONGO URL IS NOT FOUND')
}

console.log(mongoUri)

const PostSchema = new mongoose.Schema<PostDbType>({
    title: {type: String, required: true},
    shortDescription: {type: String, required: true},
    content: {type: String, required: true},
    blogId: {type: String, required: true},
    blogName: {type: String, required: true},
    createdAt: Date,
    likesInfo: {
        likesCount: {type: Number, required: true},
        dislikesCount: {type: Number, required: true}
    }
})
const BlogSchema = new mongoose.Schema<BlogDbType>({
    name: {type: String, required: true},
    description: {type: String, required: true},
    websiteUrl: {type: String, required: true},
    createdAt: {type: String, required: true},
})
const UserSchema = new mongoose.Schema<UserDbType>({
    accountData: {
        login: {type: String, required: true},
        email: {type: String, required: true},
        hash: {type: String, required: true},
        createdAt: {type: String, required: true},
    },
    emailConfirmationData: {
        confirmationCode: {type: String, required: true},
        expirationDate: {type: String, required: true},
        isConfirmed: {type: Boolean, required: true},
    },
    recoveryCodeData: {
        recoveryCode: {type: String, required: false},
        expirationDate: {type: Date, required: false}
    }
})
const CommentSchema = new mongoose.Schema<CommentDbType>({
    content: {type: String, required: true},
    commentatorInfo: {
        userId: {type: String, required: true},
        userLogin: {type: String, required: true}
    },
    postId: {type: String, required: true},
    createdAt: {type: String, required: true},
    likesInfo: {
        likesCount: {type: Number, required: true},
        dislikesCount: {type: Number, required: true}
    }
})
const ExpiredTokenSchema = new mongoose.Schema<ExpiredTokenInsertDbType>({
    userId: {type: ObjectId, required: true},
    refreshToken: {type: String, required: true}
})
const ActiveSessionSchema = new mongoose.Schema<ActiveSessionDbType>({
    _id: {type: ObjectId, required: true},
    userId: {type: ObjectId, required: true},
    ip: {type: String, required: true},
    deviceName: {type: String, required: true},
    issuedAt: {type: Date, required: true},
    expirationDate: {type: Date, required: true},
    refreshTokenMeta: {type: String, required: true}
})
const LikeInCommentSchema = new mongoose.Schema<CommentLikeDbType>({
    commentId: {type: String, required: true},
    userId: {type: String, required: true},
    likeStatus: {type: String, enum: Object.values(LikeStatus), required: true}
})
const LikeInPostSchema = new mongoose.Schema<PostLikeDbType>({
    postId: {type: String, required: true},
    userId: {type: String, required: true},
    userLogin: {type: String, required: true},
    addedAt: {type: Date, required: true},
    likeStatus: {type: String, enum: Object.values(LikeStatus), required: true}
})

export const PostModelClass = mongoose.model('posts', PostSchema)
export const BlogModelClass = mongoose.model('blogs', BlogSchema)
export const UserModelClass = mongoose.model('users', UserSchema)
export const CommentModelClass = mongoose.model('comments', CommentSchema)
export const ExpiredTokenModelClass = mongoose.model('expiredTokens', ExpiredTokenSchema)
export const ActiveSessionModelClass = mongoose.model('activeSessions', ActiveSessionSchema)
export const LikeInCommentModelClass = mongoose.model('likesInComments', LikeInCommentSchema)
export const LikeInPostModelClass = mongoose.model('likesInPosts', LikeInPostSchema)

export const runDb = async() => {
    try {
        // Connect the client to server
        await mongoose.connect(mongoUri)
        // Establish and verify connection
        console.log('Connected successfully to mongo server')
    } catch (e) {
        console.log(e)
        // Ensures that the client will close when you finish/error
        await mongoose.disconnect()
    }
}
