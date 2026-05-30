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
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { useForm } from "react-hook-form"
import z from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { useNavigate } from "react-router-dom"
import { AuthStore } from "@/stores/auth.store"
const SignupSchema = z.object({
  name: z.string().min(1, "Tên bắt buộc có"),
  email: z
    .string()
    .email("Email không hợp lệ")
    .refine((email) => email.endsWith("@gmail.com"), {
      message: "Email không hợp lệ",
    }),
  password: z.string().min(8, "Mật khẩu không ít nhất có 8 kí tự")
})
export function SignupForm({
  className,
  ...props
}) {
  const navigate = useNavigate()
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm({
    resolver: zodResolver(SignupSchema)
  })
  const { register: signUp } = AuthStore()
  const onSubmit = async (data) => {
    await signUp(data);
    navigate("/sign-in")
  }
  return (
    <div className={cn("flex flex-col gap-6 container max-w-[400px] my-20 mt-32", className)} {...props}>
      <Card>
        <CardHeader className="text-center">
          <CardTitle className="text-xl">Tạo tài khoản</CardTitle>
          <CardDescription>
            Nhập thông tin bên dưới để tạo tài khoản
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} noValidate>
            <FieldGroup>
              <Field>
                <FieldLabel htmlFor="name">Học và tên</FieldLabel>
                <Input id="name" type="text" placeholder="Nguyễn Văn A" className="boder-2 border-primary" {...register("name")} />
                {errors.name && <p className="text-red-500">{errors.name.message}</p>}
              </Field>
              <Field>
                <FieldLabel htmlFor="email">Email</FieldLabel>
                <Input id="email" type="email" placeholder="A@example.com" className="boder-2 border-primary" {...register("email")} />
                {errors.email && <p className="text-red-500">{errors.email.message}</p>}
              </Field>
              <Field>
                <Field className="">
                  <Field>
                    <FieldLabel htmlFor="password">Mật khẩu</FieldLabel>
                    <Input id="password" type="password" className="boder-2 border-primary" {...register("password")} />
                    {errors.password && <p className="text-red-500">{errors.password.message}</p>}
                  </Field>
                </Field>
              </Field>
              <Field>
                <Button type="submit" className='text-secondary rounded-full py-5'>Đăng kí</Button>
                <FieldDescription className="text-center">
                  Bạn đã có tài khoản? <a href="/sign-in">Đăng nhập</a>
                </FieldDescription>
              </Field>
            </FieldGroup>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
