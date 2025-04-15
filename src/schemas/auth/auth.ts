import * as z from "zod";
import { passwordValidation } from "@/lib/passwordValidation";

export const LoginSchema = z.object({
    email: z.string().email({
        message: "Email is required",
    }),
    password: z.string().min(1, {
        message: "Password is required",
    })
})

export const RegisterSchema = z.object({
    email: z.string().email({
        message: "Email is required",
    }),
    password: z.string().min(6, {
        message: "Minimum 6 characters required",
    }),
    confirm_password: z.string(),
}).refine((data) => data.password === data.confirm_password, {
    path: ["confirm_password"],
    message: "Passwords do not match",
}).superRefine(({ password }, checkPassComplexity) => {
    passwordValidation(password, checkPassComplexity.addIssue)
})

export const ResetSchema = z.object({
    email: z.string().email({
        message: "Email is required",
    })
})

export const NewPasswordSchema = z.object({
    password: z.string().min(6, {
        message: "Minimum 6 characters required",
    }),
    confirm_password: z.string(),
}).refine((data) => data.password === data.confirm_password, {
    path: ["confirm_password"],
    message: "Passwords do not match",
}).superRefine(({ password }, checkPassComplexity) => {
    passwordValidation(password, checkPassComplexity.addIssue)
})