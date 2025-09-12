import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db-mongodb'
import { ObjectId } from 'mongodb'

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || session.user.userType !== 'recruiter') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const jobId = new ObjectId(params.id)
    const applications = await db.getApplicationsByJob(jobId)

    // Enrich applications with student details
    const enrichedApplications = await Promise.all(
      applications.map(async (application) => {
        const student = await db.getStudentById(application.studentId)
        return {
          ...application,
          student
        }
      })
    )

    return NextResponse.json(enrichedApplications)
  } catch (error) {
    console.error('Error fetching job applications:', error)
    return NextResponse.json(
      { error: 'Failed to fetch applications' },
      { status: 500 }
    )
  }
}