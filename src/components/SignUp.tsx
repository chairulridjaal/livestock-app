import { Link, useNavigate } from 'react-router-dom'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'

import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useAuth } from '../contexts/AuthContext'

// Define validation schema
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

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      email: '',
      password: '',
      confirmPassword: '',
    },
  })

  const { register, handleSubmit, formState: { errors } } = form

  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      await signup(values.email, values.password)
      toast.success('Signup successful! Verification email sent.')
      navigate('/login')
    } catch (error) {
      console.error('Signup failed:', error)
      toast.error('Failed to sign up. Please try again.')
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
                src="public/cow-login.jpg"
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
                <Input id="password" type="password" placeholder="••••••" {...register('password')} />
                {errors.password && <p className="text-xs text-red-500">{errors.password.message}</p>}
              </div>

              {/* Confirm Password Field */}
              <div className="grid gap-2">
                <Label htmlFor="confirmPassword">Confirm Password</Label>
                <Input id="confirmPassword" type="password" placeholder="••••••" {...register('confirmPassword')} />
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
      </div>
    </div>
  )
}
