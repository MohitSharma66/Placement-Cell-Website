'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { 
  Building2, 
  User, 
  Briefcase, 
  Users, 
  LogOut,
  Plus,
  Search,
  MapPin,
  DollarSign,
  Calendar,
  FileText,
  X,
  Eye
} from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Alert, AlertDescription } from '@/components/ui/alert'

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
  applications: string[]
  createdAt: string
}

interface JobApplication {
  _id: string
  studentId: string
  jobId: string
  status: 'pending' | 'reviewed' | 'accepted' | 'rejected'
  resumeLink: string
  appliedAt: string
  student?: {
    _id: string
    name: string
    email: string
    cgpa: number
    experience: number
    branch: string
    yearOfPassing: number
  }
}

interface JobApplicationsDialogProps {
  jobId: string
  jobTitle: string
  companyName: string
}

function JobApplicationsDialog({ jobId, jobTitle, companyName }: JobApplicationsDialogProps) {
  const [applications, setApplications] = useState<JobApplication[]>([])
  const [loading, setLoading] = useState(true)
  const [open, setOpen] = useState(false)

  useEffect(() => {
    if (open) {
      fetchApplications()
    }
  }, [open])

  const fetchApplications = async () => {
    try {
      const response = await fetch(`/api/jobs/${jobId}/applications`)
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

  const updateApplicationStatus = async (applicationId: string, status: string) => {
    try {
      const response = await fetch('/api/recruiter/applications', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ applicationId, status }),
      })

      if (response.ok) {
        fetchApplications() // Refresh the list
      } else {
        alert('Failed to update application status')
      }
    } catch (error) {
      console.error('Error updating application status:', error)
      alert('Failed to update application status')
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

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Eye className="h-4 w-4 mr-2" />
          View Applications ({applications.length})
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            Applications for {jobTitle} at {companyName}
          </DialogTitle>
        </DialogHeader>
        
        {loading ? (
          <div className="text-center py-8">Loading applications...</div>
        ) : applications.length === 0 ? (
          <div className="text-center py-8">
            <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">No applications yet</p>
          </div>
        ) : (
          <div className="space-y-4">
            {applications.map((application) => (
              <Card key={application._id} className="hover:shadow-md transition-shadow">
                <CardContent className="pt-6">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-lg font-semibold">{application.student?.name}</h3>
                      <p className="text-sm text-gray-600">{application.student?.email}</p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge className={getStatusColor(application.status)}>
                        {getStatusText(application.status)}
                      </Badge>
                      <select
                        value={application.status}
                        onChange={(e) => updateApplicationStatus(application._id, e.target.value)}
                        className="text-sm border rounded px-2 py-1"
                      >
                        <option value="pending">Pending Review</option>
                        <option value="reviewed">Under Review</option>
                        <option value="accepted">Accept</option>
                        <option value="rejected">Reject</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm mb-4">
                    <div>
                      <span className="font-medium">CGPA:</span> {application.student?.cgpa}
                    </div>
                    <div>
                      <span className="font-medium">Branch:</span> {application.student?.branch}
                    </div>
                    <div>
                      <span className="font-medium">Experience:</span> {application.student?.experience} months
                    </div>
                    <div>
                      <span className="font-medium">Year:</span> {application.student?.yearOfPassing}
                    </div>
                  </div>

                  <div className="flex justify-between items-center">
                    <div className="text-sm text-gray-500">
                      Applied: {new Date(application.appliedAt).toLocaleDateString()}
                    </div>
                    {application.resumeLink && (
                      <a 
                        href={application.resumeLink} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-sm text-blue-600 hover:underline inline-flex items-center"
                      >
                        <FileText className="h-4 w-4 mr-1" />
                        View Resume
                      </a>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}

interface JobPostingFormProps {
  onSuccess: () => void
}

function JobPostingForm({ onSuccess }: JobPostingFormProps) {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    company: '',
    type: 'internship' as 'internship' | 'job',
    minCgpa: '',
    minExperience: '',
    requiredBranches: [] as string[],
    location: '',
    salary: ''
  })
  const [posting, setPosting] = useState(false)
  const [message, setMessage] = useState('')

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

  const handleBranchChange = (branch: string, checked: boolean) => {
    if (checked) {
      setFormData(prev => ({
        ...prev,
        requiredBranches: [...prev.requiredBranches, branch]
      }))
    } else {
      setFormData(prev => ({
        ...prev,
        requiredBranches: prev.requiredBranches.filter(b => b !== branch)
      }))
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setPosting(true)
    setMessage('')

    try {
      const response = await fetch('/api/jobs/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      if (response.ok) {
        setMessage('Job posted successfully!')
        setFormData({
          title: '',
          description: '',
          company: '',
          type: 'internship',
          minCgpa: '',
          minExperience: '',
          requiredBranches: [],
          location: '',
          salary: ''
        })
        onSuccess()
      } else {
        const error = await response.json()
        setMessage(error.error || 'Failed to post job')
      }
    } catch (error) {
      console.error('Error posting job:', error)
      setMessage('Failed to post job')
    } finally {
      setPosting(false)
    }
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
          <Label htmlFor="title">Job Title</Label>
          <Input
            id="title"
            value={formData.title}
            onChange={(e) => setFormData({...formData, title: e.target.value})}
            placeholder="e.g. Software Development Intern"
            required
          />
        </div>
        <div>
          <Label htmlFor="company">Company Name</Label>
          <Input
            id="company"
            value={formData.company}
            onChange={(e) => setFormData({...formData, company: e.target.value})}
            placeholder="e.g. Tech Corp"
            required
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <Label htmlFor="type">Job Type</Label>
          <Select value={formData.type} onValueChange={(value: 'internship' | 'job') => setFormData({...formData, type: value})}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="internship">Internship</SelectItem>
              <SelectItem value="job">Full-time</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label htmlFor="location">Location</Label>
          <Input
            id="location"
            value={formData.location}
            onChange={(e) => setFormData({...formData, location: e.target.value})}
            placeholder="e.g. Bangalore, Remote"
            required
          />
        </div>
        <div>
          <Label htmlFor="salary">Salary (optional)</Label>
          <Input
            id="salary"
            value={formData.salary}
            onChange={(e) => setFormData({...formData, salary: e.target.value})}
            placeholder="e.g. ₹10,000/month, ₹8 LPA"
          />
        </div>
      </div>

      <div>
        <Label htmlFor="description">Job Description</Label>
        <Textarea
          id="description"
          value={formData.description}
          onChange={(e) => setFormData({...formData, description: e.target.value})}
          placeholder="Describe the role, responsibilities, and requirements..."
          rows={4}
          required
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="minCgpa">Minimum CGPA Required</Label>
          <Input
            id="minCgpa"
            type="number"
            step="0.01"
            min="0"
            max="10"
            value={formData.minCgpa}
            onChange={(e) => setFormData({...formData, minCgpa: e.target.value})}
            placeholder="e.g. 7.5"
            required
          />
        </div>
        <div>
          <Label htmlFor="minExperience">Minimum Experience (months)</Label>
          <Input
            id="minExperience"
            type="number"
            min="0"
            value={formData.minExperience}
            onChange={(e) => setFormData({...formData, minExperience: e.target.value})}
            placeholder="e.g. 0"
            required
          />
        </div>
      </div>

      <div>
        <Label>Required Branches</Label>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-2">
          {branches.map((branch) => (
            <div key={branch} className="flex items-center space-x-2">
              <Checkbox
                id={branch}
                checked={formData.requiredBranches.includes(branch)}
                onCheckedChange={(checked) => handleBranchChange(branch, checked as boolean)}
              />
              <Label htmlFor={branch} className="text-sm">{branch}</Label>
            </div>
          ))}
        </div>
      </div>

      <Button type="submit" disabled={posting}>
        {posting ? 'Posting...' : 'Post Job'}
      </Button>
    </form>
  )
}

export default function RecruiterPortal() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [jobs, setJobs] = useState<Job[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin')
      return
    }

    if (status === 'authenticated' && session?.user?.userType !== 'recruiter') {
      router.push('/')
      return
    }

    if (status === 'authenticated') {
      fetchJobs()
    }
  }, [status, session, router])

  const fetchJobs = async () => {
    try {
      const response = await fetch(`/api/jobs/recruiter/${session?.user?.id}`)
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

  const handleSignOut = async () => {
    await router.push('/')
  }

  const handlePostJob = () => {
    // TODO: Navigate to job posting form
    alert('Job posting form coming soon!')
  }

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
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
              <Building2 className="h-8 w-8 text-green-600 mr-3" />
              <h1 className="text-xl font-semibold text-gray-900">Recruiter Portal</h1>
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
              <span>My Jobs</span>
            </TabsTrigger>
            <TabsTrigger value="post" className="flex items-center space-x-2">
              <Plus className="h-4 w-4" />
              <span>Post Job</span>
            </TabsTrigger>
            <TabsTrigger value="applications" className="flex items-center space-x-2">
              <Users className="h-4 w-4" />
              <span>Applications</span>
            </TabsTrigger>
            <TabsTrigger value="profile" className="flex items-center space-x-2">
              <User className="h-4 w-4" />
              <span>Profile</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="jobs" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold text-gray-900">My Job Postings</h2>
              <div className="flex space-x-2">
                <Button variant="outline" size="sm">
                  <Search className="h-4 w-4 mr-2" />
                  Search
                </Button>
              </div>
            </div>

            <div className="grid gap-6">
              {jobs.length === 0 ? (
                <Card>
                  <CardContent className="text-center py-12">
                    <Briefcase className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No jobs posted yet</h3>
                    <p className="text-gray-600 mb-4">Start by posting your first job opportunity</p>
                    <Button onClick={handlePostJob}>
                      <Plus className="h-4 w-4 mr-2" />
                      Post Your First Job
                    </Button>
                  </CardContent>
                </Card>
              ) : (
                jobs.map((job) => (
                  <Card key={job._id} className="hover:shadow-md transition-shadow">
                    <CardHeader>
                      <div className="flex justify-between items-start">
                        <div>
                          <CardTitle className="text-xl">{job.title}</CardTitle>
                          <CardDescription className="text-lg font-medium text-gray-700">
                            {job.company}
                          </CardDescription>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Badge variant={job.type === 'internship' ? 'secondary' : 'default'}>
                            {job.type === 'internship' ? 'Internship' : 'Full-time'}
                          </Badge>
                          <Badge variant="outline">
                            {job.applications.length} applications
                          </Badge>
                        </div>
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
                          <div className="flex space-x-2">
                            <JobApplicationsDialog 
                              jobId={job._id}
                              jobTitle={job.title}
                              companyName={job.company}
                            />
                            <Button variant="outline" size="sm">
                              Edit
                            </Button>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </TabsContent>

          <TabsContent value="post" className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-900">Post New Job</h2>
            <Card>
              <CardHeader>
                <CardTitle>Job Details</CardTitle>
                <CardDescription>
                  Create a new job posting for students
                </CardDescription>
              </CardHeader>
              <CardContent>
                <JobPostingForm onSuccess={fetchJobs} />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="applications" className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-900">All Applications</h2>
            <Card>
              <CardHeader>
                <CardTitle>Application Management</CardTitle>
                <CardDescription>
                  Review and manage student applications
                </CardDescription>
              </CardHeader>
              <CardContent>
                <RecruiterApplications />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="profile" className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-900">Company Profile</h2>
            <Card>
              <CardHeader>
                <CardTitle>Profile Information</CardTitle>
                <CardDescription>
                  Manage your company and recruiter information
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-gray-700">Recruiter Name</label>
                      <p className="text-gray-900">{session?.user?.name}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-700">Email</label>
                      <p className="text-gray-900">{session?.user?.email}</p>
                    </div>
                  </div>
                  <div className="text-center py-8">
                    <p className="text-gray-500">Profile management coming soon...</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}

interface RecruiterApplication {
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
  student?: {
    _id: string
    name: string
    email: string
    cgpa: number
    experience: number
    branch: string
    yearOfPassing: number
  }
}

function RecruiterApplications() {
  const [applications, setApplications] = useState<RecruiterApplication[]>([])
  const [filteredApplications, setFilteredApplications] = useState<RecruiterApplication[]>([])
  const [loading, setLoading] = useState(true)
  const [filters, setFilters] = useState({
    company: '',
    jobTitle: '',
    status: 'all' // Changed from empty string to 'all'
  })

  useEffect(() => {
    fetchApplications()
  }, [])

  useEffect(() => {
    filterApplications()
  }, [applications, filters])

  const fetchApplications = async () => {
    try {
      const response = await fetch('/api/recruiter/applications')
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

  const filterApplications = () => {
    let filtered = applications

    if (filters.company) {
      filtered = filtered.filter(app => 
        app.job?.company?.toLowerCase().includes(filters.company.toLowerCase())
      )
    }

    if (filters.jobTitle) {
      filtered = filtered.filter(app => 
        app.job?.title?.toLowerCase().includes(filters.jobTitle.toLowerCase())
      )
    }

    if (filters.status && filters.status !== 'all') {
      filtered = filtered.filter(app => app.status === filters.status)
    }

    setFilteredApplications(filtered)
  }

  const updateApplicationStatus = async (applicationId: string, status: string) => {
    try {
      const response = await fetch('/api/recruiter/applications', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ applicationId, status }),
      })

      if (response.ok) {
        fetchApplications() // Refresh the list
      } else {
        alert('Failed to update application status')
      }
    } catch (error) {
      console.error('Error updating application status:', error)
      alert('Failed to update application status')
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

  return (
    <div className="space-y-6">
      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="companyFilter">Filter by Company</Label>
              <Input
                id="companyFilter"
                placeholder="Enter company name..."
                value={filters.company}
                onChange={(e) => setFilters({...filters, company: e.target.value})}
              />
            </div>
            <div>
              <Label htmlFor="jobTitleFilter">Filter by Job Title</Label>
              <Input
                id="jobTitleFilter"
                placeholder="Enter job title..."
                value={filters.jobTitle}
                onChange={(e) => setFilters({...filters, jobTitle: e.target.value})}
              />
            </div>
            <div>
              <Label htmlFor="statusFilter">Filter by Status</Label>
              <Select value={filters.status} onValueChange={(value) => setFilters({...filters, status: value})}>
                <SelectTrigger>
                  <SelectValue placeholder="All statuses" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="pending">Pending Review</SelectItem>
                  <SelectItem value="reviewed">Under Review</SelectItem>
                  <SelectItem value="accepted">Accepted</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {filteredApplications.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">
              {applications.length === 0 ? 'No applications found' : 'No applications match your filters'}
            </p>
            {applications.length > 0 && (
              <p className="text-sm text-gray-400 mt-2">
                Try adjusting your filter criteria
              </p>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {filteredApplications.map((application) => (
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
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                      <div>
                        <h4 className="font-medium text-gray-900 mb-2">Student Information</h4>
                        <div className="space-y-1 text-sm">
                          <p><span className="font-medium">Name:</span> {application.student?.name}</p>
                          <p><span className="font-medium">Email:</span> {application.student?.email}</p>
                          <p><span className="font-medium">Branch:</span> {application.student?.branch}</p>
                          <p><span className="font-medium">CGPA:</span> {application.student?.cgpa}</p>
                          <p><span className="font-medium">Experience:</span> {application.student?.experience} months</p>
                          <p><span className="font-medium">Year of Passing:</span> {application.student?.yearOfPassing}</p>
                        </div>
                      </div>
                      <div>
                        <h4 className="font-medium text-gray-900 mb-2">Job Details</h4>
                        <div className="space-y-1 text-sm">
                          <p><span className="font-medium">Company:</span> {application.job?.company}</p>
                          <p><span className="font-medium">Type:</span> {application.job?.type === 'internship' ? 'Internship' : 'Full-time'}</p>
                          <p><span className="font-medium">Location:</span> {application.job?.location}</p>
                          {application.job?.salary && (
                            <p><span className="font-medium">Salary:</span> {application.job?.salary}</p>
                          )}
                          <p><span className="font-medium">Applied:</span> {new Date(application.appliedAt).toLocaleDateString()}</p>
                        </div>
                      </div>
                    </div>

                    {application.resumeLink && (
                      <div className="mb-4">
                        <a 
                          href={application.resumeLink} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-sm text-blue-600 hover:underline inline-flex items-center"
                        >
                          <FileText className="h-4 w-4 mr-1" />
                          View Student's Resume
                        </a>
                      </div>
                    )}

                    <div className="flex items-center space-x-2">
                      <span className="text-sm font-medium text-gray-700">Update Status:</span>
                      <select
                        value={application.status}
                        onChange={(e) => updateApplicationStatus(application._id, e.target.value)}
                        className="text-sm border rounded px-2 py-1"
                      >
                        <option value="pending">Pending Review</option>
                        <option value="reviewed">Under Review</option>
                        <option value="accepted">Accept</option>
                        <option value="rejected">Reject</option>
                      </select>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}