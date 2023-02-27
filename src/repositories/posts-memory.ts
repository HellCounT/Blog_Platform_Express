import {blogsDb} from "./blogs-memory";

type Post = {
    id: string
    title: string,
    shortDescription: string,
    content: string,
    blogId: string
    blogName: string
}

export var postsDb: Array<Post> = [
    {
        id: "1",
        title: "Funny Cats",
        shortDescription: "Some text about cats",
        content: "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Vitae auctor eu augue ut lectus arcu.",
        blogId: "id1",
        blogName: "Our Pets Blog"
    },
    {
        id: "2",
        title: "Rock Am Ring 2001",
        shortDescription: "How it was at RaR2001",
        content: "Urna et pharetra pharetra massa massa ultricies. Arcu odio ut sem nulla pharetra diam sit. Eros donec ac odio tempor orci. Est ante in nibh mauris cursus mattis molestie a iaculis.",
        blogId: "id2",
        blogName: "Rock Concerts"
    },
    {
        id: "3",
        title: "Qlimax 2022",
        shortDescription: "My report from Q2022",
        content: "Luctus accumsan tortor posuere ac ut consequat semper. Mi tempus imperdiet nulla malesuada. Pretium quam vulputate dignissim suspendisse in est ante in nibh.",
        blogId: "id3",
        blogName: "Rave Music Digest"
    }
]

type Response<T> = {
    status: 'error' | 'success',
    data: T | null
    error: string | null
    statusCode: number
}

export const postsRepo = {
    async viewAllPosts() {
        return (postsDb)
    },
    async findPostById(postId: string) {
        const foundPost = postsDb.find(p => (p.id === postId))
        if (foundPost) {
            return foundPost
        } else return null
    },
    async createPost(postTitle: string, short: string, text: string, blogId: string) {
        const dateNow = new Date()
        const foundBlog = blogsDb.find(b => (b.id === blogId))
        if (foundBlog) {
            const newPost: Post = {
                id: (+dateNow).toString(),
                title: postTitle,
                shortDescription: short,
                content: text,
                blogId: blogId,
                blogName: foundBlog.name
            }
            postsDb.push(newPost)
            return newPost
        } else return null
    },
    async updatePost(inputId: string, postTitle: string, short: string, text: string, blogId: string) {
        const foundBlog = blogsDb.find(b => b.id === blogId)
        if (!foundBlog) return null
        const post = postsDb.find(p => p.id === inputId)
        if (!post) return null
        post.title = postTitle
        post.shortDescription = short
        post.content = text
        post.blogId = blogId
        post.blogName = foundBlog.name
        return true
    },
    async deletePost(inputId: string) {
        const foundPost = postsDb.find(p => p.id === inputId)
        if (foundPost !== undefined) {
            postsDb = postsDb.filter(p => p.id !== inputId)
            return true
        } else {
            return false
        }
    }
}