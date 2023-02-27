import express from "express"
import {blogsRouter} from "./routes/blogs-router";
import {postsRouter} from "./routes/posts-router";
import {deleteAllRouter} from "./routes/delete-all-router";
import {runDb} from "./repositories/db";
import {usersRouter} from "./routes/users-router";
import {authRouter} from "./routes/auth-router";
import {commentsRouter} from "./routes/comments-router";
import cookieParser from 'cookie-parser'
import {devicesRouter} from "./routes/devices-router";


const app = express()
const port = process.env.PORT || 3000

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

const startApp = async () => {
    await runDb()
    app.listen(port, () => {
        console.log(`Example app listening on port ${port}`)
    })
}


startApp()


