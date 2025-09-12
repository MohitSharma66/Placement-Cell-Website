import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db-mongodb'

export async function POST(request: NextRequest) {
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

    // Check if recruiter already exists
    const existingRecruiter = await db.getRecruiterByEmail(session.user.email!)
    if (existingRecruiter) {
      return NextResponse.json(
        { error: 'Recruiter profile already exists' },
        { status: 400 }
      )
    }

    const recruiterId = await db.createRecruiter({
      email: session.user.email!,
      name: session.user.name!,
      company
    })

    return NextResponse.json({ 
      message: 'Recruiter profile created successfully',
      recruiterId 
    })
  } catch (error) {
    console.error('Error creating recruiter profile:', error)
    return NextResponse.json(
      { error: 'Failed to create profile' },
      { status: 500 }
    )
  }
}