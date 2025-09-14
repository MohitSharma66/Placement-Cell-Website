// Smart Database Adapter
// Automatically switches between Prisma (local/testing) and MongoDB (production)

import { db as mongoDb } from './db-mongodb'
import { db as prismaDb } from './db-prisma'

// Check if MongoDB is available
const isMongoAvailable = process.env.MONGODB_URI && process.env.NODE_ENV === 'production'

// Export the appropriate database based on environment
export const db = isMongoAvailable ? mongoDb : prismaDb

// Re-export types for compatibility
export type {
  Student,
  Recruiter, 
  Job,
  Application
} from './db-mongodb'

console.log(`🔌 Database Adapter: Using ${isMongoAvailable ? 'MongoDB (Production)' : 'Prisma/SQLite (Local)'}`)