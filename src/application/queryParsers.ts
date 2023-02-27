import {Request} from "express";
import {QueryParser, UserQueryParser} from "../types/types";

export const parseQueryPagination = (req: Request): QueryParser => {
    let queryParamsParser: QueryParser = {
        searchNameTerm: null,
        sortBy: "createdAt",
        sortDirection: -1,
        pageNumber: 1,
        pageSize: 10
    }
    if (req.query.searchNameTerm) queryParamsParser.searchNameTerm = req.query.searchNameTerm.toString()
    if (req.query.sortBy) queryParamsParser.sortBy = req.query.sortBy.toString()
    if (req.query.sortDirection && req.query.sortDirection.toString() === "asc") queryParamsParser.sortDirection = 1
    if (req.query.pageNumber) queryParamsParser.pageNumber = +req.query.pageNumber
    if (req.query.pageSize) queryParamsParser.pageSize = +req.query.pageSize
    return queryParamsParser
}

export const parseUserQueryPagination = (req: Request): UserQueryParser => {
    let queryUserParamsParser: UserQueryParser = {
        sortBy: 'createdAt',
        sortDirection: -1,
        pageNumber: 1,
        pageSize: 10,
        searchEmailTerm: null,
        searchLoginTerm: null
    }
    if (req.query.searchLoginTerm) queryUserParamsParser.searchLoginTerm = req.query.searchLoginTerm.toString()
    if (req.query.searchEmailTerm) queryUserParamsParser.searchEmailTerm = req.query.searchEmailTerm.toString()
    if (req.query.sortBy) queryUserParamsParser.sortBy = req.query.sortBy.toString()
    if (req.query.sortDirection && req.query.sortDirection.toString() === "asc") queryUserParamsParser.sortDirection = 1
    if (req.query.pageNumber) queryUserParamsParser.pageNumber = +req.query.pageNumber
    if (req.query.pageSize) queryUserParamsParser.pageSize = +req.query.pageSize
    return queryUserParamsParser
}