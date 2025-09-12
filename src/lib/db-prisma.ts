import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: ['query', 'error', 'warn'],
    datasources: {
      db: {
        url: "file:./db/custom.db"
      }
    }
  })

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma

// Database operations for the placement portal
export const db = {
  // Student operations
  async createStudent(data: {
    email: string
    name: string
    cgpa: number
    experience: number
    branch: string
    yearOfPassing: number
    resumes: string[]
  }) {
    return await prisma.student.create({
      data: {
        email: data.email,
        name: data.name,
        cgpa: data.cgpa,
        experience: data.experience,
        branch: data.branch,
        yearOfPassing: data.yearOfPassing,
        resumes: JSON.stringify(data.resumes || [])
      }
    })
  },

  async getStudentByEmail(email: string) {
    return await prisma.student.findUnique({
      where: { email }
    })
  },

  async getStudentById(id: string) {
    return await prisma.student.findUnique({
      where: { id },
      include: {
        applications: {
          include: {
            job: true
          }
        }
      }
    })
  },

  // Recruiter operations
  async createRecruiter(data: {
    email: string
    name: string
    company: string
  }) {
    return await prisma.recruiter.create({
      data: {
        email: data.email,
        name: data.name,
        company: data.company
      }
    })
  },

  async getRecruiterByEmail(email: string) {
    return await prisma.recruiter.findUnique({
      where: { email }
    })
  },

  async getRecruiterById(id: string) {
    return prisma.recruiter.findUnique({
      where: { id },
      include: {
        jobs: {
          include: {
            applications: {
              include: {
                student: true
              }
            }
          }
        }
      }
    })
  },

  // Job operations
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
    return prisma.job.create({
      data: {
        title: data.title,
        description: data.description,
        company: data.company,
        type: data.type,
        minCgpa: data.minCgpa,
        minExperience: data.minExperience,
        requiredBranches: JSON.stringify(data.requiredBranches || []),
        location: data.location,
        salary: data.salary,
        postedById: data.postedById
      }
    })
  },

  async getJobById(id: string) {
    return prisma.job.findUnique({
      where: { id },
      include: {
        postedBy: true,
        applications: {
          include: {
            student: true
          }
        }
      }
    })
  },

  async getAllJobs() {
    return prisma.job.findMany({
      include: {
        postedBy: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    })
  },

  async getJobsForStudent(studentBranch: string, studentCgpa: number, studentExperience: number) {
    const jobs = await prisma.job.findMany({
      include: {
        postedBy: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    // Filter jobs based on eligibility
    return jobs.filter(job => {
      const requiredBranches = JSON.parse(job.requiredBranches)
      const meetsGrade = studentCgpa >= job.minCgpa
      const meetsExperience = studentExperience >= job.minExperience
      const meetsBranch = requiredBranches.length === 0 || requiredBranches.includes(studentBranch)
      
      return meetsGrade && meetsExperience && meetsBranch
    })
  },

  // Application operations
  async createApplication(data: {
    studentId: string
    jobId: string
    resumeLink: string
  }) {
    return prisma.application.create({
      data: {
        studentId: data.studentId,
        jobId: data.jobId,
        resumeLink: data.resumeLink
      }
    })
  },

  async getApplication(studentId: string, jobId: string) {
    return prisma.application.findUnique({
      where: {
        studentId_jobId: {
          studentId,
          jobId
        }
      }
    })
  },

  async updateApplicationStatus(id: string, status: string) {
    return prisma.application.update({
      where: { id },
      data: { status }
    })
  },

  async getApplicationsForRecruiter(recruiterId: string) {
    return prisma.application.findMany({
      where: {
        job: {
          postedById: recruiterId
        }
      },
      include: {
        student: true,
        job: true
      },
      orderBy: {
        appliedAt: 'desc'
      }
    })
  }
}