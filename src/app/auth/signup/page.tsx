'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { GraduationCap, Building2, ArrowLeft, UserPlus } from 'lucide-react'

export default function SignUp() {
  const [userType, setUserType] = useState<'student' | 'recruiter'>('student')
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    // Student fields
    cgpa: '',
    experience: '',
    branch: '',
    yearOfPassing: '',
    // Recruiter fields
    company: ''
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  
  const router = useRouter()

  const branches = [
    'Computer Science',
    'Electronics',
    'Electrical',
    'Mechanical',
    'Civil',
    'Chemical',
    'Information Technology',
    'Other'
  ]

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setSuccess('')

    // Validation
    if (!formData.name || !formData.email || !formData.password) {
      setError('Name, email, and password are required')
      setLoading(false)
      return
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match')
      setLoading(false)
      return
    }

    if (userType === 'student') {
      if (!formData.cgpa || !formData.branch || !formData.yearOfPassing) {
        setError('CGPA, branch, and year of passing are required for students')
        setLoading(false)
        return
      }
    }

    if (userType === 'recruiter') {
      if (!formData.company) {
        setError('Company name is required for recruiters')
        setLoading(false)
        return
      }
    }

    try {
      const response = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userType,
          ...formData
        }),
      })

      const data = await response.json()

      if (response.ok) {
        setSuccess('Account created successfully! Please sign in.')
        setTimeout(() => {
          router.push('/auth/signin')
        }, 2000)
      } else {
        setError(data.error || 'Failed to create account')
      }
    } catch (error) {
      console.error('Error signing up:', error)
      setError('An error occurred. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="max-w-2xl w-full space-y-6">
        <div className="text-center">
          <Button 
            variant="ghost" 
            onClick={() => router.push('/')}
            className="mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Home
          </Button>
          <div className="flex items-center justify-center space-x-2 mb-4">
            <UserPlus className="h-8 w-8 text-blue-600" />
            <h1 className="text-3xl font-bold text-gray-900">Sign Up</h1>
          </div>
          <p className="text-gray-600">Create your placement portal account</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-center space-x-2">
              {userType === 'student' ? (
                <GraduationCap className="w-5 h-5 text-blue-600" />
              ) : (
                <Building2 className="w-5 h-5 text-green-600" />
              )}
              <span>Create {userType === 'student' ? 'Student' : 'Recruiter'} Account</span>
            </CardTitle>
            <CardDescription>
              Fill in the details below to create your account
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="flex space-x-2 mb-6">
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

              {success && (
                <Alert>
                  <AlertDescription>{success}</AlertDescription>
                </Alert>
              )}

              {/* Common Fields */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name">Full Name</Label>
                  <Input
                    id="name"
                    type="text"
                    value={formData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    placeholder="Enter your full name"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="email">Email Address</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    placeholder="Enter your email"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="password">Password</Label>
                  <Input
                    id="password"
                    type="password"
                    value={formData.password}
                    onChange={(e) => handleInputChange('password', e.target.value)}
                    placeholder="Create a password"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="confirmPassword">Confirm Password</Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    value={formData.confirmPassword}
                    onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                    placeholder="Confirm your password"
                    required
                  />
                </div>
              </div>

              {/* Student-specific Fields */}
              {userType === 'student' && (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <Label htmlFor="cgpa">CGPA</Label>
                      <Input
                        id="cgpa"
                        type="number"
                        step="0.01"
                        min="0"
                        max="10"
                        value={formData.cgpa}
                        onChange={(e) => handleInputChange('cgpa', e.target.value)}
                        placeholder="e.g. 8.5"
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="experience">Experience (months)</Label>
                      <Input
                        id="experience"
                        type="number"
                        min="0"
                        value={formData.experience}
                        onChange={(e) => handleInputChange('experience', e.target.value)}
                        placeholder="e.g. 0"
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="yearOfPassing">Year of Passing</Label>
                      <Input
                        id="yearOfPassing"
                        type="number"
                        min="2020"
                        max="2030"
                        value={formData.yearOfPassing}
                        onChange={(e) => handleInputChange('yearOfPassing', e.target.value)}
                        placeholder="e.g. 2024"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="branch">Branch</Label>
                    <Select value={formData.branch} onValueChange={(value) => handleInputChange('branch', value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select your branch" />
                      </SelectTrigger>
                      <SelectContent>
                        {branches.map((branch) => (
                          <SelectItem key={branch} value={branch}>
                            {branch}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </>
              )}

              {/* Recruiter-specific Fields */}
              {userType === 'recruiter' && (
                <div>
                  <Label htmlFor="company">Company Name</Label>
                  <Input
                    id="company"
                    type="text"
                    value={formData.company}
                    onChange={(e) => handleInputChange('company', e.target.value)}
                    placeholder="Enter your company name"
                    required
                  />
                </div>
              )}

              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? 'Creating Account...' : `Create ${userType === 'student' ? 'Student' : 'Recruiter'} Account`}
              </Button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-sm text-gray-600">
                Already have an account?{' '}
                <button
                  onClick={() => router.push('/auth/signin')}
                  className="text-blue-600 hover:underline font-medium"
                >
                  Sign in here
                </button>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}