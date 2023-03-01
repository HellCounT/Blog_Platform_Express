import {Router} from "express";
import {basicAuth} from "../middleware/auth";
import {
    blogDataValidator,
    inputValidation,
    paramIdInputValidation,
    postDataValidator
} from "../middleware/data-validation";
import {authMiddleware} from "../middleware/auth-middleware";
import {blogsController} from "../composition-root";

export const blogsRouter = Router({})

blogsRouter.get('/', blogsController.getAllBlogs.bind(blogsController))

blogsRouter.get('/:id', blogsController.getBlogById.bind(blogsController))

blogsRouter.get('/:id/posts',
    //InputValidation
    authMiddleware.parseUserIdByToken,
    postDataValidator.blogIdParamCheck,
    paramIdInputValidation,
    //Handlers
    blogsController.getPostsForBlogId.bind(blogsController))

blogsRouter.post('/', basicAuth,
    //Input validation
    blogDataValidator.nameCheck,
    blogDataValidator.descriptionCheck,
    blogDataValidator.urlCheck,
    inputValidation,
    //Handlers
    blogsController.createBlog.bind(blogsController))

blogsRouter.post('/:id/posts', basicAuth,
    //Input validation
    postDataValidator.blogIdParamCheck,
    paramIdInputValidation,
    postDataValidator.titleCheck,
    postDataValidator.shortDescriptionCheck,
    postDataValidator.contentCheck,
    inputValidation,
    //Handlers
    blogsController.createPostForBlogId.bind(blogsController))

blogsRouter.put('/:id', basicAuth,
    //Input validation
    blogDataValidator.nameCheck,
    blogDataValidator.descriptionCheck,
    blogDataValidator.urlCheck,
    inputValidation,
    //Handlers
    blogsController.updateBlog.bind(blogsController))

blogsRouter.delete('/:id', basicAuth, blogsController.deleteBlog.bind(blogsController))