import { UserRepository } from '../../domain/ports/UserRepository'
import User from '../../domain/model/User'
import * as bcrypt from 'bcrypt'
import mongoose, { Schema, Document, Model } from 'mongoose'
import { injectable } from 'tsyringe'

interface IUser extends Document {
  email: string
  password: string
}

const UserSchema: Schema = new Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true }
})

const UserModel: Model<IUser> = mongoose.model<IUser>('User', UserSchema)
@injectable()
export class MongoUserRepository implements UserRepository {
  public ready: Promise<void>

  constructor() {
    const uri = 'mongodb://mongodb:27017/dbsa'
    this.ready = mongoose
      .connect(uri, { serverSelectionTimeoutMS: 5000 })
      .then(() => {
        console.log('Connected to MongoDB')
      })
      .catch(err => {
        console.error('MongoDB connection error:', err)
        throw err
      })
  }

  async findByEmail(email: string): Promise<User | null> {
    const userDoc = await UserModel.findOne({ email }).exec()
    return userDoc ? new User(userDoc.id.toString(), userDoc.email, userDoc.password) : null
  }

  async createUser(email: string, password: string): Promise<User> {
    const saltRounds = 12
    const passwordHash = await bcrypt.hash(password, saltRounds)
    const userDoc = new UserModel({ email, password: passwordHash })
    await userDoc.save()
    return new User(userDoc.id.toString(), userDoc.email, userDoc.password)
  }
}
