import {ObjectId} from "mongodb";


export type QueryParser = {
    searchNameTerm: string | null,
    sortBy: string,
    sortDirection: 1 | -1
    pageNumber: number
    pageSize: number
}
export type UserQueryParser = {
    sortBy: string,
    sortDirection: 1 | -1,
    pageNumber: number,
    pageSize: number,
    searchLoginTerm: string | null,
    searchEmailTerm: string | null
}

export enum LikeStatus {
    none = "None",
    like = "Like",
    dislike = "Dislike"
}

export type RefreshTokenResult = {
    refreshToken: string,
    userId: ObjectId,
    deviceId: ObjectId,
    issueDate: Date,
    expDate: Date
}

export type StatusType = {
    status: "Not Found" | "Forbidden" | "Updated" | "Deleted" | "Unauthorized" | "Too many requests" | "No content" | "OK",
    code?: number,
    message?: string,
    data?: any,
}