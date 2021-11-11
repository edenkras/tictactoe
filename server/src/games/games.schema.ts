import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { ApiProperty } from '@nestjs/swagger';
import { Document } from 'mongoose';
import { GameStatus } from './games.interfaces';

@Schema()
export class Game {
  @ApiProperty()
  @Prop()
  host: string;

  @ApiProperty()
  @Prop()
  guest: string;

  @ApiProperty()
  @Prop([String])
  board: string[];

  @ApiProperty()
  @Prop()
  turn: string;

  @ApiProperty()
  @Prop({ type: Number })
  status: GameStatus;
}

export const GameSchema = SchemaFactory.createForClass(Game);

export type GameDocument = Game & Document;
