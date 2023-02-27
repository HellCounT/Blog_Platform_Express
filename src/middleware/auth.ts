import expressBasicAuth from "express-basic-auth";
export const basicAuth = expressBasicAuth({
    users: {'admin': 'qwerty'}
})