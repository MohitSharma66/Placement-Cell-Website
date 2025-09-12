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
    const student = await db.getStudentById(studentId)

    if (!student) {
      return NextResponse.json(
        { error: 'Student not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(student.resumes)
  } catch (error) {
    console.error('Error fetching resumes:', error)
    return NextResponse.json(
      { error: 'Failed to fetch resumes' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || session.user.userType !== 'student') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { resumeLink } = await request.json()
    
    if (!resumeLink || !resumeLink.includes('drive.google.com')) {
      return NextResponse.json(
        { error: 'Valid Google Drive link required' },
        { status: 400 }
      )
    }

    const studentId = new ObjectId(session.user.id)
    const student = await db.getStudentById(studentId)

    if (!student) {
      return NextResponse.json(
        { error: 'Student not found' },
        { status: 404 }
      )
    }

    // Check if resume already exists
    if (student.resumes.includes(resumeLink)) {
      return NextResponse.json(
        { error: 'Resume already exists' },
        { status: 400 }
      )
    }

    // Add resume to student's resumes array
    const updatedResumes = [...student.resumes, resumeLink]
    const updated = await db.updateStudent(studentId, { resumes: updatedResumes })

    if (!updated) {
      return NextResponse.json(
        { error: 'Failed to add resume' },
        { status: 400 }
      )
    }

    return NextResponse.json({ 
      message: 'Resume added successfully',
      resumes: updatedResumes 
    })
  } catch (error) {
    console.error('Error adding resume:', error)
    return NextResponse.json(
      { error: 'Failed to add resume' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || session.user.userType !== 'student') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { resumeLink } = await request.json()
    
    if (!resumeLink) {
      return NextResponse.json(
        { error: 'Resume link required' },
        { status: 400 }
      )
    }

    const studentId = new ObjectId(session.user.id)
    const student = await db.getStudentById(studentId)

    if (!student) {
      return NextResponse.json(
        { error: 'Student not found' },
        { status: 404 }
      )
    }

    // Remove resume from student's resumes array
    const updatedResumes = student.resumes.filter(link => link !== resumeLink)
    const updated = await db.updateStudent(studentId, { resumes: updatedResumes })

    if (!updated) {
      return NextResponse.json(
        { error: 'Failed to remove resume' },
        { status: 400 }
      )
    }

    return NextResponse.json({ 
      message: 'Resume removed successfully',
      resumes: updatedResumes 
    })
  } catch (error) {
    console.error('Error removing resume:', error)
    return NextResponse.json(
      { error: 'Failed to remove resume' },
      { status: 500 }
    )
  }
}