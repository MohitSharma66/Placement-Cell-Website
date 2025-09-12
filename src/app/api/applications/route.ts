import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db-mongodb'
import { ObjectId } from 'mongodb'
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

    const studentId = new ObjectId(session.user.id)
    const jobObjectId = new ObjectId(jobId)

    // Check if student already applied for this job
    const existingApplications = await db.getApplicationsByStudent(studentId)
    const alreadyApplied = existingApplications.some(app => app.jobId.equals(jobObjectId))
    
    if (alreadyApplied) {
      return NextResponse.json(
        { error: 'Already applied for this job' },
        { status: 400 }
      )
    }

    // Create application
    const applicationId = await db.createApplication({
      studentId,
      jobId: jobObjectId,
      status: 'pending',
      resumeLink: resumeLink || ''
    })

    // Update student's applications array
    await db.addApplicationToStudent(studentId, jobObjectId)

    // Update job's applications array
    await db.addApplicationToJob(jobObjectId, studentId)

    // Get student and job details for Google Sheets logging
    const [student, job] = await Promise.all([
      db.getStudentById(studentId),
      db.getJobById(jobObjectId)
    ])

    // Log to Google Sheets (async, doesn't block the response)
    if (student && job) {
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
    }

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