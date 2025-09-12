import { NextResponse } from 'next/server'
import { db } from '@/lib/db-mongodb'

export async function POST() {
  try {
    // Create a sample recruiter first
    const recruiterId = await db.createRecruiter({
      email: 'recruiter@techcorp.com',
      name: 'John Recruiter',
      company: 'Tech Corp'
    })

    // Sample jobs
    const sampleJobs = [
      {
        title: 'Software Development Intern',
        description: 'Join our team as a software development intern and work on cutting-edge projects. You will learn from experienced engineers and contribute to real-world applications.',
        company: 'Tech Corp',
        type: 'internship' as const,
        minCgpa: 7.0,
        minExperience: 0,
        requiredBranches: ['Computer Science', 'Information Technology'],
        location: 'Bangalore',
        salary: '₹15,000/month',
        postedBy: recruiterId
      },
      {
        title: 'Full Stack Developer',
        description: 'We are looking for a passionate full stack developer to join our team. You will work on both frontend and backend development using modern technologies.',
        company: 'Tech Corp',
        type: 'job' as const,
        minCgpa: 7.5,
        minExperience: 6,
        requiredBranches: ['Computer Science', 'Information Technology'],
        location: 'Bangalore',
        salary: '₹8 LPA',
        postedBy: recruiterId
      },
      {
        title: 'Data Science Intern',
        description: 'Exciting opportunity to work with data science teams on machine learning projects and data analysis.',
        company: 'Data Analytics Inc',
        type: 'internship' as const,
        minCgpa: 8.0,
        minExperience: 0,
        requiredBranches: ['Computer Science', 'Electronics'],
        location: 'Pune',
        salary: '₹20,000/month',
        postedBy: recruiterId
      },
      {
        title: 'Mechanical Engineer',
        description: 'Looking for mechanical engineers to join our manufacturing division. Experience with CAD software preferred.',
        company: 'Manufacturing Solutions',
        type: 'job' as const,
        minCgpa: 6.5,
        minExperience: 12,
        requiredBranches: ['Mechanical'],
        location: 'Chennai',
        salary: '₹6 LPA',
        postedBy: recruiterId
      },
      {
        title: 'Electronics Design Intern',
        description: 'Internship opportunity for electronics students to work on circuit design and embedded systems.',
        company: 'ElectroTech',
        type: 'internship' as const,
        minCgpa: 7.0,
        minExperience: 0,
        requiredBranches: ['Electronics', 'Electrical'],
        location: 'Hyderabad',
        salary: '₹12,000/month',
        postedBy: recruiterId
      }
    ]

    const jobIds = []
    for (const job of sampleJobs) {
      const jobId = await db.createJob(job)
      jobIds.push(jobId)
    }

    return NextResponse.json({ 
      message: 'Sample data created successfully',
      recruiterId,
      jobIds 
    })
  } catch (error) {
    console.error('Error creating sample data:', error)
    return NextResponse.json(
      { error: 'Failed to create sample data' },
      { status: 500 }
    )
  }
}