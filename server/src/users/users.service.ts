import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { genSaltSync, hashSync } from 'bcrypt';
import { Model } from 'mongoose';
import { User, UserDocument } from './users.schema';

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(User.name)
    private readonly usersModel: Model<UserDocument>,
  ) {}

  findOne(username: string): Promise<UserDocument | null> {
    return this.usersModel.findOne({ username }).exec();
  }

  create(user: User): Promise<UserDocument> {
    user.password = hashSync(user.password, genSaltSync());
    const newUser = new this.usersModel(user);
    return newUser.save();
  }
}
