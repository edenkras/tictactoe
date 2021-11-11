import { Strategy } from 'passport-custom';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { AuthService } from './auth.service';
import { UserDocument } from '../users/users.schema';
import { AuthenticationRequest } from './auth.interfaces';

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy, 'custom') {
  constructor(private readonly authService: AuthService) {
    super();
  }

  async validate(req: AuthenticationRequest): Promise<UserDocument> {
    const user = await this.authService.validateUser(
      req.body.username,
      req.body.password,
    );
    if (!user) {
      throw new UnauthorizedException();
    }
    return user;
  }
}
