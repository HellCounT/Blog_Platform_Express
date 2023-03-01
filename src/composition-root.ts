import {BlogsRepoClass} from "./repositories/blogs-database";
import {BlogsServiceClass} from "./domain/blogs-service";
import {BlogsControllerClass} from "./controllers/blogs-controller";
import {PostsRepoClass} from "./repositories/posts-database";
import {PostServiceClass} from "./domain/posts-service";
import {CommentsRepoClass} from "./repositories/comments-database";
import {CommentsServiceClass} from "./domain/comments-service";
import {UsersRepoClass} from "./repositories/users-database";
import {UsersServiceClass} from "./domain/users-service";
import {DevicesRepoClass} from "./repositories/devices-database";
import {DevicesServiceClass} from "./domain/devices-service";
import {LikesForCommentsRepoClass, LikesForPostsRepoClass} from "./repositories/likes-database";
import {LikesForCommentsServiceClass, LikesForPostsServiceClass} from "./domain/likes-service";
import {AuthControllerClass} from "./controllers/auth-controller";
import {CommentsControllerClass} from "./controllers/comments-controller";
import {DevicesControllerClass} from "./controllers/devices-controller";
import {PostsControllerClass} from "./controllers/posts-controller";
import {UsersControllerClass} from "./controllers/users-controller";
import {JwtServiceClass} from "./application/jwt-service";
import {ExpiredTokensRepoClass} from "./repositories/expired-tokens-database";

const commentsRepo = new CommentsRepoClass()
const likesForCommentsRepo = new LikesForCommentsRepoClass()
const likesForCommentsService = new LikesForCommentsServiceClass(likesForCommentsRepo)
const commentsService = new CommentsServiceClass(commentsRepo, likesForCommentsService)
export const commentsController = new CommentsControllerClass(commentsService)

const postsRepo = new PostsRepoClass()
const likesForPostsRepo = new LikesForPostsRepoClass()
const likesForPostsService = new LikesForPostsServiceClass(likesForPostsRepo)
const postsService = new PostServiceClass(postsRepo, likesForPostsService)
export const postsController = new PostsControllerClass(postsService, commentsService)

const blogsRepo = new BlogsRepoClass()
const blogsService = new BlogsServiceClass(blogsRepo)
export const blogsController = new BlogsControllerClass(blogsService, postsService)

const usersRepo = new UsersRepoClass()
const usersService = new UsersServiceClass(usersRepo)
export const usersController = new UsersControllerClass(usersService)

const devicesRepo = new DevicesRepoClass()
const devicesService = new DevicesServiceClass(devicesRepo)
export const devicesController = new DevicesControllerClass(devicesService)

export const authController = new AuthControllerClass(usersService, devicesService)

const expiredTokensRepo = new ExpiredTokensRepoClass()
export const jwtService = new JwtServiceClass(devicesService, expiredTokensRepo)