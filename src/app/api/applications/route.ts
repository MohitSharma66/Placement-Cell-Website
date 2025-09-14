import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db-unified'
import { googleSheetsService } from '@/lib/google-sheets'

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || session.user.userType !== 'student') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { jobId, resumeLink } = await request.json()
    
    if (!jobId) {
      return NextResponse.json(
        { error: 'Job ID is required' },
        { status: 400 }
      )
    }

    // Use string IDs for Prisma
    const studentId = session.user.id
    const jobIdString = jobId

    // Get student and job details first for eligibility check
    const [student, job] = await Promise.all([
      db.getStudentById(studentId),
      db.getJobById(jobIdString)
    ])

    if (!student || !job) {
      return NextResponse.json(
        { error: 'Student or job not found' },
        { status: 404 }
      )
    }

    // Check eligibility before allowing application
    const { checkEligibility } = await import('@/lib/eligibility')
    const eligibilityResult = checkEligibility(
      {
        cgpa: student.cgpa,
        experience: student.experience,
        branch: student.branch
      },
      {
        minCgpa: job.minCgpa,
        minExperience: job.minExperience,
        requiredBranches: job.requiredBranches
      }
    )

    if (!eligibilityResult.isEligible) {
      return NextResponse.json(
        { 
          error: 'You are not eligible for this position',
          reasons: eligibilityResult.reasons,
          missingRequirements: eligibilityResult.missingRequirements
        },
        { status: 403 }
      )
    }

    // Check if student already applied for this job
    const existingApplication = await db.getApplication(studentId, jobIdString)
    
    if (existingApplication) {
      return NextResponse.json(
        { error: 'Already applied for this job' },
        { status: 400 }
      )
    }

    // Create application
    const applicationId = await db.createApplication({
      studentId,
      jobId: jobIdString,
      resumeLink: resumeLink || ''
    })

    // Log to Google Sheets (async, doesn't block the response)
    // We already have student and job data from earlier eligibility check
    googleSheetsService.logJobApplication({
      studentName: student.name,
      studentEmail: student.email,
      studentBranch: student.branch,
      studentCgpa: student.cgpa,
      jobTitle: job.title,
      companyName: job.company,
      applicationDate: new Date().toISOString().split('T')[0], // YYYY-MM-DD format
      resumeLink: resumeLink || '',
      status: 'Applied'
    }).catch(error => {
      // Log error but don't fail the application
      console.error('Google Sheets logging failed:', error)
    })

    return NextResponse.json({ 
      message: 'Application submitted successfully',
      applicationId 
    })
  } catch (error) {
    console.error('Error creating application:', error)
    return NextResponse.json(
      { error: 'Failed to submit application' },
      { status: 500 }
    )
  }
}