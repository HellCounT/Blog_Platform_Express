import {LikeStatus} from "./types";

export type BlogViewType = {
    id: string,
    name: string,
    description: string,
    websiteUrl: string,
    createdAt: string
}
export type PostViewType = {
    id: string,
    title: string,
    shortDescription: string,
    content: string,
    blogId: string,
    blogName: string,
    createdAt: string,
    extendedLikesInfo: ExtendedLikesInfoViewType
}
export type UserViewType = {
    id: string,
    login: string,
    email: string,
    createdAt: string
}
export type MeViewType = {
    email: string,
    login: string,
    userId: string
}
export type CommentViewType = {
    id: string,
    content: string,
    commentatorInfo: {
        userId: string,
        userLogin: string,
    }
    createdAt: string,
    likesInfo: LikesInfoViewType
}
export type LikesInfoViewType = {
    likesCount: number,
    dislikesCount: number,
    myStatus: LikeStatus
}
export type newestLike = {
    addedAt: string,
    userId: string,
    login: string
}
export type ExtendedLikesInfoViewType = LikesInfoViewType & {
    newestLikes: newestLike[]
}
export type DeviceViewType = {
    ip: string,
    title: string,
    lastActiveDate: string,
    deviceId: string
}
export type BlogPaginatorType = {
    pagesCount: number,
    page: number,
    pageSize: number,
    totalCount: number,
    items: BlogViewType[]
}
export type PostPaginatorType = {
    pagesCount: number,
    page: number,
    pageSize: number,
    totalCount: number,
    items: PostViewType[]
}
export type UserPaginatorType = {
    pagesCount: number,
    page: number,
    pageSize: number,
    totalCount: number,
    items: UserViewType[]
}
export type CommentPaginatorType = {
    pagesCount: number,
    page: number,
    pageSize: number,
    totalCount: number,
    items: CommentViewType[]
}