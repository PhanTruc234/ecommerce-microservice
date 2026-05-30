import { z } from "zod";
export const registerSchema = z.object({
    name: z.string().trim(),
    email: z.string().trim().email("Email không hợp lệ"),
    password: z.string().trim().min(6, "Mật khẩu tối thiểu 6 ký tự"),
})
export const loginSchema = z.object({
    email: z.string().trim().email("Email không hợp lệ"),
    password: z.string().trim().min(6, "Mật khẩu tối thiểu 6 ký tự"),
});
export const authSchema = z.object({
    id: z.string().trim(),
    role: z.string().trim().optional(),
});
export type AuthPayload = z.infer<typeof authSchema>;
export type AuthRequest = AuthPayload;
export type RegisterDto = z.infer<typeof registerSchema>
export type LoginDto = z.infer<typeof loginSchema>;

