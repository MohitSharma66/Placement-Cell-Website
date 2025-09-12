'use client'

import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { GraduationCap, Building2 } from 'lucide-react'

export default function Home() {
  const router = useRouter()

  const handlePortalSelect = (portal: 'student' | 'recruiter') => {
    router.push('/auth/signin')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="max-w-4xl w-full space-y-8">
        <div className="text-center space-y-4">
          <div className="relative w-24 h-24 mx-auto">
            <img
              src="/logo.svg"
              alt="College Placement Portal"
              className="w-full h-full object-contain"
            />
          </div>
          <h1 className="text-4xl font-bold text-gray-900">College Placement Portal</h1>
          <p className="text-xl text-gray-600">Connect students with career opportunities</p>
        </div>

        <div className="grid md:grid-cols-2 gap-6 mt-12">
          <Card className="hover:shadow-lg transition-shadow cursor-pointer border-2 border-transparent hover:border-blue-200"
                onClick={() => handlePortalSelect('student')}>
            <CardHeader className="text-center">
              <div className="w-16 h-16 mx-auto bg-blue-100 rounded-full flex items-center justify-center mb-4">
                <GraduationCap className="w-8 h-8 text-blue-600" />
              </div>
              <CardTitle className="text-2xl">Student Portal</CardTitle>
              <CardDescription>
                Access job opportunities, manage your profile, and track applications
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-sm text-gray-600">
                <p>• Browse internships and job opportunities</p>
                <p>• Create and manage your profile</p>
                <p>• Upload multiple resumes</p>
                <p>• Track application status</p>
              </div>
              <Button className="w-full mt-4" variant="outline">
                Enter Student Portal
              </Button>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow cursor-pointer border-2 border-transparent hover:border-green-200"
                onClick={() => handlePortalSelect('recruiter')}>
            <CardHeader className="text-center">
              <div className="w-16 h-16 mx-auto bg-green-100 rounded-full flex items-center justify-center mb-4">
                <Building2 className="w-8 h-8 text-green-600" />
              </div>
              <CardTitle className="text-2xl">Recruiter Portal</CardTitle>
              <CardDescription>
                Post job opportunities and find qualified candidates
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-sm text-gray-600">
                <p>• Post internship and job opportunities</p>
                <p>• Set qualification requirements</p>
                <p>• Review student applications</p>
                <p>• Manage job postings</p>
              </div>
              <Button className="w-full mt-4" variant="outline">
                Enter Recruiter Portal
              </Button>
            </CardContent>
          </Card>
        </div>

        <div className="text-center mt-8">
          <p className="text-gray-500">
            Please select your portal to get started
          </p>
          <p className="text-sm text-gray-400 mt-2">
            New user?{' '}
            <button
              onClick={() => router.push('/auth/signup')}
              className="text-blue-600 hover:underline font-medium"
            >
              Create an account
            </button>
          </p>
        </div>
      </div>
    </div>
  )
}