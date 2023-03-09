import {app} from "../src/app";
import request from 'supertest'

describe('/blogs', () => {
    beforeAll(async() => {
        await request(app).delete('/testing/all-data').expect(204)
    })

    it('GET blogs from empty DB, should return []', async() => {
        await request(app).get('/blogs').expect([])
    })
})