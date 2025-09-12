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
    const recruiter = await db.getRecruiterById(recruiterId)

    if (!recruiter) {
      return NextResponse.json(
        { error: 'Recruiter not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(recruiter)
  } catch (error) {
    console.error('Error fetching recruiter profile:', error)
    return NextResponse.json(
      { error: 'Failed to fetch profile' },
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

    const { company } = await request.json()
    
    if (!company) {
      return NextResponse.json(
        { error: 'Company name is required' },
        { status: 400 }
      )
    }

    const recruiterId = new ObjectId(session.user.id)
    const updated = await db.updateRecruiter(recruiterId, { company })

    if (!updated) {
      return NextResponse.json(
        { error: 'Failed to update profile' },
        { status: 400 }
      )
    }

    return NextResponse.json({ message: 'Profile updated successfully' })
  } catch (error) {
    console.error('Error updating recruiter profile:', error)
    return NextResponse.json(
      { error: 'Failed to update profile' },
      { status: 500 }
    )
  }
}