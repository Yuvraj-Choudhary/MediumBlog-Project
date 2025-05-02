import { Hono } from 'hono'
import { PrismaClient } from '@prisma/client/edge'
import { withAccelerate } from '@prisma/extension-accelerate';
import { sign, verify } from 'hono/jwt';
import { z } from 'zod';
import { validator } from 'hono/validator';
import { usersigninSchema, usersignupSchema } from '@yuvraj107/mediumblog-common';

export const userRouter = new Hono<{
    Bindings: {
        DATABASE_URL: string,
        JWT_SECRET: string
    }
}>();

userRouter.post(
    '/signup',
    validator('json', (value, c)=>{
        //const body = value['form']
        const parsed = usersignupSchema.safeParse(value);
        if(!parsed.success){
            c.status(401);            
            return c.json({Error: "Invalid inputs", err: parsed});
        }
        return parsed.data;
    }), 
    async (c) => {          
        try{
            const prisma = new PrismaClient({
                datasourceUrl: c.env.DATABASE_URL,
                }).$extends(withAccelerate())
        
            const body = c.req.valid('json');
            const response = await prisma.user.create({
                data:{
                    email: body.email,
                    name: body.name,
                    password: body.password
                },
                select:{
                    email: true,
                    id: true
                }
            })
            if(response){
                const token = await sign({id: response.id}, c.env.JWT_SECRET);
                c.status(200);
                return c.json({Auth: token, success: true, User: response});
            }else{
                console.log(response);
            }
        }catch(err){
            c.status(411);
            return c.json({Error: err, success: false});
        }

        return c.text('Hello Hono signup page! Signup failed')
    }
)


userRouter.post(
    '/signin',
    validator('json', (value, c)=>{
        const parsed = usersigninSchema.safeParse(value);
        if(!parsed.success){
        c.status(401);
        return c.json({error: "Invalid Credentials"});
        }
        return parsed.data;
    }),
    async (c) => {
        
        try{
            const prisma = new PrismaClient({
                datasourceUrl: c.env.DATABASE_URL
                }).$extends(withAccelerate());
        
                const body = c.req.valid('json');
            const user = await prisma.user.findUnique({
                where:{
                email: body.email,
                password: body.password
                }
            });

            if(!user){
                c.status(403);
                return c.json({error: 'Incorrect Creds', success: false});
            }
            const token = await sign({id: user.id}, c.env.JWT_SECRET);

            return c.json({Auth: token, success: true});
        }catch(e){
            c.status(411);
            return c.json({Error: e, success: false});
        }

    }
)