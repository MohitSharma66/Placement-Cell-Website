import { MongoClient } from 'mongodb'

const uri = process.env.MONGODB_URI!
const options = {}

let client: MongoClient
let clientPromise: Promise<MongoClient>

if (!process.env.MONGODB_URI) {
  console.warn('MONGODB_URI is not set. Using fallback configuration.')
  // Create a fallback that doesn't actually connect but prevents crashes
  const dummyClient = {
    connect: () => Promise.reject(new Error('MongoDB not configured')),
    close: () => Promise.resolve(),
    db: () => ({
      collection: () => ({
        find: () => ({ toArray: () => Promise.resolve([]) }),
        findOne: () => Promise.resolve(null),
        insertOne: () => Promise.reject(new Error('Database not available')),
        updateOne: () => Promise.reject(new Error('Database not available')),
      })
    })
  }
  clientPromise = Promise.resolve(dummyClient as any)
} else {

if (process.env.NODE_ENV === 'development') {
  let globalWithMongo = global as typeof globalThis & {
    _mongoClientPromise?: Promise<MongoClient>
  }

  if (!globalWithMongo._mongoClientPromise) {
    client = new MongoClient(uri, options)
    globalWithMongo._mongoClientPromise = client.connect()
  }
  clientPromise = globalWithMongo._mongoClientPromise
} else {
  client = new MongoClient(uri, options)
  clientPromise = client.connect()
}
}

export default clientPromise