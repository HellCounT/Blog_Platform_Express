import dotenv from "dotenv"
import {
    ActiveSessionDbType,
    Blog,
    CommentInsertDbType,
    ExpiredTokenInsertDbType, CommentLikeInsertDbType,
    UserInsertDbType, PostLikeInsertDbType, PostDbType, LikeStatus
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

const postSchema = new mongoose.Schema<PostDbType>({
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
export const PostModelClass = mongoose.model('posts', postSchema)

const blogSchema = new mongoose.Schema<Blog>({
    name: {type: String, required: true},
    description: {type: String, required: true},
    websiteUrl: {type: String, required: true},
    createdAt: {type: String, required: true},
})
export const BlogModelClass = mongoose.model('blogs', blogSchema)

const userSchema = new mongoose.Schema<UserInsertDbType>({
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
export const UserModelClass = mongoose.model('users', userSchema)

const commentSchema = new mongoose.Schema<CommentInsertDbType>({
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
export const CommentModelClass = mongoose.model('comments', commentSchema)

const expiredTokenSchema = new mongoose.Schema<ExpiredTokenInsertDbType>({
    userId: {type: ObjectId, required: true},
    refreshToken: {type: String, required: true}
})
export const ExpiredTokenModelClass = mongoose.model('expiredTokens', expiredTokenSchema)

const activeSessionSchema = new mongoose.Schema<ActiveSessionDbType>({
    _id: {type: ObjectId, required: true},
    userId: {type: ObjectId, required: true},
    ip: {type: String, required: true},
    deviceName: {type: String, required: true},
    issuedAt: {type: Date, required: true},
    expirationDate: {type: Date, required: true},
    refreshTokenMeta: {type: String, required: true}
})
export const ActiveSessionModelClass = mongoose.model('activeSessions', activeSessionSchema)

const likeInCommentSchema = new mongoose.Schema<CommentLikeInsertDbType>({
    commentId: {type: String, required: true},
    userId: {type: String, required: true},
    likeStatus: {LikeStatus, required: true}
})
export const LikeInCommentModelClass = mongoose.model('likesInComments', likeInCommentSchema)

const likeInPostSchema = new mongoose.Schema<PostLikeInsertDbType>({
    postId: {type: String, required: true},
    userId: {type: String, required: true},
    userLogin: {type: String, required: true},
    addedAt: {type: Date, required: true},
    likeStatus: {LikeStatus, required: true}
})
export const LikeInPostModelClass = mongoose.model('likesInPosts', likeInPostSchema)

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
