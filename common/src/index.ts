import { z } from "zod";

export const usersignupSchema = z.object({
    email: z.string({required_error: "email is required"}).email({message: "Invalid email address"}),
    name: z.string({required_error: "Name is required"}).min(3, {message: "Must be 3 or more character long"}),
    password: z.string({required_error: "Password is required"}).min(4, {message: "Must be 4 or more character long"})
})

export const usersigninSchema = z.object({
    email: z.string({required_error: "email is required"}).email({message: "Invalid email address"}),  
    password: z.string({required_error: "Password is required"}).min(4, {message: "Must be 4 or more character long"})
});


export const blogSchema = z.object({
    title: z.string(),
    content: z.string()    
})


export const blogupdateSchema = z.object({
    id: z.string(),
    title: z.string(),
    content: z.string(),
})

export type UsersignupSchema = z.infer<typeof usersignupSchema>
export type UsersigninSchema = z.infer<typeof usersigninSchema>
export type BlogSchema = z.infer<typeof blogSchema>
export type BlogupdateSchema = z.infer<typeof blogupdateSchema>