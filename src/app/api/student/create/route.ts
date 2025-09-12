import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db-mongodb'

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || session.user.userType !== 'student') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { cgpa, experience, branch, yearOfPassing } = await request.json()
    
    if (!cgpa || !branch || !yearOfPassing) {
      return NextResponse.json(
        { error: 'Required fields missing' },
        { status: 400 }
      )
    }

    // Check if student already exists
    const existingStudent = await db.getStudentByEmail(session.user.email!)
    if (existingStudent) {
      return NextResponse.json(
        { error: 'Student profile already exists' },
        { status: 400 }
      )
    }

    const studentId = await db.createStudent({
      email: session.user.email!,
      name: session.user.name!,
      cgpa: parseFloat(cgpa),
      experience: parseInt(experience) || 0,
      branch,
      yearOfPassing: parseInt(yearOfPassing),
      resumes: []
    })

    return NextResponse.json({ 
      message: 'Student profile created successfully',
      studentId 
    })
  } catch (error) {
    console.error('Error creating student profile:', error)
    return NextResponse.json(
      { error: 'Failed to create profile' },
      { status: 500 }
    )
  }
}