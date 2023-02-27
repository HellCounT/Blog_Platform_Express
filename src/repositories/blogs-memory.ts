type Blog = {
    id: string,
    name: string,
    description: string,
    websiteUrl: string
}

export let blogsDb: Array<Blog> = [
    {
        id: "id1",
        name: "Our Pets Blog",
        description: "Videos and posts about pets",
        websiteUrl: "https://blogsDB/1website1"
    },
    {
        id: "id2",
        name: "Rock Concerts",
        description: "Reports from Rock concerts and festivals",
        websiteUrl: "https://blogsDB/2website2"
    },
    {
        id: "id3",
        name: "Rave Music Digest",
        description: "Everything about underground electronic music in one place",
        websiteUrl: "https://blogsDB/3website3"
    }
]

export const blogsRepo = {
    async viewAllBlogs() {
        return(blogsDb)
    },
    async findBlogById(blogId: string) {
        const foundBlog = blogsDb.find(b => (b.id === blogId))
        return foundBlog
    },
    async createBlog(title: string, desc: string, website: string) {
        const dateNow = new Date()
        const newBlog: Blog = {
            id: (+dateNow).toString(),
            name: title,
            description: desc,
            websiteUrl: website,
        }
        blogsDb.push(newBlog)
        return newBlog
    },
    async updateBlog(inputId: string, title: string, desc: string, website: string) {
        if (!(blogsDb.find(b => b.id === inputId))) {
            return false
        } else {
        (blogsDb.forEach((b) => {
            if (b.id === inputId) {
                b.name = title
                b.description = desc
                b.websiteUrl = website
            }
        }))
            return true
        }
    },
    async deleteBlog(inputId: string) {
        const foundBlog = blogsDb.find(b => (b.id === inputId))
        if (foundBlog !== undefined) {
            blogsDb = blogsDb.filter(b => b.id !== inputId)
            return true
        } else {
            return false
        }
    }
}