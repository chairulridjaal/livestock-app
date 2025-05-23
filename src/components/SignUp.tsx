import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { Eye, EyeOff, User } from 'lucide-react';
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { doc, setDoc } from 'firebase/firestore'
import { db } from '../lib/firebase'
import { useAuth } from '../contexts/AuthContext'

const formSchema = z
  .object({
    name: z.string().min(2, { message: 'Name must be at least 2 characters long' }),
    email: z.string().email({ message: 'Invalid email address' }),
    password: z
      .string()
      .min(6, { message: 'Password must be at least 6 characters long' })
      .regex(/[a-zA-Z0-9]/, { message: 'Password must be alphanumeric' }),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    path: ['confirmPassword'],
    message: 'Passwords do not match',
  })

export default function SignUp() {
  const navigate = useNavigate()
  const { signup } = useAuth()
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [approveMessage, setApproveMessage] = useState<string | null>(null)
  const [showpassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [countdown, setCountdown] = useState(3)

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      email: '',
      password: '',
      confirmPassword: '',
    },
  })

  const createUserDoc = async (userId: string, name: string, email: string) => {
    await setDoc(doc(db, "users", userId), {
      name,
      email,
      farms: [],
    });
  };

  const { register, handleSubmit, formState: { errors } } = form

  const getFirebaseErrorMessage = (code: string): string => {
    switch (code) {
      case 'auth/email-already-in-use':
        return 'Email is already in use.';
      case 'auth/invalid-email':
        return 'Invalid email address.';
      case 'auth/weak-password':
        return 'Password is too weak. It should be at least 6 characters.';
      case 'auth/missing-password':
        return 'Password is required.';
      default:
        return 'Something went wrong. Please try again.';
    }
  };

  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      // Pass name if your signup function supports it
      const userCredential = await signup(values.email, values.password);
      const user = userCredential.user;
      await createUserDoc(user.uid, values.name, values.email);

      setApproveMessage('Signup successful! Redirecting...')
      const timer = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(timer)
            navigate('/login')
          }
          return prev - 1
        })
      }, 1000)
    } catch (error: any) {
      console.error('Signup failed:', error);
      const friendlyMessage = getFirebaseErrorMessage(error.code);
      setErrorMessage(friendlyMessage);
      toast.error(friendlyMessage);
    }
  }

  return (
    <div className="flex min-h-screen w-full items-center justify-center bg-muted px-6 md:px-10">
      <div className="w-full max-w-sm md:max-w-3xl mx-auto">
        <Card className="overflow-hidden">
          <CardContent className="flex p-0">
            {/* Left image section for desktop */}
            <div className="w-1/2 hidden md:block">
              <img
                src="/cow-login.jpg"
                alt="Signup Illustration"
                className="w-full h-full object-cover"
              />
            </div>

            {/* Form Section */}
            <form onSubmit={handleSubmit(onSubmit)} className="p-6 md:p-8 flex flex-col gap-6 w-full md:w-1/2">
              <div className="text-center">
                <h1 className="text-2xl font-bold">Create Account</h1>
                <p className="text-sm text-muted-foreground">
                  Fill in the form to register a new account.
                </p>
              </div>

              {/* Error / Success messages */}
              {errorMessage && (
                <div className="p-3 text-sm text-red-700 bg-red-100 rounded-md">{errorMessage}</div>
              )}
              {approveMessage && (
                <div className="p-3 text-sm text-green-700 bg-green-100 rounded-md">{approveMessage}</div>
              )}

              {/* Name Field */}
              <div className="grid gap-2">
                <Label htmlFor="name">Full Name</Label>
                <Input id="name" placeholder="John Doe" {...register('name')} />
                {errors.name && <p className="text-xs text-red-500">{errors.name.message}</p>}
              </div>

              {/* Email Field */}
              <div className="grid gap-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" placeholder="you@example.com" {...register('email')} />
                {errors.email && <p className="text-xs text-red-500">{errors.email.message}</p>}
              </div>

              {/* Password Field */}
              <div className="grid gap-2">
                <Label htmlFor="password">Password</Label>

                <div className="relative">
                  <Input
                    id="password"
                    type={showpassword ? 'text' : 'password'}
                    placeholder="••••••"
                    {...register('password')}
                    className="pr-10"
                  />
                  <button
                    type="button"
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500"
                    onClick={() => setShowPassword(!showpassword)}
                  >
                    {showpassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>

                {errors.password && <p className="text-xs text-red-500">{errors.password.message}</p>}
              </div>

              {/* Confirm Password Field */}
              <div className="grid gap-2">
                <Label htmlFor="confirmPassword">Confirm Password</Label>
                <div className="relative">
                  <Input id="confirmPassword" 
                    type = {showConfirmPassword ? 'text' : 'password'}
                    placeholder="••••••" 
                    {...register('confirmPassword')} 
                    className="pr-10"/>
                    <button
                      type="button"
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    >
                      {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                </div>
                {errors.confirmPassword && (
                  <p className="text-xs text-red-500">{errors.confirmPassword.message}</p>
                )}
              </div>

              <Button type="submit" className="w-full">
                Register
              </Button>

              {/* Login Redirect */}
              <p className="text-center text-sm">
                Already have an account?{' '}
                <Link to="/login" className="underline">
                  Login
                </Link>
              </p>
            </form>
          </CardContent>
        </Card>
        <div className="mt-6 text-balance text-center text-xs text-muted-foreground [&_a]:underline [&_a]:underline-offset-4 hover:[&_a]:text-primary">
          By clicking continue, you agree to our <a href="#">Terms of Service</a>{" "}
          and <a href="#">Privacy Policy</a>.
        </div>
      </div>
    </div>
  )
}
