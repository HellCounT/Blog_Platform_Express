import {NextFunction, Request, Response} from "express";
import {body, CustomValidator, param, validationResult} from "express-validator";
import {blogsCollection, postsCollection, usersCollection} from "../repositories/db";
import {ObjectId} from "mongodb";
import {LikeStatus} from "../types/types";

const isValidBlogId: CustomValidator = async (blogId: string) => {
    if (await blogsCollection.findOne({_id: new ObjectId(blogId)})) {
        return true
    } else {
        throw new Error('Invalid parent blog id')
    }
}
const isValidBlogIdParam: CustomValidator = async (id: string) => {
    if (await blogsCollection.findOne({_id: new ObjectId(id)})) {
        return true
    } else {
        throw new Error('Invalid parent blog id')
    }
}
const isValidPostIdParam: CustomValidator = async (id: string) => {
    if (await postsCollection.findOne({_id: new ObjectId(id)})) {
        return true
    } else {
        throw new Error('Invalid parent post id')
    }
}
const userAlreadyExistsEmail: CustomValidator = async (email: string) => {
    if (!await usersCollection.findOne({"accountData.email": email})) {
        return true
    } else {
        throw new Error('User already exists')
    }
}
const userAlreadyExistsLogin: CustomValidator = async (login: string) => {
    if (!await usersCollection.findOne({"accountData.login": login})) {
        return true
    } else {
        throw new Error('User already exists')
    }
}
const userEmailExistsOrConfirmed: CustomValidator = async (email: string) => {
    const foundUser = await usersCollection.findOne({"accountData.email": email})
    if (foundUser) {
        if (foundUser.emailConfirmationData.isConfirmed) throw new Error('Already confirmed')
        else return true
    } else {
        throw new Error('Invalid email address')
    }
}
const validationCodeExistsAndNotConfirmed: CustomValidator = async (code: string) => {
    const foundUser = await usersCollection.findOne({"emailConfirmationData.confirmationCode": code})
    if (foundUser) {
        if (foundUser.emailConfirmationData.isConfirmed) throw new Error('Already confirmed')
        else return true
    } else {
        throw new Error('Invalid code')
    }
}
const likeModelValidator: CustomValidator = (likeInput: string) => {
    if (likeInput === LikeStatus.like
        || likeInput === LikeStatus.dislike
        || likeInput === LikeStatus.none) return true
    else return false
}

export const blogDataValidator = {
    nameCheck: body('name').exists().isString().trim().isLength({min: 1, max: 15}).withMessage("Name is invalid"),
    descriptionCheck: body('description').exists().isString().trim().isLength({
        min: 1,
        max: 500
    }).withMessage("Description is invalid"),
    urlCheck: body('websiteUrl').exists().isString().trim().isLength({
        min: 1,
        max: 100
    }).isURL().withMessage("URL is invalid")
}
export const postDataValidator = {
    titleCheck: body("title").isString().trim().isLength({min: 1, max: 30}).withMessage("Title is invalid"),
    shortDescriptionCheck: body("shortDescription").isString().trim().isLength({
        min: 1,
        max: 100
    }).withMessage("Short description is invalid"),
    contentCheck: body("content").isString().trim().isLength({min: 1, max: 1000}).withMessage("Content is invalid"),
    blogIdCheck: body("blogId").exists().isString().custom(isValidBlogId),
    blogIdParamCheck: param('id').exists().isString().custom(isValidBlogIdParam)
}
export const commentDataValidator = {
    contentCheck: body("content").isString().trim().isLength({min: 20, max: 300}).withMessage("Content is invalid"),
    postIdParamCheck: param("postId").exists().isString().custom(isValidPostIdParam)
}

export const likeInputValidator = body("likeStatus").isString().notEmpty().custom(likeModelValidator).withMessage('Invalid Like data input')

export const userDataValidator = {
    loginCheck: body('login').isString().trim().isLength({
        min: 3,
        max: 10
    }).matches(/^[a-zA-Z0-9_-]*$/).withMessage("Login is invalid"),
    passwordCheck: body('password').isString().trim().isLength({min: 6, max: 20}).withMessage("Password is invalid"),
    newPasswordCheck: body('newPassword').isString().trim().isLength({min: 6, max: 20}).withMessage("Password is invalid"),
    emailCheck: body('email').isString().notEmpty().isEmail().withMessage("Email is invalid"),
    loginOrEmailCheck: body('loginOrEmail').isString().trim().notEmpty().withMessage("Login/email is invalid"),
    userExistsCheckEmail: body('email').custom(userAlreadyExistsEmail).withMessage('User already exists'),
    userExistsCheckLogin: body('login').custom(userAlreadyExistsLogin).withMessage('User already exists'),
    codeCheck: body('code').exists().isString().notEmpty().custom(validationCodeExistsAndNotConfirmed).withMessage('Invalid code or account is already confirmed'),
    userEmailCheck: body('email').exists().isString().notEmpty().custom(userEmailExistsOrConfirmed).withMessage('Invalid email address')
}
export const inputValidation = (req: Request, res: Response, next: NextFunction) => {
    const errorMessagesArray = validationResult(req).array({onlyFirstError: true})
    if (errorMessagesArray.length > 0) {
        res.status(400).send({
                errorsMessages: errorMessagesArray.map(e => ({
                    message: e.msg,
                    field: e.param
                }))
            }
        )
    } else {
        next()
    }
}
export const paramIdInputValidation = (req: Request, res: Response, next: NextFunction) => {
    const errorMessagesArray = validationResult(req).array({onlyFirstError: true})
    if (errorMessagesArray.length > 0) {
        res.sendStatus(404)
    } else {
        next()
    }
}