import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db-mongodb'

export async function POST(request: NextRequest) {
  try {
    const {
      userType,
      name,
      email,
      password,
      // Student fields
      cgpa,
      experience,
      branch,
      yearOfPassing,
      // Recruiter fields
      company
    } = await request.json()

    // Validation
    if (!userType || !name || !email || !password) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    if (userType === 'student') {
      if (!cgpa || !branch || !yearOfPassing) {
        return NextResponse.json(
          { error: 'Missing student-specific fields' },
          { status: 400 }
        )
      }
    }

    if (userType === 'recruiter') {
      if (!company) {
        return NextResponse.json(
          { error: 'Missing company name' },
          { status: 400 }
        )
      }
    }

    // Check if user already exists
    if (userType === 'student') {
      const existingStudent = await db.getStudentByEmail(email)
      if (existingStudent) {
        return NextResponse.json(
          { error: 'Student with this email already exists' },
          { status: 400 }
        )
      }
    } else {
      const existingRecruiter = await db.getRecruiterByEmail(email)
      if (existingRecruiter) {
        return NextResponse.json(
          { error: 'Recruiter with this email already exists' },
          { status: 400 }
        )
      }
    }

    // Create user based on type
    if (userType === 'student') {
      await db.createStudent({
        email,
        name,
        cgpa: parseFloat(cgpa),
        experience: parseInt(experience) || 0,
        branch,
        yearOfPassing: parseInt(yearOfPassing),
        resumes: []
      })
    } else {
      await db.createRecruiter({
        email,
        name,
        company
      })
    }

    return NextResponse.json({ 
      message: 'Account created successfully',
      userType 
    })
  } catch (error) {
    console.error('Error creating user:', error)
    return NextResponse.json(
      { error: 'Failed to create account' },
      { status: 500 }
    )
  }
}