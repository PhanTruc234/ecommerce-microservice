import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
  FieldSeparator,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import z from "zod"
import { useNavigate } from "react-router-dom"
import { GoogleLogin, useGoogleLogin } from "@react-oauth/google"
import axios from "axios"
import axiosClient from "@/shared/api/axiosClient"
import { API_LOGIN_GOOGLE } from "@/shared/constants/api"
import { AuthStore } from "@/stores/auth.store"
import { toast } from "sonner"

const loginSchema = z.object({
  email: z
    .string()
    .email("Email không hợp lệ")
    .refine((email) => email.endsWith("@gmail.com"), {
      message: "Email không hợp lệ",
    }),
  password: z.string().min(8, "Mật khẩu không ít nhất có 8 kí tự")
})
export function LoginForm({
  className,
  ...props
}) {
  const navigate = useNavigate();
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm({
    resolver: zodResolver(loginSchema)
  })
  const { login, getMe, loading } = AuthStore()
  const onSubmit = async (data) => {
    try {
      await login(data);
      await getMe();
      navigate("/");
    } catch (err) {
      toast.error("Lỗi đăng nhập", err);
    }
  }
  const handleLoginWithGoogle = async (res) => {
    try {
      const credential = res.credential;
      if (!res?.credential) {
        console.error("Không nhận được thông tin xác thực của google");
        return;
      }
      const response = await axiosClient.post(API_LOGIN_GOOGLE, {
        credential
      });
      const accessToken = response?.data?.data?.accessToken;
      if (accessToken) {
        await getMe();
        navigate("/");
      }
    } catch (err) {
      console.error("Lỗi đăng nhập google", err);
    }
  }
  return (
    <div className={cn("flex flex-col gap-6 container max-w-[400px] my-20 mt-32 border-primary", className)} {...props}>
      <Card className="border-none">
        <CardHeader className="text-center">
          <CardTitle className="text-xl">Chào mừng trở lại</CardTitle>
          <CardDescription>
            Đăng nhập với tài khoản Google
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} noValidate>
            <FieldGroup>
              <Field>
                <GoogleLogin
                  onSuccess={handleLoginWithGoogle}
                  onError={() => {
                    console.log("Đăng nhập thất bại");
                  }}
                />
              </Field>
              <FieldSeparator className="*:data-[slot=field-separator-content]:bg-card">
                hoặc tiếp tục với
              </FieldSeparator>
              <Field>
                <FieldLabel htmlFor="email">Email</FieldLabel>
                <Input id="email" type="email" placeholder="A@example.com" className="boder-2 border-primary" {...register("email")} />
                {errors.email && <p className="text-red-500">{errors.email.message}</p>}
              </Field>
              <Field>
                <div className="flex items-center">
                  <FieldLabel htmlFor="password">Mật khẩu</FieldLabel>
                  <a href="#" className="ml-auto text-sm underline-offset-4 hover:underline">
                    Bạn quên mật khẩu?
                  </a>
                </div>
                <Input id="password" type="password" className="boder-2 border-primary" {...register("password")} />
                {errors.password && <p className="text-red-500">{errors.password.message}</p>}
              </Field>
              <Field>
                <Button
                  type="submit"
                  disabled={isSubmitting || loading}
                  className="text-secondary rounded-full py-5"
                >
                  {isSubmitting || loading ? "Đang đăng nhập..." : "Login"}
                </Button>
                <FieldDescription className="text-center">
                  Bạn chưa có tài khoản? <a href="/sign-up">Đăng kí</a>
                </FieldDescription>
              </Field>
            </FieldGroup>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
