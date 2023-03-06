import "reflect-metadata";
import {ObjectId, WithId} from "mongodb";
import {
    LikeStatus,
    QueryParser,
    UserQueryParser
} from "../types/types";
import {settings} from "../settings";
import {
    ActiveSessionModelClass,
    BlogModelClass,
    CommentModelClass,
    LikeInCommentModelClass,
    LikeInPostModelClass,
    PostModelClass,
    UserModelClass
} from "./db";
import {jwtService} from "../application/jwt-service";
import {injectable} from "inversify";
import {
    ActiveSessionDbType,
    BlogDbType,
    CommentDbType,
    CommentLikeDbType,
    PostDbType,
    UserDbType
} from "../types/dbTypes";
import {
    BlogPaginatorType, BlogViewType,
    CommentPaginatorType, CommentViewType,
    DeviceViewType, MeViewType,
    PostPaginatorType, PostViewType,
    UserPaginatorType, UserViewType
} from "../types/viewTypes";

@injectable()
export class BlogsQueryRepo {
    async viewAllBlogs(q: QueryParser): Promise<BlogPaginatorType> {
        let filter: string = ""
        if (q.searchNameTerm) filter = ".*" + q.searchNameTerm + ".*"
        const allBlogsCount = await BlogModelClass.countDocuments({"name": {$regex: filter, $options: 'i'}})
        const reqPageDbBlogs = await BlogModelClass
            .find({"name": {$regex: filter, $options: 'i'}})
            .sort({[q.sortBy]: q.sortDirection})
            .skip((q.pageNumber - 1) * q.pageSize)
            .limit(q.pageSize).lean()
        const pageBlogs = reqPageDbBlogs.map(b => (this._mapBlogToViewType(b)))
        return {
            pagesCount: Math.ceil(allBlogsCount / q.pageSize),
            page: q.pageNumber,
            pageSize: q.pageSize,
            totalCount: allBlogsCount,
            items: pageBlogs
        }
    }
    async findBlogById(id: string): Promise<BlogViewType | null> {
        if (!ObjectId.isValid(id)) return null
        else {
            const foundBlogInstance = await BlogModelClass.findOne({_id: new ObjectId(id)}).lean()
            if (foundBlogInstance) return this._mapBlogToViewType(foundBlogInstance)
            else return null
        }
    }
    _mapBlogToViewType(blog: BlogDbType): BlogViewType {
        return {
            id: blog._id.toString(),
            name: blog.name,
            description: blog.description,
            websiteUrl: blog.websiteUrl,
            createdAt: blog.createdAt
        }
    }
}

@injectable()
export class PostsQueryRepo {
    async viewAllPosts(q: QueryParser, activeUserId: string): Promise<PostPaginatorType> {
        const allPostsCount = await PostModelClass.countDocuments()
        const reqPageDbPosts = await PostModelClass.find()
            .sort({[q.sortBy]: q.sortDirection})
            .skip((q.pageNumber - 1) * q.pageSize)
            .limit(q.pageSize).lean()
        const items = []
        for await (const p of reqPageDbPosts) {
            const post = await this._mapPostToViewType(p, activeUserId)
            items.push(post)
        }
        return {
            pagesCount: Math.ceil(allPostsCount / q.pageSize),
            page: q.pageNumber,
            pageSize: q.pageSize,
            totalCount: allPostsCount,
            items: items
        }
    }
    async findPostById(id: string, activeUserId: string): Promise<PostViewType | null> {
        if (!ObjectId.isValid(id)) return null
        else {
            const foundPostInstance = await PostModelClass.findOne({_id: new ObjectId(id)})
            if (foundPostInstance) return this._mapPostToViewType(foundPostInstance, activeUserId)
            else return null
        }
    }
    async findPostsByBlogId(blogId: string, q: QueryParser, activeUserId: string): Promise<PostPaginatorType | null> {
        if (!ObjectId.isValid(blogId)) return null
        else {
            if (await BlogModelClass.findOne({_id: new ObjectId(blogId)}).lean()) {
                const foundPostsCount = await PostModelClass.countDocuments({blogId: {$eq: blogId}})
                const reqPageDbPosts = await PostModelClass.find({blogId: {$eq: blogId}})
                    .sort({[q.sortBy]: q.sortDirection})
                    .skip((q.pageNumber - 1) * q.pageSize)
                    .limit(q.pageSize)
                    .lean()
                if (!reqPageDbPosts) return null
                else {
                    const items = []
                    for await (const p of reqPageDbPosts) {
                        const post = await this._mapPostToViewType(p, activeUserId)
                        items.push(post)
                    }
                    return {
                        pagesCount: Math.ceil(foundPostsCount / q.pageSize),
                        page: q.pageNumber,
                        pageSize: q.pageSize,
                        totalCount: foundPostsCount,
                        items: items
                    }
                }
            } else return null
        }
    }
    async getUserLikeForPost(userId: string, postId: string) {
        return LikeInPostModelClass.findOne({
            "postId": postId,
            "userId": userId
        })
    }
    async _getNewestLikes(postId: string) {
        return LikeInPostModelClass.find({
            "postId": postId,
            "likeStatus": LikeStatus.like
        }).sort({"addedAt": -1}).limit(3).lean()
    }
    async _mapPostToViewType(post: WithId<PostDbType>, userId: string): Promise<PostViewType> {
        const userLike = await this.getUserLikeForPost(userId, post._id.toString())
        const newestLikes = await this._getNewestLikes(post._id.toString())
        const mappedLikes = newestLikes.map(e => {return {
            addedAt: new Date(e.addedAt).toISOString(),
            userId: e.userId,
            login: e.userLogin
        }})
        return {
            id: post._id.toString(),
            title: post.title,
            shortDescription: post.shortDescription,
            content: post.content,
            blogId: post.blogId,
            blogName: post.blogName,
            createdAt: new Date(post.createdAt).toISOString(),
            extendedLikesInfo: {
                likesCount: post.likesInfo?.likesCount,
                dislikesCount: post.likesInfo?.dislikesCount,
                myStatus: userLike?.likeStatus || LikeStatus.none,
                newestLikes: mappedLikes
            }
        }
    }
}

