import { Body, Controller, Get, Post, Req, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiBody } from '@nestjs/swagger';
import { User, UserDocument } from '../users/users.schema';
import { ReqUser } from './auth.decorators';
import { JWTPayload } from './auth.interfaces';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from './jwt.guard';
import { LocalAuthGuard } from './local.guard';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @ApiBody({
    description: 'credentials',
    examples: {
      ExampleCredentials: {
        value: { username: 'admin', password: 'admin' },
      },
    },
  })
  @UseGuards(LocalAuthGuard)
  @Post('login')
  login(@Req() req: Express.Request): string {
    return this.authService.login(req.user as UserDocument);
  }

  @ApiBody({
    description: 'credentials',
    examples: {
      ExampleCredentials: {
        value: { username: 'admin', password: 'admin' },
      },
    },
  })
  @Post('register')
  async register(@Body() user: User): Promise<string> {
    return this.authService.register(user);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Get()
  getProfile(@ReqUser() user: JWTPayload): JWTPayload {
    return user;
  }
}
