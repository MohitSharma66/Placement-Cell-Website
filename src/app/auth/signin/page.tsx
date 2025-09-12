'use client'

import { useState } from 'react'
import { signIn, getSession } from 'next-auth/react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { GraduationCap, Building2, ArrowLeft } from 'lucide-react'

export default function SignIn() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [userType, setUserType] = useState<'student' | 'recruiter'>('student')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  
  const router = useRouter()
  const searchParams = useSearchParams()
  const callbackUrl = searchParams.get('callbackUrl') || '/'

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')

    try {
      const result = await signIn('credentials', {
        email,
        password,
        userType,
        redirect: false,
      })

      if (result?.error) {
        setError('Invalid credentials')
      } else {
        // Redirect based on user type
        const redirectUrl = userType === 'student' ? '/student' : '/recruiter'
        router.push(redirectUrl)
        router.refresh()
      }
    } catch (error) {
      setError('An error occurred. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full space-y-6">
        <div className="text-center">
          <Button 
            variant="ghost" 
            onClick={() => router.push('/')}
            className="mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Home
          </Button>
          <h1 className="text-3xl font-bold text-gray-900">Sign In</h1>
          <p className="text-gray-600 mt-2">Access your placement portal</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-center space-x-2">
              {userType === 'student' ? (
                <GraduationCap className="w-5 h-5 text-blue-600" />
              ) : (
                <Building2 className="w-5 h-5 text-green-600" />
              )}
              <span>{userType === 'student' ? 'Student' : 'Recruiter'} Portal</span>
            </CardTitle>
            <CardDescription>
              Sign in to your {userType === 'student' ? 'student' : 'recruiter'} account
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="flex space-x-2 mb-4">
                <Button
                  type="button"
                  variant={userType === 'student' ? 'default' : 'outline'}
                  onClick={() => setUserType('student')}
                  className="flex-1"
                >
                  <GraduationCap className="w-4 h-4 mr-2" />
                  Student
                </Button>
                <Button
                  type="button"
                  variant={userType === 'recruiter' ? 'default' : 'outline'}
                  onClick={() => setUserType('recruiter')}
                  className="flex-1"
                >
                  <Building2 className="w-4 h-4 mr-2" />
                  Recruiter
                </Button>
              </div>

              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  required
                />
              </div>

              <Button 
                type="submit" 
                className="w-full" 
                disabled={isLoading}
              >
                {isLoading ? 'Signing in...' : 'Sign In'}
              </Button>
            </form>

            <div className="mt-4 text-center text-sm text-gray-600">
              <p>
                Demo credentials: Use any email and password to sign in
              </p>
              <p className="mt-2">
                Don't have an account?{' '}
                <button
                  onClick={() => router.push('/auth/signup')}
                  className="text-blue-600 hover:underline"
                >
                  Sign up here
                </button>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}