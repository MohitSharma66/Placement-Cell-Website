import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db-mongodb'
import { ObjectId } from 'mongodb'

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || session.user.userType !== 'student') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const studentId = new ObjectId(session.user.id)
    const applications = await db.getApplicationsByStudent(studentId)

    // Enrich applications with job details
    const enrichedApplications = await Promise.all(
      applications.map(async (application) => {
        const job = await db.getJobById(application.jobId)
        return {
          ...application,
          job
        }
      })
    )

    return NextResponse.json(enrichedApplications)
  } catch (error) {
    console.error('Error fetching applications:', error)
    return NextResponse.json(
      { error: 'Failed to fetch applications' },
      { status: 500 }
    )
  }
}