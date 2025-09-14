import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db-unified'

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || session.user.userType !== 'recruiter') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const {
      title,
      description,
      type,
      minCgpa,
      minExperience,
      requiredBranches,
      location,
      salary
    } = await request.json()
    
    if (!title || !description || !type || !minCgpa || !requiredBranches || !location) {
      return NextResponse.json(
        { error: 'Required fields missing' },
        { status: 400 }
      )
    }

    const recruiterId = session.user.id
    const jobId = await db.createJob({
      title,
      description,
      company: 'Company Name', // TODO: Get from recruiter profile
      type,
      minCgpa: parseFloat(minCgpa),
      minExperience: parseInt(minExperience) || 0,
      requiredBranches,
      location,
      salary,
      postedById: recruiterId
    })

    return NextResponse.json({ 
      message: 'Job posted successfully',
      jobId 
    })
  } catch (error) {
    console.error('Error creating job:', error)
    return NextResponse.json(
      { error: 'Failed to post job' },
      { status: 500 }
    )
  }
}