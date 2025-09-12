import { NextResponse } from 'next/server'
import { db } from '@/lib/db-mongodb'
import { ObjectId } from 'mongodb'

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const recruiterId = new ObjectId(params.id)
    const jobs = await db.getJobsByRecruiter(recruiterId)
    return NextResponse.json(jobs)
  } catch (error) {
    console.error('Error fetching recruiter jobs:', error)
    return NextResponse.json(
      { error: 'Failed to fetch jobs' },
      { status: 500 }
    )
  }
}