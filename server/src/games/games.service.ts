import {
  BadRequestException,
  HttpException,
  HttpStatus,
  Injectable,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { GameStatus } from './games.interfaces';
import { Game, GameDocument } from './games.schema';

@Injectable()
export class GamesService {
  constructor(
    @InjectModel(Game.name)
    private readonly gamesModel: Model<GameDocument>,
  ) {}

  create(host: string, guest: string, index: number): Promise<GameDocument> {
    if (index < 0 || index > 8) {
      throw new HttpException('Index out of range', HttpStatus.BAD_REQUEST);
    }

    const board = [] as string[];
    board.length = 9;
    board.fill('');
    board[index] = host;

    const newGame = new this.gamesModel({
      host,
      guest,
      board,
      turn: guest,
      status: GameStatus.Playing,
    });
    return newGame.save();
  }

  findAll(username: string): Promise<GameDocument[]> {
    return this.gamesModel
      .find({
        $or: [{ host: username }, { guest: username }],
      })
      .exec();
  }

  findById(id: string): Promise<GameDocument | null> {
    return this.gamesModel.findById(id).exec();
  }

  async play(
    gameId: string,
    username: string,
    index: number,
  ): Promise<GameDocument> {
    const game = await this.findById(gameId);
    if (!game) {
      throw new HttpException('Game does not exist');
    }
    if (game.status !== GameStatus.Playing) {
      throw new HttpException('Game finished');
    }
    if (game.turn !== username) {
      throw new HttpException("Not player's turn");
    }
    if (index < 0 || index > 8) {
      throw new HttpException('Index out of range');
    }
    if (game.board[index] !== '') {
      throw new HttpException('Occupied index');
    }
    game.board[index] = username;
    game.turn = game.turn === game.host ? game.guest : game.host;

    // Check if current player won
    if (this.winnerCheck(game.board, index)) {
      game.status =
        username === game.host ? GameStatus.HostWon : GameStatus.GuestWon;
    }
    // Check if tie
    else if (game.board.findIndex((value) => value === '') === -1) {
      game.status = GameStatus.Tie;
    }

    return await game.save();
  }

  private winnerCheck(board: string[], lastMove: number): string | undefined {
    const lastMoveRow = Math.floor(lastMove / 3);
    const lastMoveCol = lastMove % 3;
    // Row
    if (
      board[lastMoveRow * 3] === board[lastMoveRow * 3 + 1] &&
      board[lastMoveRow * 3] === board[lastMoveRow * 3 + 2]
    ) {
      return board[lastMoveRow * 3];
    }
    // Column
    if (
      board[lastMoveCol] === board[lastMoveCol + 3] &&
      board[lastMoveCol] === board[lastMoveCol + 6]
    ) {
      return board[lastMoveCol];
    }
    // Diagonals
    if (lastMove + 1 % 2 !== 0) {
      if (lastMoveRow === lastMoveCol) {
        if (board[0] === board[4] && board[0] === board[8]) {
          return board[4];
        } else if (lastMoveRow === 1) {
          if (board[2] === board[4] && board[2] === board[6]) {
            return board[4];
          }
        }
      } else if (board[2] === board[4] && board[2] === board[6]) {
        return board[4];
      }
    }
  }

  async delete(gameId: string, host: string): Promise<void> {
    const game = await this.findById(gameId);
    if (game?.host === host) {
      game.delete();
    }
  }
}
