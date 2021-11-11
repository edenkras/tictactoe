import {
  HttpException,
  HttpStatus,
  Injectable,
  Logger,
  UnauthorizedException,
} from '@nestjs/common';
import { User, UserDocument } from '../users/users.schema';
import { UsersService } from '../users/users.service';
import { compareSync } from 'bcrypt';
import { JWTPayload } from './auth.interfaces';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
  ) {}

  async validateUser(
    username: string,
    pass: string,
  ): Promise<UserDocument | undefined> {
    const user = await this.usersService.findOne(username);
    if (user && compareSync(pass, user.password)) {
      return user;
    }
  }

  login(user: UserDocument): string {
    const payload: JWTPayload = {
      id: user.id as string,
      username: user.username,
    };
    return this.jwtService.sign(payload);
  }

  async register(user: User): Promise<string> {
    const userDoc = await this.usersService.findOne(user.username);
    if (userDoc) {
      throw new HttpException('User already exists', HttpStatus.UNAUTHORIZED);
    }
    const newUser = await this.usersService.create(user);
    return this.login(newUser);
  }
}
