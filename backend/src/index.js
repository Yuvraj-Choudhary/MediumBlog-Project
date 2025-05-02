import { Hono } from 'hono';
import { Jwt } from 'hono/utils/jwt';
//import {JWT_SECRET} from '/jwtsec';
const zod = require('zod');
const app = new Hono();
const JWT_SECRET = "Yuvrajjwtpass-1";
const usersignupSchema = zod.object({
    username: zod.string({ required_error: "Username is required" }).min(3, { message: "Must be 3 or more character long" }),
    email: zod.string({ required_error: "email is required" }).email({ message: "Invalid email address" }),
    password: zod.string({ required_error: "Password is required" }).min(4, { message: "Must be 4 or more character long" })
});
//output   = "../src/generated/prisma"
app.get('/api/v1/signup', async (c) => {
    // const username = c.req.header('username');
    // const email = c.req.header('email');
    // const password = c.req.header('password');
    const { success } = usersignupSchema.safeParse(c.body);
    if (!success) {
        c.status(500);
        return c.body("invalid credentials!");
    }
    const response = await prisma.user.create({
        data: {
            username,
            email,
            password
        },
        select: {
            email: true,
            id: true
        }
    });
    if (response.row) {
        const token = Jwt.sign(response.email, JWT_SECRET);
        c.status(200);
        return c.json({ token: token, success: true });
    }
    else {
        console.log(response);
    }
    return c.text('Hello Hono signup page! Signup failed');
});
app.post('/api/v1/signin', (c) => {
    return c.text('Hello Hono!');
});
app.post('/api/v1/blog', (c) => {
    return c.text('Hello Hono!');
});
app.put('/api/v1/blog', (c) => {
    return c.text('Hello Hono!');
});
app.get('/', (c) => {
    return c.text('Hello Hono!');
});
export default app;
