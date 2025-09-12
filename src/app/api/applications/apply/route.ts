import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db-mongodb'
import { googleSheetsService } from '@/lib/google-sheets'

export async function POST(request: NextRequest) {
  try {
    const {
      studentId,
      jobId,
      resumeLink
    } = await request.json()

    // Validation
    if (!studentId || !jobId || !resumeLink) {
      return NextResponse.json(
        { error: 'Missing required fields: studentId, jobId, resumeLink' },
        { status: 400 }
      )
    }

    // Validate resume link (should be Google Drive link)
    if (!resumeLink.includes('drive.google.com') && !resumeLink.includes('docs.google.com')) {
      return NextResponse.json(
        { error: 'Resume link must be a Google Drive link' },
        { status: 400 }
      )
    }

    // Check if application already exists
    const existingApplication = await db.getApplication(studentId, jobId)
    if (existingApplication) {
      return NextResponse.json(
        { error: 'You have already applied for this job' },
        { status: 400 }
      )
    }

    // Get student and job details for logging
    const [student, job] = await Promise.all([
      db.getStudentById(studentId),
      db.getJobById(jobId)
    ])

    if (!student) {
      return NextResponse.json(
        { error: 'Student not found' },
        { status: 404 }
      )
    }

    if (!job) {
      return NextResponse.json(
        { error: 'Job not found' },
        { status: 404 }
      )
    }

    // Create application in database
    const application = await db.createApplication({
      studentId,
      jobId,
      resumeLink
    })

    // Log to Google Sheets (async, doesn't block the response)
    googleSheetsService.logJobApplication({
      studentName: student.name,
      studentEmail: student.email,
      studentBranch: student.branch,
      studentCgpa: student.cgpa,
      jobTitle: job.title,
      companyName: job.company,
      applicationDate: new Date().toISOString().split('T')[0], // YYYY-MM-DD format
      resumeLink: resumeLink,
      status: 'Applied'
    }).catch(error => {
      // Log error but don't fail the application
      console.error('Google Sheets logging failed:', error)
    })

    return NextResponse.json({
      message: 'Application submitted successfully',
      applicationId: application._id || application.id,
      jobTitle: job.title,
      company: job.company
    })
  } catch (error) {
    console.error('Error submitting application:', error)
    return NextResponse.json(
      { error: 'Failed to submit application' },
      { status: 500 }
    )
  }
}