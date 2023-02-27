import {ObjectId, WithId} from "mongodb";
import {
    ActiveSessionDbType,
    BlogDbType,
    BlogPaginatorType,
    BlogViewType,
    CommentInsertDbType,
    CommentLikeInsertDbType,
    CommentPaginatorType,
    CommentViewType,
    DeviceViewType,
    LikeStatus,
    MeViewType,
    PostDbType,
    PostPaginatorType,
    PostViewType,
    QueryParser,
    UserInsertDbType,
    UserPaginatorType,
    UserQueryParser,
    UserViewType
} from "../types/types";
import {jwtService} from "../application/jwt-service";
import {settings} from "../settings";
import {BlogModelClass} from "./db";

export const blogsQueryRepo = {
    async viewAllBlogs(q: QueryParser): Promise<BlogPaginatorType> {
        let filter: string = ""
        if (q.searchNameTerm) filter = ".*" + q.searchNameTerm + ".*"
        const allBlogsCount = await BlogModelClass.countDocuments({"name": {$regex: filter, $options: 'i'}})
        const reqPageDbBlogs = await BlogModelClass
            .find({"name": {$regex: filter, $options: 'i'}})
            .sort({[q.sortBy]: q.sortDirection})
            .skip((q.pageNumber - 1) * q.pageSize)
            .limit(q.pageSize)
        const pageBlogs = reqPageDbBlogs.map(b => (blogsQueryRepo._mapBlogToViewType(b)))
        return {
            pagesCount: Math.ceil(allBlogsCount / q.pageSize),
            page: q.pageNumber,
            pageSize: q.pageSize,
            totalCount: allBlogsCount,
            items: pageBlogs
        }
    },
    async findBlogById(id: string): Promise<BlogViewType | null> {
        if (!ObjectId.isValid(id)) return null
        else {
            const foundBlog = await blogsCollection.findOne({_id: new ObjectId(id)})
            if (foundBlog) return blogsQueryRepo._mapBlogToViewType(foundBlog)
            else return null
        }
    },
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

export const postsQueryRepo = {
    async viewAllPosts(q: QueryParser, activeUserId: string): Promise<PostPaginatorType> {
        const allPostsCount = await postsCollection.countDocuments()
        const reqPageDbPosts = await postsCollection.find()
            .sort({[q.sortBy]: q.sortDirection})
            .skip((q.pageNumber - 1) * q.pageSize)
            .limit(q.pageSize)
            .toArray()
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
    },
    async findPostById(id: string, activeUserId: string): Promise<PostViewType | null> {
        if (!ObjectId.isValid(id)) return null
        else {
            const foundPost = await postsCollection.findOne({_id: new ObjectId(id)})
            if (foundPost) return postsQueryRepo._mapPostToViewType(foundPost, activeUserId)
            else return null
        }
    },
    async findPostsByBlogId(blogId: string, q: QueryParser, activeUserId: string): Promise<PostPaginatorType | null> {
        if (!ObjectId.isValid(blogId)) return null
        else {
            if (await blogsQueryRepo.findBlogById(blogId)) {
                const foundPostsCount = await postsCollection.countDocuments({blogId: {$eq: blogId}})
                const reqPageDbPosts = await postsCollection.find({blogId: {$eq: blogId}})
                    .sort({[q.sortBy]: q.sortDirection})
                    .skip((q.pageNumber - 1) * q.pageSize)
                    .limit(q.pageSize)
                    .toArray()
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
    },
    async getUserLikeForPost(userId: string, postId: string) {
        return await likesInPostsCollection.findOne({
            "postId": postId,
            "userId": userId
        })
    },
    async _getNewestLikes(postId: string) {
        return await likesInPostsCollection.find({
            "postId": postId,
            "likeStatus": LikeStatus.like
        }).sort({"addedAt": -1}).limit(3).toArray()
    },
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

export const commentsQueryRepo = {
    async findCommentsByPostId(postId: string, q: QueryParser, activeUserId = ''): Promise<CommentPaginatorType | null> {
        const foundCommentsCount = await commentsCollection.countDocuments({postId: {$eq: postId}})
        const reqPageDbComments = await commentsCollection.find({postId: {$eq: postId}})
            .sort({[q.sortBy]: q.sortDirection})
            .skip((q.pageNumber - 1) * q.pageSize)
            .limit(q.pageSize)
            .toArray()
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
    },
    async findCommentById(id: string, activeUserId: string): Promise<CommentViewType | null> {
        if (!ObjectId.isValid(id)) return null
        else {
            const foundComment = await commentsCollection.findOne({_id: new ObjectId(id)})
            if (foundComment) return commentsQueryRepo._mapCommentToViewType(foundComment, activeUserId)
            else return null
        }
    },
    async getUserLikeForComment(userId: string, commentId: string): Promise<WithId<CommentLikeInsertDbType> | null> {
        return await likesInCommentsCollection.findOne({
            "commentId": commentId,
            "userId": userId
        })
    },
    async _mapCommentToViewType(comment: WithId<CommentInsertDbType>, activeUserId: string): Promise<CommentViewType> {
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

export const usersQueryRepo = {
    async viewAllUsers(q: UserQueryParser): Promise<UserPaginatorType> {
        let loginFilter: string = ""
        let emailFilter: string = ""
        if (q.searchLoginTerm) loginFilter = ".*" + q.searchLoginTerm + ".*"
        if (q.searchEmailTerm) emailFilter = ".*" + q.searchEmailTerm + ".*"
        const allUsersCount = await usersCollection.countDocuments(
            {
                $or: [
                    {login: {$regex: loginFilter, $options: 'i'}},
                    {email: {$regex: emailFilter, $options: 'i'}}
                ]
            }
        )
        const reqPageDbUsers = await usersCollection
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
            .toArray()
        const pageUsers = reqPageDbUsers.map(u => (usersQueryRepo._mapUserToViewType(u)))
        return {
            pagesCount: Math.ceil(allUsersCount / q.pageSize),
            page: q.pageNumber,
            pageSize: q.pageSize,
            totalCount: allUsersCount,
            items: pageUsers
        }
    },
    _mapUserToViewType(user: WithId<UserInsertDbType>): UserViewType {
        return {
            id: user._id.toString(),
            login: user.accountData.login,
            email: user.accountData.email,
            createdAt: user.accountData.createdAt
        }
    },
    async findUserById(userId: ObjectId): Promise<WithId<UserInsertDbType> | null> {
        return await usersCollection.findOne({_id: {$eq: userId}})
    },
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
    },
    async getAllSessions(refreshToken: string): Promise<Array<DeviceViewType> | null> {
        const foundUserId = await jwtService.getUserIdByToken(refreshToken, settings.JWT_REFRESH_SECRET)
        if (!foundUserId) return null
        const sessions = await activeSessionsCollection.find({userId: {$eq: foundUserId}}).toArray()
        return sessions.map(e => this._mapDevicesToViewType(e))
    },
    async findSessionByDeviceId(deviceId: ObjectId): Promise<ActiveSessionDbType | null> {
        return await activeSessionsCollection.findOne({_id: deviceId})
    },
    _mapDevicesToViewType(device: ActiveSessionDbType): DeviceViewType {
        return {
            deviceId: device._id.toString(),
            ip: device.ip,
            title: device.deviceName,
            lastActiveDate: device.issuedAt.toISOString()
        }
    }
}