@injectable()
export class CommentsQueryRepo {
    async findCommentsByPostId(postId: string, q: QueryParser, activeUserId = ''): Promise<CommentPaginatorType | null> {
        const foundCommentsCount = await CommentModelClass.countDocuments({postId: {$eq: postId}})
        const reqPageDbComments = await CommentModelClass.find({postId: {$eq: postId}})
            .sort({[q.sortBy]: q.sortDirection})
            .skip((q.pageNumber - 1) * q.pageSize)
            .limit(q.pageSize)
            .lean()
        if (!reqPageDbComments) return null
        else {
            const items = []
            for await (const c of reqPageDbComments) {
                const comment = await this._mapCommentToViewType(c, activeUserId)
                items.push(comment)
            }
            return {
                pagesCount: Math.ceil(foundCommentsCount / q.pageSize),
                page: q.pageNumber,
                pageSize: q.pageSize,
                totalCount: foundCommentsCount,
                items: items
            }
        }
    }
    async findCommentById(id: string, activeUserId: string): Promise<CommentViewType | null> {
        if (!ObjectId.isValid(id)) return null
        else {
            const foundCommentInstance = await CommentModelClass.findOne({_id: new ObjectId(id)})
            if (foundCommentInstance) return this._mapCommentToViewType(foundCommentInstance, activeUserId)
            else return null
        }
    }
    async getUserLikeForComment(userId: string, commentId: string): Promise<WithId<CommentLikeDbType> | null> {
        return LikeInCommentModelClass.findOne({
            "commentId": commentId,
            "userId": userId
        })
    }
    async _mapCommentToViewType(comment: WithId<CommentDbType>, activeUserId: string): Promise<CommentViewType> {
        const like = await this.getUserLikeForComment(activeUserId, comment._id.toString())
        return {
            id: comment._id.toString(),
            content: comment.content,
            commentatorInfo: {
                userId: comment.commentatorInfo.userId,
                userLogin: comment.commentatorInfo.userLogin,
            },
            createdAt: comment.createdAt,
            likesInfo: {
                likesCount: comment.likesInfo.likesCount,
                dislikesCount: comment.likesInfo.dislikesCount,
                myStatus: like?.likeStatus || LikeStatus.none,
            }
        }
    }
}

@injectable()
export class UsersQueryRepo {
    async viewAllUsers(q: UserQueryParser): Promise<UserPaginatorType> {
        let loginFilter: string = ""
        let emailFilter: string = ""
        if (q.searchLoginTerm) loginFilter = ".*" + q.searchLoginTerm + ".*"
        if (q.searchEmailTerm) emailFilter = ".*" + q.searchEmailTerm + ".*"
        const allUsersCount = await UserModelClass.countDocuments(
            {
                $or: [
                    {login: {$regex: loginFilter, $options: 'i'}},
                    {email: {$regex: emailFilter, $options: 'i'}}
                ]
            }
        )
        const reqPageDbUsers = await UserModelClass
            .find(
                {
                    $or: [
                        {'accountData.login': {$regex: loginFilter, $options: 'i'}},
                        {'accountData.email': {$regex: emailFilter, $options: 'i'}}
                    ]
                }
            )
            .sort({[q.sortBy]: q.sortDirection})
            .skip((q.pageNumber - 1) * q.pageSize)
            .limit(q.pageSize)
            .lean()
        const pageUsers = reqPageDbUsers.map(u => (this._mapUserToViewType(u)))
        return {
            pagesCount: Math.ceil(allUsersCount / q.pageSize),
            page: q.pageNumber,
            pageSize: q.pageSize,
            totalCount: allUsersCount,
            items: pageUsers
        }
    }
    _mapUserToViewType(user: WithId<UserDbType>): UserViewType {
        return {
            id: user._id.toString(),
            login: user.accountData.login,
            email: user.accountData.email,
            createdAt: user.accountData.createdAt
        }
    }
    async findUserById(userId: ObjectId): Promise<UserDbType | null> {
        return UserModelClass.findOne({_id: {$eq: userId}})
    }
    async getMyInfo(token: string): Promise<MeViewType | null> {
        const foundUserId = await jwtService.getUserIdByToken(token, settings.JWT_SECRET)
        if (!foundUserId) return null
        const foundUser = await this.findUserById(foundUserId)
        if (!foundUser) return null
        return {
            email: foundUser.accountData.email,
            login: foundUser.accountData.login,
            userId: foundUserId.toString()
        }
    }
    async getAllSessions(refreshToken: string): Promise<Array<DeviceViewType> | null> {
        const foundUserId = await jwtService.getUserIdByToken(refreshToken, settings.JWT_REFRESH_SECRET)
        if (!foundUserId) return null
        const sessions = await ActiveSessionModelClass.find({userId: {$eq: foundUserId}}).lean()
        return sessions.map(e => this._mapDevicesToViewType(e))
    }
    async findSessionByDeviceId(deviceId: ObjectId): Promise<ActiveSessionDbType | null> {
        return ActiveSessionModelClass.findOne({_id: deviceId})
    }
    _mapDevicesToViewType(device: ActiveSessionDbType): DeviceViewType {
        return {
            deviceId: device._id.toString(),
            ip: device.ip,
            title: device.deviceName,
            lastActiveDate: device.issuedAt.toISOString()
        }
    }
}