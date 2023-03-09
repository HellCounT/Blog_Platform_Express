import express from "express";
import cookieParser from "cookie-parser";
import {blogsRouter} from "./routes/blogs-router";
import {postsRouter} from "./routes/posts-router";
import {deleteAllRouter} from "./routes/delete-all-router";
import {usersRouter} from "./routes/users-router";
import {authRouter} from "./routes/auth-router";
import {commentsRouter} from "./routes/comments-router";
import {devicesRouter} from "./routes/devices-router";

export const app = express()
app.use(express.json())
app.use(cookieParser())
app.set('trust proxy', true)

app.use('/blogs', blogsRouter)
app.use('/posts', postsRouter)
app.use('/testing', deleteAllRouter)
app.use('/users', usersRouter)
app.use('/auth', authRouter)
app.use('/comments', commentsRouter)
app.use('/security/devices', devicesRouter)