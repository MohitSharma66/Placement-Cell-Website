import { NextResponse } from 'next/server'
import { db } from '@/lib/db-mongodb'

export async function GET() {
  try {
    const jobs = await db.getJobs()
    return NextResponse.json(jobs)
  } catch (error) {
    console.error('Error fetching jobs:', error)
    return NextResponse.json(
      { error: 'Failed to fetch jobs' },
      { status: 500 }
    )
  }
}