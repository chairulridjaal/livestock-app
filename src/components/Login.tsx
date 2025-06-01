import React, { useState } from "react"
import { useNavigate, Link } from "react-router-dom"
import { z } from "zod"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { toast } from "sonner"

import { cn } from "@/lib/utils"
import { db, auth, googleProvider } from "../lib/firebase"
import { signInWithEmailAndPassword, signInWithPopup } from "firebase/auth"
import { doc, getDoc, setDoc } from "firebase/firestore"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

const formSchema = z.object({
  email: z.string().email({ message: "Invalid email address" }),
  password: z
    .string()
    .min(6, { message: "Password must be at least 6 characters long" })
    .regex(/[a-zA-Z0-9]/, { message: "Password must be alphanumeric" }),
})

export function LoginForm({ className, ...props }: React.ComponentProps<"div">) {
  const navigate = useNavigate()
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [approveMessage, setApproveMessage] = useState<string | null>(null)
  const [countdown, setCountdown] = useState(3);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  })

  const { register, handleSubmit, formState: { errors } } = form

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setErrorMessage(null)
    try {
      const { email, password } = values
      await signInWithEmailAndPassword(auth, email, password)
      toast.success("Login successful!")

      setApproveMessage("Login successful! Redirecting...")
      const timer = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            navigate('/');
          }
          return prev - 1;
        });
      }, 1000);
  
      if (countdown === 0) {
        navigate('/');
        clearInterval(timer);
      }
    } catch (error) {
      const errorCode = (error as any).code
      if (errorCode === "auth/wrong-password") {
        setErrorMessage("Incorrect password. Please try again.")
      } else if (errorCode === "auth/user-not-found") {
        setErrorMessage("No user found with this email. Please sign up.")
      } else {
        setErrorMessage("Failed to login. Please check your credentials.")
      }
      toast.error("Login failed.")
    }
  }

  async function handleGoogleLogin() {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;

      const userDocRef = doc(db, "users", user.uid);
      const docSnap = await getDoc(userDocRef);

      if (!docSnap.exists()) {
        await setDoc(userDocRef, {
          name: user.displayName,
          email: user.email,
          farms: [],
        });
      }
      toast.success("Logged in with Google!")
      const timer = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            navigate('/');
          }
          return prev - 1;
        });
      }, 1000);
  
      if (countdown === 0) {
        navigate('/');
        clearInterval(timer);
      }
    } catch (error) {
      console.error("Google login error:", (error as Error).message)
      toast.error("Failed to login with Google.")
    }
  }

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card className="overflow-hidden">
        <CardContent className="flex flex-col md:flex-row p-0">
          <form onSubmit={handleSubmit(onSubmit)} className="p-6 md:p-8 flex flex-col gap-6 w-full md:w-1/2">
            <div className="flex flex-col items-center text-center">
              <h1 className="text-2xl font-bold">Welcome back</h1>
              <p className="text-sm text-muted-foreground">
              Login to your HerdSphere account
              </p>
            </div>

            {/* Error / Success messages */}
            {errorMessage && (
              <div className="p-3 text-sm text-red-700 bg-red-100 rounded-md">{errorMessage}</div>
            )}
            {approveMessage && (
              <div className="p-3 text-sm text-green-700 bg-green-100 rounded-md">{approveMessage}</div>
            )}

            <div className="grid gap-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                {...register("email")}
              />
              {errors.email && (
                <p className="text-xs text-red-500">{errors.email.message}</p>
              )}
            </div>

            <div className="grid gap-2">
              <div className="flex items-center">
                <Label htmlFor="password">Password</Label>
                <Link
                  to="/forgot-password"
                  className="ml-auto text-sm underline-offset-2 hover:underline"
                >
                  Forgot your password?
                </Link>
              </div>
              <Input
                id="password"
                type="password"
                placeholder="••••••"
                {...register("password")}
              />
              {errors.password && (
                <p className="text-xs text-red-500">{errors.password.message}</p>
              )}
            </div>

            <Button type="submit" className="w-full">
              Login
            </Button>

            <div className="relative text-center text-sm after:absolute after:inset-0 after:top-1/2 after:flex after:items-center after:border-t after:border-border">
              <span className="relative z-10 bg-background px-2 text-muted-foreground">
                Or continue with
              </span>
            </div>

            <div className="grid grid-cols-1 gap-4">
              <Button variant="outline" className="w-full" onClick={handleGoogleLogin} type="button">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                    <path
                      d="M12.48 10.92v3.28h7.84c-.24 1.84-.853 3.187-1.787 4.133-1.147 1.147-2.933 2.4-6.053 2.4-4.827 0-8.6-3.893-8.6-8.72s3.773-8.72 8.6-8.72c2.6 0 4.507 1.027 5.907 2.347l2.307-2.307C18.747 1.44 16.133 0 12.48 0 5.867 0 .307 5.387.307 12s5.56 12 12.173 12c3.573 0 6.267-1.173 8.373-3.36 2.16-2.16 2.84-5.213 2.84-7.667 0-.76-.053-1.467-.173-2.053H12.48z"
                      fill="currentColor"
                    />
                  </svg>
                <span className="ml-2">Google</span>
              </Button>
            </div>

            <div className="text-center text-sm">
              Don&apos;t have an account?{" "}
              <Link to="/signup" className="underline">
                Sign up
              </Link>
            </div>
          </form>

          <div className="w-full md:w-1/2 hidden md:block">
            <img src="cow-login.jpg" alt="Login Illustration" className="w-full h-full object-cover" />
          </div>
        </CardContent>
      </Card>

      <div className="text-balance text-center text-xs text-muted-foreground [&_a]:underline [&_a]:underline-offset-4 hover:[&_a]:text-primary">
        By clicking continue, you agree to our <a href="#">Terms of Service</a>{" "}
        and <a href="#">Privacy Policy</a>.
      </div>
    </div>
  )
}

export default function Login() {
  return (
    <div className="flex min-h-svh flex-col items-center justify-center bg-muted p-6 md:p-10">
      <div className="w-full max-w-sm md:max-w-3xl">
        <LoginForm />
      </div>
    </div>
  )
}
