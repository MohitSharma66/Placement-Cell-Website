'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { 
  GraduationCap, 
  User, 
  Briefcase, 
  FileText, 
  LogOut,
  Search,
  MapPin,
  DollarSign,
  Calendar
} from 'lucide-react'

interface Job {
  _id: string
  title: string
  description: string
  company: string
  type: 'internship' | 'job'
  minCgpa: number
  minExperience: number
  requiredBranches: string[]
  location: string
  salary?: string
  createdAt: string
}

interface StudentProfile {
  _id: string
  email: string
  name: string
  cgpa: number
  experience: number
  branch: string
  yearOfPassing: number
  resumes: string[]
}

function ProfileForm() {
  const { data: session } = useSession()
  const [profile, setProfile] = useState<StudentProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [formData, setFormData] = useState({
    cgpa: '',
    experience: '',
    branch: '',
    yearOfPassing: ''
  })
  const [message, setMessage] = useState('')

  useEffect(() => {
    fetchProfile()
  }, [])

  const fetchProfile = async () => {
    try {
      const response = await fetch('/api/student/profile')
      if (response.ok) {
        const data = await response.json()
        setProfile(data)
        setFormData({
          cgpa: data.cgpa.toString(),
          experience: data.experience.toString(),
          branch: data.branch,
          yearOfPassing: data.yearOfPassing.toString()
        })
      } else if (response.status === 404) {
        // Profile doesn't exist yet
        setProfile(null)
      }
    } catch (error) {
      console.error('Error fetching profile:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setMessage('')

    try {
      const url = profile ? '/api/student/profile' : '/api/student/create'
      const method = profile ? 'PUT' : 'POST'
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      if (response.ok) {
        setMessage('Profile saved successfully!')
        fetchProfile() // Refresh profile data
      } else {
        const error = await response.json()
        setMessage(error.error || 'Failed to save profile')
      }
    } catch (error) {
      console.error('Error saving profile:', error)
      setMessage('Failed to save profile')
    } finally {
      setSaving(false)
    }
  }

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

  if (loading) {
    return <div className="text-center py-8">Loading profile...</div>
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {message && (
        <Alert variant={message.includes('success') ? 'default' : 'destructive'}>
          <AlertDescription>{message}</AlertDescription>
        </Alert>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="name">Full Name</Label>
          <Input
            id="name"
            value={session?.user?.name || ''}
            disabled
            className="bg-gray-50"
          />
        </div>
        <div>
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            value={session?.user?.email || ''}
            disabled
            className="bg-gray-50"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="cgpa">CGPA</Label>
          <Input
            id="cgpa"
            type="number"
            step="0.01"
            min="0"
            max="10"
            value={formData.cgpa}
            onChange={(e) => setFormData({...formData, cgpa: e.target.value})}
            placeholder="Enter your CGPA"
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
            onChange={(e) => setFormData({...formData, experience: e.target.value})}
            placeholder="Enter experience in months"
            required
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="branch">Branch</Label>
          <Select value={formData.branch} onValueChange={(value) => setFormData({...formData, branch: value})}>
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
        <div>
          <Label htmlFor="yearOfPassing">Year of Passing</Label>
          <Input
            id="yearOfPassing"
            type="number"
            min="2020"
            max="2030"
            value={formData.yearOfPassing}
            onChange={(e) => setFormData({...formData, yearOfPassing: e.target.value})}
            placeholder="Enter year of passing"
            required
          />
        </div>
      </div>

      <Button type="submit" disabled={saving}>
        {saving ? 'Saving...' : profile ? 'Update Profile' : 'Create Profile'}
      </Button>
    </form>
  )
}

function ResumeManager() {
  const [resumes, setResumes] = useState<string[]>([])
  const [newResumeLink, setNewResumeLink] = useState('')
  const [loading, setLoading] = useState(true)
  const [adding, setAdding] = useState(false)
  const [message, setMessage] = useState('')

  useEffect(() => {
    fetchResumes()
  }, [])

  const fetchResumes = async () => {
    try {
      const response = await fetch('/api/student/resumes')
      if (response.ok) {
        const data = await response.json()
        setResumes(data)
      }
    } catch (error) {
      console.error('Error fetching resumes:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleAddResume = async (e: React.FormEvent) => {
    e.preventDefault()
    setAdding(true)
    setMessage('')

    try {
      const response = await fetch('/api/student/resumes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ resumeLink: newResumeLink }),
      })

      if (response.ok) {
        const data = await response.json()
        setResumes(data.resumes)
        setNewResumeLink('')
        setMessage('Resume added successfully!')
      } else {
        const error = await response.json()
        setMessage(error.error || 'Failed to add resume')
      }
    } catch (error) {
      console.error('Error adding resume:', error)
      setMessage('Failed to add resume')
    } finally {
      setAdding(false)
    }
  }

  const handleRemoveResume = async (resumeLink: string) => {
    try {
      const response = await fetch('/api/student/resumes', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ resumeLink }),
      })

      if (response.ok) {
        const data = await response.json()
        setResumes(data.resumes)
        setMessage('Resume removed successfully!')
      } else {
        const error = await response.json()
        setMessage(error.error || 'Failed to remove resume')
      }
    } catch (error) {
      console.error('Error removing resume:', error)
      setMessage('Failed to remove resume')
    }
  }

  if (loading) {
    return <div className="text-center py-8">Loading resumes...</div>
  }

  return (
    <div className="space-y-6">
      {message && (
        <Alert variant={message.includes('success') ? 'default' : 'destructive'}>
          <AlertDescription>{message}</AlertDescription>
        </Alert>
      )}

      <form onSubmit={handleAddResume} className="space-y-4">
        <div>
          <Label htmlFor="resumeLink">Google Drive Resume Link</Label>
          <Input
            id="resumeLink"
            type="url"
            value={newResumeLink}
            onChange={(e) => setNewResumeLink(e.target.value)}
            placeholder="https://drive.google.com/file/d/..."
            pattern="https://drive\.google\.com.*"
            required
          />
          <p className="text-sm text-gray-500 mt-1">
            Please provide a valid Google Drive link to your resume
          </p>
        </div>
        <Button type="submit" disabled={adding}>
          {adding ? 'Adding...' : 'Add Resume'}
        </Button>
      </form>

      <div className="space-y-4">
        <h3 className="text-lg font-medium">Your Resumes</h3>
        {resumes.length === 0 ? (
          <div className="text-center py-8">
            <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">No resumes added yet</p>
          </div>
        ) : (
          <div className="space-y-2">
            {resumes.map((resume, index) => (
              <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center space-x-3">
                  <FileText className="h-5 w-5 text-gray-500" />
                  <div>
                    <p className="font-medium">Resume {index + 1}</p>
                    <a 
                      href={resume} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-sm text-blue-600 hover:underline"
                    >
                      View Resume
                    </a>
                  </div>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleRemoveResume(resume)}
                >
                  Remove
                </Button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

interface JobFiltersProps {
  onFilter: (filters?: any) => void
}

function JobFilters({ onFilter }: JobFiltersProps) {
  const [searchTerm, setSearchTerm] = useState('')
  const [jobType, setJobType] = useState<'all' | 'internship' | 'job'>('all')
  const [isOpen, setIsOpen] = useState(false)

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

  const handleFilter = () => {
    const filters: any = {}
    
    if (jobType !== 'all') {
      filters.type = jobType
    }
    
    if (searchTerm) {
      // This would be handled on the server side
      filters.search = searchTerm
    }

    onFilter(filters)
    setIsOpen(false)
  }

  return (
    <div className="relative">
      <Button variant="outline" size="sm" onClick={() => setIsOpen(!isOpen)}>
        <Search className="h-4 w-4 mr-2" />
        Filters
      </Button>
      
      {isOpen && (
        <div className="absolute right-0 top-full mt-2 w-80 bg-white border rounded-lg shadow-lg p-4 z-10">
          <div className="space-y-4">
            <div>
              <Label htmlFor="search">Search</Label>
              <Input
                id="search"
                placeholder="Search jobs..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            
            <div>
              <Label>Job Type</Label>
              <div className="flex space-x-2 mt-2">
                <Button
                  variant={jobType === 'all' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setJobType('all')}
                >
                  All
                </Button>
                <Button
                  variant={jobType === 'internship' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setJobType('internship')}
                >
                  Internship
                </Button>
                <Button
                  variant={jobType === 'job' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setJobType('job')}
                >
                  Full-time
                </Button>
              </div>
            </div>

            <div className="flex space-x-2">
              <Button size="sm" onClick={handleFilter}>
                Apply Filters
              </Button>
              <Button variant="outline" size="sm" onClick={() => setIsOpen(false)}>
                Cancel
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

interface JobCardProps {
  job: Job
  onApply: (jobId: string, resumeLink?: string) => void
  studentResumes: string[]
}

function JobCard({ job, onApply, studentResumes }: JobCardProps) {
  const [showApplyDialog, setShowApplyDialog] = useState(false)
  const [selectedResume, setSelectedResume] = useState('')

  const handleApplyClick = () => {
    if (studentResumes.length === 0) {
      alert('Please add at least one resume before applying')
      return
    }
    if (studentResumes.length === 1) {
      onApply(job._id, studentResumes[0])
    } else {
      setSelectedResume(studentResumes[0])
      setShowApplyDialog(true)
    }
  }

  const handleConfirmApply = () => {
    onApply(job._id, selectedResume)
    setShowApplyDialog(false)
  }

  return (
    <>
      <Card className="hover:shadow-md transition-shadow">
        <CardHeader>
          <div className="flex justify-between items-start">
            <div>
              <CardTitle className="text-xl">{job.title}</CardTitle>
              <CardDescription className="text-lg font-medium text-gray-700">
                {job.company}
              </CardDescription>
            </div>
            <Badge variant={job.type === 'internship' ? 'secondary' : 'default'}>
              {job.type === 'internship' ? 'Internship' : 'Full-time'}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <p className="text-gray-600">{job.description}</p>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div className="flex items-center space-x-2">
                <MapPin className="h-4 w-4 text-gray-500" />
                <span>{job.location}</span>
              </div>
              {job.salary && (
                <div className="flex items-center space-x-2">
                  <DollarSign className="h-4 w-4 text-gray-500" />
                  <span>{job.salary}</span>
                </div>
              )}
              <div className="flex items-center space-x-2">
                <Calendar className="h-4 w-4 text-gray-500" />
                <span>Min CGPA: {job.minCgpa}</span>
              </div>
              <div className="flex items-center space-x-2">
                <Briefcase className="h-4 w-4 text-gray-500" />
                <span>Min Exp: {job.minExperience} months</span>
              </div>
            </div>

            <div className="flex justify-between items-center">
              <div className="flex flex-wrap gap-2">
                {job.requiredBranches.map((branch) => (
                  <Badge key={branch} variant="outline" className="text-xs">
                    {branch}
                  </Badge>
                ))}
              </div>
              <Button onClick={handleApplyClick}>
                Apply Now
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Resume Selection Dialog */}
      {showApplyDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-96 max-w-90vw">
            <h3 className="text-lg font-semibold mb-4">Select Resume</h3>
            <p className="text-sm text-gray-600 mb-4">
              Choose which resume to submit for this application:
            </p>
            
            <div className="space-y-2 mb-4">
              {studentResumes.map((resume, index) => (
                <label key={index} className="flex items-center space-x-2 p-2 border rounded cursor-pointer hover:bg-gray-50">
                  <input
                    type="radio"
                    name="resume"
                    value={resume}
                    checked={selectedResume === resume}
                    onChange={(e) => setSelectedResume(e.target.value)}
                    className="text-blue-600"
                  />
                  <span className="text-sm">Resume {index + 1}</span>
                </label>
              ))}
            </div>

            <div className="flex space-x-2">
              <Button onClick={handleConfirmApply} disabled={!selectedResume}>
                Apply with Selected Resume
              </Button>
              <Button variant="outline" onClick={() => setShowApplyDialog(false)}>
                Cancel
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

interface Application {
  _id: string
  studentId: string
  jobId: string
  status: 'pending' | 'reviewed' | 'accepted' | 'rejected'
  resumeLink: string
  appliedAt: string
  job?: {
    _id: string
    title: string
    company: string
    type: 'internship' | 'job'
    location: string
    salary?: string
  }
}

function ApplicationsList() {
  const [applications, setApplications] = useState<Application[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchApplications()
  }, [])

  const fetchApplications = async () => {
    try {
      const response = await fetch('/api/student/applications')
      if (response.ok) {
        const data = await response.json()
        setApplications(data)
      }
    } catch (error) {
      console.error('Error fetching applications:', error)
    } finally {
      setLoading(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800'
      case 'reviewed':
        return 'bg-blue-100 text-blue-800'
      case 'accepted':
        return 'bg-green-100 text-green-800'
      case 'rejected':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending':
        return 'Pending Review'
      case 'reviewed':
        return 'Under Review'
      case 'accepted':
        return 'Accepted'
      case 'rejected':
        return 'Rejected'
      default:
        return status
    }
  }

  if (loading) {
    return <div className="text-center py-8">Loading applications...</div>
  }

  if (applications.length === 0) {
    return (
      <div className="text-center py-8">
        <Search className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <p className="text-gray-500">No applications found</p>
        <p className="text-sm text-gray-400 mt-2">Start applying for jobs to see your applications here</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {applications.map((application) => (
        <Card key={application._id} className="hover:shadow-md transition-shadow">
          <CardContent className="pt-6">
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <div className="flex items-center space-x-3 mb-2">
                  <h3 className="text-lg font-semibold">{application.job?.title}</h3>
                  <Badge className={getStatusColor(application.status)}>
                    {getStatusText(application.status)}
                  </Badge>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600">
                  <div>
                    <span className="font-medium">Company:</span> {application.job?.company}
                  </div>
                  <div>
                    <span className="font-medium">Type:</span> {application.job?.type === 'internship' ? 'Internship' : 'Full-time'}
                  </div>
                  <div>
                    <span className="font-medium">Location:</span> {application.job?.location}
                  </div>
                </div>

                <div className="mt-3 text-sm text-gray-500">
                  <span className="font-medium">Applied:</span> {new Date(application.appliedAt).toLocaleDateString()}
                </div>

                {application.resumeLink && (
                  <div className="mt-2">
                    <a 
                      href={application.resumeLink} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-sm text-blue-600 hover:underline"
                    >
                      View Submitted Resume
                    </a>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

export default function StudentPortal() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [jobs, setJobs] = useState<Job[]>([])
  const [studentResumes, setStudentResumes] = useState<string[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin')
      return
    }

    if (status === 'authenticated' && session?.user?.userType !== 'student') {
      router.push('/')
      return
    }

    if (status === 'authenticated') {
      fetchJobs()
      fetchStudentResumes()
    }
  }, [status, session, router])

  const fetchJobs = async () => {
    try {
      const response = await fetch('/api/jobs')
      if (response.ok) {
        const data = await response.json()
        setJobs(data)
      }
    } catch (error) {
      console.error('Error fetching jobs:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchStudentResumes = async () => {
    try {
      const response = await fetch('/api/student/resumes')
      if (response.ok) {
        const data = await response.json()
        setStudentResumes(data)
      }
    } catch (error) {
      console.error('Error fetching resumes:', error)
    }
  }

  const handleSignOut = async () => {
    await router.push('/')
  }

  const handleApply = async (jobId: string, resumeLink?: string) => {
    try {
      const response = await fetch('/api/applications', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ jobId, resumeLink }),
      })

      if (response.ok) {
        alert('Application submitted successfully!')
        fetchJobs() // Refresh jobs to update application status
      } else {
        alert('Failed to submit application')
      }
    } catch (error) {
      console.error('Error applying for job:', error)
      alert('Failed to submit application')
    }
  }

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <GraduationCap className="h-8 w-8 text-blue-600 mr-3" />
              <h1 className="text-xl font-semibold text-gray-900">Student Portal</h1>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">
                Welcome, {session?.user?.name}
              </span>
              <Button variant="outline" size="sm" onClick={handleSignOut}>
                <LogOut className="h-4 w-4 mr-2" />
                Sign Out
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Tabs defaultValue="jobs" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="jobs" className="flex items-center space-x-2">
              <Briefcase className="h-4 w-4" />
              <span>Job Opportunities</span>
            </TabsTrigger>
            <TabsTrigger value="profile" className="flex items-center space-x-2">
              <User className="h-4 w-4" />
              <span>My Profile</span>
            </TabsTrigger>
            <TabsTrigger value="resumes" className="flex items-center space-x-2">
              <FileText className="h-4 w-4" />
              <span>My Resumes</span>
            </TabsTrigger>
            <TabsTrigger value="applications" className="flex items-center space-x-2">
              <Search className="h-4 w-4" />
              <span>My Applications</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="jobs" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold text-gray-900">Available Opportunities</h2>
              <div className="flex space-x-2">
                <JobFilters onFilter={fetchJobs} />
              </div>
            </div>

            <div className="grid gap-6">
              {jobs.map((job) => (
                <JobCard key={job._id} job={job} onApply={handleApply} studentResumes={studentResumes} />
              ))}
            </div>
          </TabsContent>

          <TabsContent value="profile" className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-900">My Profile</h2>
            <Card>
              <CardHeader>
                <CardTitle>Profile Information</CardTitle>
                <CardDescription>
                  Manage your academic and professional information
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ProfileForm />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="resumes" className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-900">My Resumes</h2>
            <Card>
              <CardHeader>
                <CardTitle>Resume Management</CardTitle>
                <CardDescription>
                  Add and manage your Google Drive resume links
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ResumeManager />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="applications" className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-900">My Applications</h2>
            <Card>
              <CardHeader>
                <CardTitle>Application Status</CardTitle>
                <CardDescription>
                  Track the status of your job applications
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ApplicationsList />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}