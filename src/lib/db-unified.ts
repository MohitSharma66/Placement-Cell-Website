// Unified Database Interface 
// Provides consistent API that works with both MongoDB and Prisma

import { db as mongoDb } from './db-mongodb'
import { db as prismaDb } from './db-prisma'

// Check if MongoDB is available (use presence of MONGODB_URI regardless of NODE_ENV)
const isMongoAvailable = Boolean(process.env.MONGODB_URI)

console.log(`🔌 Database: Using ${isMongoAvailable ? 'MongoDB (Production)' : 'Prisma/SQLite (Local)'}`)

// Unified Database Interface - consistent methods for both backends
export const db = {
  // === STUDENT OPERATIONS ===
  async createStudent(data: {
    email: string
    name: string
    cgpa: number
    experience: number
    branch: string
    yearOfPassing: number
    resumes: string[]
  }) {
    if (isMongoAvailable) {
      return await mongoDb.createStudent(data)
    } else {
      return await prismaDb.createStudent(data)
    }
  },

  async getStudentByEmail(email: string) {
    if (isMongoAvailable) {
      return await mongoDb.getStudentByEmail(email)
    } else {
      return await prismaDb.getStudentByEmail(email)
    }
  },

  async getStudentById(id: string) {
    if (isMongoAvailable) {
      const { ObjectId } = await import('mongodb')
      return await mongoDb.getStudentById(new ObjectId(id))
    } else {
      return await prismaDb.getStudentById(id)
    }
  },

  // === RECRUITER OPERATIONS ===
  async createRecruiter(data: {
    email: string
    name: string
    company: string
  }) {
    if (isMongoAvailable) {
      return await mongoDb.createRecruiter(data)
    } else {
      return await prismaDb.createRecruiter(data)
    }
  },

  async getRecruiterByEmail(email: string) {
    if (isMongoAvailable) {
      return await mongoDb.getRecruiterByEmail(email)
    } else {
      return await prismaDb.getRecruiterByEmail(email)
    }
  },

  async getRecruiterById(id: string) {
    if (isMongoAvailable) {
      const { ObjectId } = await import('mongodb')
      return await mongoDb.getRecruiterById(new ObjectId(id))
    } else {
      return await prismaDb.getRecruiterById(id)
    }
  },

  // === JOB OPERATIONS ===
  async createJob(data: {
    title: string
    description: string
    company: string
    type: string
    minCgpa: number
    minExperience: number
    requiredBranches: string[]
    location: string
    salary?: string
    postedById: string
  }) {
    if (isMongoAvailable) {
      const { ObjectId } = await import('mongodb')
      return await mongoDb.createJob({
        ...data,
        postedBy: new ObjectId(data.postedById)
      })
    } else {
      return await prismaDb.createJob(data)
    }
  },

  async getJobs() {
    if (isMongoAvailable) {
      return await mongoDb.getJobs()
    } else {
      const jobs = await prismaDb.getAllJobs()
      // Parse JSON fields to arrays for consistent API
      return jobs.map(job => ({
        ...job,
        requiredBranches: JSON.parse(job.requiredBranches)
      }))
    }
  },

  async getJobById(id: string) {
    if (isMongoAvailable) {
      const { ObjectId } = await import('mongodb')
      return await mongoDb.getJobById(new ObjectId(id))
    } else {
      const job = await prismaDb.getJobById(id)
      if (job) {
        // Parse JSON fields to arrays for consistent API
        return {
          ...job,
          requiredBranches: JSON.parse(job.requiredBranches)
        }
      }
      return job
    }
  },

  // === APPLICATION OPERATIONS ===
  async createApplication(data: {
    studentId: string
    jobId: string
    resumeLink: string
  }) {
    if (isMongoAvailable) {
      const { ObjectId } = await import('mongodb')
      return await mongoDb.createApplication({
        studentId: new ObjectId(data.studentId),
        jobId: new ObjectId(data.jobId),
        status: 'pending',
        resumeLink: data.resumeLink
      })
    } else {
      return await prismaDb.createApplication(data)
    }
  },

  async getApplication(studentId: string, jobId: string) {
    if (isMongoAvailable) {
      // MongoDB doesn't have this method - simulate it
      const applications = await mongoDb.getApplicationsByStudent(new (await import('mongodb')).ObjectId(studentId))
      return applications.find(app => app.jobId.toString() === jobId) || null
    } else {
      return await prismaDb.getApplication(studentId, jobId)
    }
  },

  async getApplicationsByStudent(studentId: string) {
    if (isMongoAvailable) {
      const { ObjectId } = await import('mongodb')
      return await mongoDb.getApplicationsByStudent(new ObjectId(studentId))
    } else {
      // Prisma needs this method - let's simulate it
      const student = await prismaDb.getStudentById(studentId)
      return student?.applications || []
    }
  }
}