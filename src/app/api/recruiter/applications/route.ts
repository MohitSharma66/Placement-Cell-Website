import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db-mongodb'
import { ObjectId } from 'mongodb'

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || session.user.userType !== 'recruiter') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const recruiterId = new ObjectId(session.user.id)
    const jobs = await db.getJobsByRecruiter(recruiterId)
    
    // Get all applications for recruiter's jobs
    const allApplications = []
    for (const job of jobs) {
      const jobApplications = await db.getApplicationsByJob(job._id!)
      allApplications.push(...jobApplications.map(app => ({
        ...app,
        job
      })))
    }

    // Enrich applications with student details
    const enrichedApplications = await Promise.all(
      allApplications.map(async (application) => {
        const student = await db.getStudentById(application.studentId)
        return {
          ...application,
          student
        }
      })
    )

    return NextResponse.json(enrichedApplications)
  } catch (error) {
    console.error('Error fetching recruiter applications:', error)
    return NextResponse.json(
      { error: 'Failed to fetch applications' },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || session.user.userType !== 'recruiter') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { applicationId, status } = await request.json()
    
    console.log('Updating application status:', { applicationId, status })
    
    if (!applicationId || !status) {
      return NextResponse.json(
        { error: 'Application ID and status are required' },
        { status: 400 }
      )
    }

    const validStatuses = ['pending', 'reviewed', 'accepted', 'rejected']
    if (!validStatuses.includes(status)) {
      return NextResponse.json(
        { error: 'Invalid status' },
        { status: 400 }
      )
    }

    const applicationObjectId = new ObjectId(applicationId)
    console.log('Attempting to update application with ID:', applicationObjectId.toString())
    
    const updated = await db.updateApplicationStatus(applicationObjectId, status as any)
    console.log('Update result:', updated)

    if (!updated) {
      return NextResponse.json(
        { error: 'Failed to update application status' },
        { status: 400 }
      )
    }

    return NextResponse.json({ 
      message: 'Application status updated successfully' 
    })
  } catch (error) {
    console.error('Error updating application status:', error)
    return NextResponse.json(
      { error: 'Failed to update application status' },
      { status: 500 }
    )
  }
}