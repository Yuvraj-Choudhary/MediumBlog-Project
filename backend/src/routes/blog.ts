import { Prisma, PrismaClient } from "@prisma/client/edge";
import { withAccelerate } from "@prisma/extension-accelerate";
import { Hono } from "hono";
import { verify } from "hono/jwt";
import { validator } from "hono/validator";
import { blogSchema, blogupdateSchema } from "@yuvraj107/mediumblog-common";

export const blogRouter = new Hono<{
    Bindings: {
        DATABASE_URL: string,
        JWT_SECRET: string
    },
    Variables: {
        userId: string;
    }
}>();


// blogRouter.use('/*', async (c, next) => {
//     const authToken = c.req.header("authorization");
//     if(!authToken){
//         c.status(401);
//         return c.json({error: "unauthorized"});
//     }
//     //for auth "Bearer eyJhbGciOiJ.." pattern
//     const token = authToken.split(" ")[1];
//     const res = await verify(token, c.env.JWT_SECRET);
//     if(res.id){
//         next()
//     }else{
//         c.status(401);
//         return c.json({error: "unautorized"});
//     }
// });

blogRouter.use('/*', async (c, next) => {
    try{
        const authHeader = c.req.header("authorization") || "";    
        if(!authHeader){
            c.status(401);
            return c.json({error: "unauthorized"});
        }
        //for auth "Bearer eyJhbGciOiJ.." pattern
        const authtoken = authHeader.split(" ")[1];
        const user = await verify(authtoken, c.env.JWT_SECRET);
        if(user){
            c.set("userId", user.id);        
            await next();
        }else{
            c.status(403);
            return c.json({message: "You are not logged in"}); 
        }
    }catch(e){
        c.status(500);
        return c.json({error: e});
    }    
});


blogRouter.post(
    '/',
    validator('json', (value, c) => {   
        console.log("value: ");
        console.log(value);
        const parsed = blogSchema.safeParse(value);
        if(!parsed.success){
            c.status(401);
            return c.json({Error: "Invalid iNputs", err: parsed});
        }
        return parsed.data;
    }),
    async (c) => {
        //const body = c.req.json();                
        try{
            const body = c.req.valid('json');
            const authorId = c.get("userId");
            const prisma = await new PrismaClient({
                datasourceUrl: c.env.DATABASE_URL
            }).$extends(withAccelerate());
            const blog = await prisma.post.create({
                data:{
                    title: body.title,
                    content: body.content,
                    authorId: authorId
                }
            })
            return c.json({
                id: blog.id
            })
        }catch(e){
            c.status(500);
            return c.json({message: "Blog creation failed", Error: e});
        }        
    }
)


blogRouter.put(
    '/',
    validator('json', (value, c) => {
        const parsed = blogupdateSchema.safeParse(value);
        if(!parsed.success){
            c.status(401);
            return c.json({Error: "Invalid iNputs", err: parsed});
        }
        return parsed.data;
    }),
    async (c) => {                
        try{
            const body = c.req.valid('json');
            const authorid = c.get("userId");
            const prisma = await new PrismaClient({
                datasourceUrl: c.env.DATABASE_URL
            }).$extends(withAccelerate());

            const blog = await prisma.post.update({
                where:{
                    authorId: authorid,                  
                    id: body.id
                },
                data:{
                    title: body.title,
                    content: body.content                
                }
            })            
            return c.json({
                id: blog.id,
                message: "Blog Updated."                
            })
        }catch(e){            
            return c.json({
                message: "Blog updation failed.",
                Error: e                
            })
        }        
    }
)

blogRouter.get('/bulk', async (c) => {    
    try{
        const prisma = new PrismaClient({
            datasourceUrl: c.env.DATABASE_URL
        }).$extends(withAccelerate());

        const blog = await prisma.post.findMany();
        c.status(200);
        return c.json({blog});
    }catch(e){
        c.status(411);
        return c.json({message: "Error while fetching the blogs", Error: e});
    }
});

blogRouter.get('/:id', async (c) => {    
    try{
        const id = c.req.param("id");    
        const prisma = new PrismaClient({
            datasourceUrl: c.env.DATABASE_URL
        }).$extends(withAccelerate());

        const blog = await prisma.post.findFirst({
            where:{
                id: id
            }
        })
        return c.json({blog});
    }catch(e){
        c.status(411);
        return c.json({message: "Error while fetching the blog", Error: e});
    }
});
