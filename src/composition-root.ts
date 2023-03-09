import {Container} from "inversify";
import "reflect-metadata";
import {BlogsRepoClass} from "./repositories/blogs-repo";
import {BlogsServiceClass} from "./domain/blogs-service";
import {BlogsControllerClass} from "./controllers/blogs-controller";
import {PostsRepoClass} from "./repositories/posts-repo";
import {PostServiceClass} from "./domain/posts-service";
import {CommentsRepoClass} from "./repositories/comments-repo";
import {CommentsServiceClass} from "./domain/comments-service";
import {UsersRepoClass} from "./repositories/users-repo";
import {UsersServiceClass} from "./domain/users-service";
import {DevicesRepoClass} from "./repositories/devices-repo";
import {DevicesServiceClass} from "./domain/devices-service";
import {LikesForCommentsRepoClass, LikesForPostsRepoClass} from "./repositories/likes-repo";
import {LikesForCommentsServiceClass, LikesForPostsServiceClass} from "./domain/likes-service";
import {AuthControllerClass} from "./controllers/auth-controller";
import {CommentsControllerClass} from "./controllers/comments-controller";
import {DevicesControllerClass} from "./controllers/devices-controller";
import {PostsControllerClass} from "./controllers/posts-controller";
import {UsersControllerClass} from "./controllers/users-controller";
import {BlogsQueryRepo, CommentsQueryRepo, PostsQueryRepo, UsersQueryRepo} from "./repositories/query-repo";
import {AuthMiddleware} from "./middleware/auth-middleware";

// const commentsRepo = new CommentsRepoClass()
// const likesForCommentsRepo = new LikesForCommentsRepoClass()
// const likesForCommentsService = new LikesForCommentsServiceClass(likesForCommentsRepo)
// const commentsService = new CommentsServiceClass(commentsRepo, likesForCommentsService)
// export const commentsController = new CommentsControllerClass(commentsService)
//
// const postsRepo = new PostsRepoClass()
// const likesForPostsRepo = new LikesForPostsRepoClass()
// const likesForPostsService = new LikesForPostsServiceClass(likesForPostsRepo)
// const postsService = new PostServiceClass(postsRepo, likesForPostsService)
// export const postsController = new PostsControllerClass(postsService, commentsService)
//
// const blogsRepo = new BlogsRepoClass()
// const blogsService = new BlogsServiceClass(blogsRepo)
// export const blogsController = new BlogsControllerClass(blogsService, postsService)
//
// const usersRepo = new UsersRepoClass()
// const usersService = new UsersServiceClass(usersRepo)
// export const usersController = new UsersControllerClass(usersService)
//
// const devicesRepo = new DevicesRepoClass()
// const devicesService = new DevicesServiceClass(devicesRepo)
// export const devicesController = new DevicesControllerClass(devicesService)
//
// export const authController = new AuthControllerClass(usersService, devicesService)
// const expiredTokensRepo = new ExpiredTokensRepoClass()
// export const jwtService = new JwtServiceClass(devicesService, expiredTokensRepo)
//


export const container = new Container()

container.bind<CommentsRepoClass>(CommentsRepoClass).toSelf()
container.bind<LikesForCommentsRepoClass>(LikesForCommentsRepoClass).toSelf()
container.bind<LikesForCommentsServiceClass>(LikesForCommentsServiceClass).toSelf()
container.bind<CommentsServiceClass>(CommentsServiceClass).toSelf()
container.bind<CommentsControllerClass>(CommentsControllerClass).toSelf()
container.bind<CommentsQueryRepo>(CommentsQueryRepo).toSelf()

container.bind<PostsRepoClass>(PostsRepoClass).toSelf()
container.bind<LikesForPostsRepoClass>(LikesForPostsRepoClass).toSelf()
container.bind<LikesForPostsServiceClass>(LikesForPostsServiceClass).toSelf()
container.bind<PostServiceClass>(PostServiceClass).toSelf()
container.bind<PostsControllerClass>(PostsControllerClass).toSelf()
container.bind<PostsQueryRepo>(PostsQueryRepo).toSelf()

container.bind<BlogsRepoClass>(BlogsRepoClass).toSelf()
container.bind<BlogsServiceClass>(BlogsServiceClass).toSelf()
container.bind<BlogsControllerClass>(BlogsControllerClass).toSelf()
container.bind<BlogsQueryRepo>(BlogsQueryRepo).to(BlogsQueryRepo)

container.bind<UsersControllerClass>(UsersControllerClass).to(UsersControllerClass)
container.bind<UsersServiceClass>(UsersServiceClass).to(UsersServiceClass)
container.bind<UsersRepoClass>(UsersRepoClass).to(UsersRepoClass)
container.bind<UsersQueryRepo>(UsersQueryRepo).toSelf()

container.bind<DevicesRepoClass>(DevicesRepoClass).toSelf()
container.bind<DevicesServiceClass>(DevicesServiceClass).toSelf()
container.bind<DevicesControllerClass>(DevicesControllerClass).toSelf()

container.bind<AuthControllerClass>(AuthControllerClass).toSelf()
container.bind<AuthMiddleware>(AuthMiddleware).toSelf()


