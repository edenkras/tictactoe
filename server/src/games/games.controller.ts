import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt.guard';
import { GamesService } from './games.service';
import { ReqUser } from '../auth/auth.decorators';
import { JWTPayload } from '../auth/auth.interfaces';
import { GameDocument } from './games.schema';
import { GameCreation, GameMove, GameStatus } from './games.interfaces';
import { ApiBearerAuth, ApiBody } from '@nestjs/swagger';

@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('games')
export class GamesController {
  constructor(private readonly gamesService: GamesService) {}

  @Get()
  findAll(@ReqUser() user: JWTPayload): Promise<GameDocument[]> {
    return this.gamesService.findAll(user.username);
  }

  @ApiBody({
    description: '',
    examples: {
      ExampleCredentials: {
        value: { guest: 'admin', firstMoveIndex: 4 },
      },
    },
  })
  @Post('create')
  create(
    @ReqUser() user: JWTPayload,
    @Body() body: GameCreation,
  ): Promise<GameDocument> {
    return this.gamesService.create(
      user.username,
      body.guest,
      body.firstMoveIndex,
    );
  }

  @ApiBody({
    description: '',
    examples: {
      ExampleCredentials: {
        value: { gameId: '', index: 0 },
      },
    },
  })
  @Post('play')
  play(
    @ReqUser() user: JWTPayload,
    @Body() body: GameMove,
  ): Promise<GameDocument | string> {
    return this.gamesService.play(body.gameId, user.username, body.index);
  }

  @Get('status/:id')
  async status(
    @ReqUser() user: JWTPayload,
    @Param('id') gameId: string,
  ): Promise<string | undefined> {
    const game = await this.gamesService.findById(gameId);
    const { username } = user;
    if (game?.host === username || game?.guest === username) {
      switch (game.status) {
        case GameStatus.Playing:
          return 'Playing';

        case GameStatus.HostWon:
          return `${game.host} won`;

        case GameStatus.GuestWon:
          return `${game.guest} won`;

        case GameStatus.Tie:
          return 'Tie';
      }
    }
  }

  @Delete(':id')
  delete(
    @ReqUser() user: JWTPayload,
    @Param('id') gameId: string,
  ): Promise<void> {
    return this.gamesService.delete(gameId, user.username);
  }
}
