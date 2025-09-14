import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db-mongodb'
import { ObjectId } from 'mongodb'
import { checkEligibility } from '@/lib/eligibility'

// Get jobs with eligibility status for the current student
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || session.user.userType !== 'student') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const studentId = new ObjectId(session.user.id)
    
    // Get student profile and all jobs in parallel
    const [student, jobs] = await Promise.all([
      db.getStudentById(studentId),
      db.getJobs()
    ])

    if (!student) {
      return NextResponse.json(
        { error: 'Student profile not found' },
        { status: 404 }
      )
    }

    // Check eligibility for each job and enrich job data
    const jobsWithEligibility = jobs.map(job => {
      const eligibilityResult = checkEligibility(
        {
          cgpa: student.cgpa,
          experience: student.experience,
          branch: student.branch
        },
        {
          minCgpa: job.minCgpa,
          minExperience: job.minExperience,
          requiredBranches: job.requiredBranches
        }
      )

      return {
        ...job,
        eligibility: {
          isEligible: eligibilityResult.isEligible,
          reasons: eligibilityResult.reasons,
          missingRequirements: eligibilityResult.missingRequirements
        }
      }
    })

    // Parse filter options from query parameters
    const url = new URL(request.url)
    const eligibleOnly = url.searchParams.get('eligibleOnly') === 'true'
    const sortBy = url.searchParams.get('sortBy') || 'createdAt' // 'createdAt', 'eligibility', 'salary'
    const orderBy = url.searchParams.get('orderBy') || 'desc' // 'asc', 'desc'

    // Filter jobs if requested
    let filteredJobs = eligibleOnly 
      ? jobsWithEligibility.filter(job => job.eligibility.isEligible)
      : jobsWithEligibility

    // Sort jobs
    filteredJobs.sort((a, b) => {
      let comparison = 0

      switch (sortBy) {
        case 'eligibility':
          // Sort eligible jobs first
          comparison = (b.eligibility.isEligible ? 1 : 0) - (a.eligibility.isEligible ? 1 : 0)
          break
        case 'salary':
          // Sort by salary (handle cases where salary might be null/undefined)
          const aSalary = parseSalary(a.salary)
          const bSalary = parseSalary(b.salary)
          comparison = bSalary - aSalary
          break
        case 'createdAt':
        default:
          comparison = new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          break
      }

      return orderBy === 'asc' ? -comparison : comparison
    })

    return NextResponse.json(filteredJobs)
  } catch (error) {
    console.error('Error fetching eligible jobs:', error)
    return NextResponse.json(
      { error: 'Failed to fetch jobs' },
      { status: 500 }
    )
  }
}

// Helper function to parse salary strings into numbers for sorting
function parseSalary(salary?: string): number {
  if (!salary) return 0
  
  // Extract numbers from salary string (e.g., "₹50,000" -> 50000)
  const numbers = salary.replace(/[^\d]/g, '')
  return parseInt(numbers) || 0
}