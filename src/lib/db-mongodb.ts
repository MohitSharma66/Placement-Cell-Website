import clientPromise from './mongodb'
import { ObjectId } from 'mongodb'

export interface Student {
  _id?: ObjectId
  email: string
  name: string
  cgpa: number
  experience: number // in months
  branch: string
  yearOfPassing: number
  resumes: string[] // Google Drive links
  applications: ObjectId[] // Job IDs
  createdAt: Date
  updatedAt: Date
}

export interface Recruiter {
  _id?: ObjectId
  email: string
  name: string
  company: string
  createdAt: Date
  updatedAt: Date
}

export interface Job {
  _id?: ObjectId
  title: string
  description: string
  company: string
  type: 'internship' | 'job'
  minCgpa: number
  minExperience: number // in months
  requiredBranches: string[]
  location: string
  salary?: string
  postedBy: ObjectId // Recruiter ID
  applications: ObjectId[] // Student IDs
  createdAt: Date
  updatedAt: Date
}

export interface Application {
  _id?: ObjectId
  studentId: ObjectId
  jobId: ObjectId
  status: 'pending' | 'reviewed' | 'accepted' | 'rejected'
  resumeLink: string
  appliedAt: Date
}

class Database {
  private async getCollection(collectionName: string) {
    const client = await clientPromise
    const db = client.db()
    return db.collection(collectionName)
  }

  // Student operations
  async createStudent(student: Omit<Student, '_id' | 'createdAt' | 'updatedAt' | 'applications'>) {
    const collection = await this.getCollection('students')
    const now = new Date()
    const result = await collection.insertOne({
      ...student,
      applications: [],
      createdAt: now,
      updatedAt: now
    })
    return result.insertedId
  }

  async getStudentByEmail(email: string) {
    const collection = await this.getCollection('students')
    return await collection.findOne({ email }) as Student | null
  }

  async getStudentById(id: ObjectId) {
    const collection = await this.getCollection('students')
    return await collection.findOne({ _id: id }) as Student | null
  }

  async updateStudent(id: ObjectId, updates: Partial<Student>) {
    const collection = await this.getCollection('students')
    const result = await collection.updateOne(
      { _id: id },
      { 
        $set: { 
          ...updates, 
          updatedAt: new Date() 
        } 
      }
    )
    return result.modifiedCount > 0
  }

  async addApplicationToStudent(studentId: ObjectId, jobId: ObjectId) {
    const collection = await this.getCollection('students')
    const result = await collection.updateOne(
      { _id: studentId },
      { 
        $push: { applications: jobId as any },
        $set: { updatedAt: new Date() }
      }
    )
    return result.modifiedCount > 0
  }

  // Recruiter operations
  async createRecruiter(recruiter: Omit<Recruiter, '_id' | 'createdAt' | 'updatedAt'>) {
    const collection = await this.getCollection('recruiters')
    const now = new Date()
    const result = await collection.insertOne({
      ...recruiter,
      createdAt: now,
      updatedAt: now
    })
    return result.insertedId
  }

  async getRecruiterByEmail(email: string) {
    const collection = await this.getCollection('recruiters')
    return await collection.findOne({ email }) as Recruiter | null
  }

  async getRecruiterById(id: ObjectId) {
    const collection = await this.getCollection('recruiters')
    return await collection.findOne({ _id: id }) as Recruiter | null
  }

  // Job operations
  async createJob(job: Omit<Job, '_id' | 'createdAt' | 'updatedAt' | 'applications'>) {
    const collection = await this.getCollection('jobs')
    const now = new Date()
    const result = await collection.insertOne({
      ...job,
      applications: [],
      createdAt: now,
      updatedAt: now
    })
    return result.insertedId
  }

  async getJobs(filters?: {
    type?: 'internship' | 'job'
    minCgpa?: number
    minExperience?: number
    branches?: string[]
  }) {
    const collection = await this.getCollection('jobs')
    const query: any = {}
    
    if (filters?.type) {
      query.type = filters.type
    }
    
    if (filters?.minCgpa) {
      query.minCgpa = { $lte: filters.minCgpa }
    }
    
    if (filters?.minExperience) {
      query.minExperience = { $lte: filters.minExperience }
    }
    
    if (filters?.branches && filters.branches.length > 0) {
      query.requiredBranches = { $in: filters.branches }
    }

    return await collection.find(query).sort({ createdAt: -1 }).toArray() as Job[]
  }

  async getJobById(id: ObjectId) {
    const collection = await this.getCollection('jobs')
    return await collection.findOne({ _id: id }) as Job | null
  }

  async getJobsByRecruiter(recruiterId: ObjectId) {
    const collection = await this.getCollection('jobs')
    return await collection.find({ postedBy: recruiterId }).sort({ createdAt: -1 }).toArray() as Job[]
  }

  async addApplicationToJob(jobId: ObjectId, studentId: ObjectId) {
    const collection = await this.getCollection('jobs')
    const result = await collection.updateOne(
      { _id: jobId },
      { 
        $push: { applications: studentId as any },
        $set: { updatedAt: new Date() }
      }
    )
    return result.modifiedCount > 0
  }

  // Application operations
  async createApplication(application: Omit<Application, '_id' | 'appliedAt'>) {
    const collection = await this.getCollection('applications')
    const now = new Date()
    const result = await collection.insertOne({
      ...application,
      appliedAt: now
    })
    return result.insertedId
  }

  async getApplicationsByStudent(studentId: ObjectId) {
    const collection = await this.getCollection('applications')
    return await collection.find({ studentId }).sort({ appliedAt: -1 }).toArray() as Application[]
  }

  async getApplicationsByJob(jobId: ObjectId) {
    const collection = await this.getCollection('applications')
    return await collection.find({ jobId }).sort({ appliedAt: -1 }).toArray() as Application[]
  }

  async updateApplicationStatus(id: ObjectId, status: Application['status']) {
    const collection = await this.getCollection('applications')
    const result = await collection.updateOne(
      { _id: id },
      { $set: { status } }
    )
    return result.modifiedCount > 0
  }

  async updateRecruiter(id: ObjectId, updates: Partial<Recruiter>) {
    const collection = await this.getCollection('recruiters')
    const result = await collection.updateOne(
      { _id: id },
      { 
        $set: { 
          ...updates, 
          updatedAt: new Date() 
        } 
      }
    )
    return result.modifiedCount > 0
  }
}

export const db = new Database()