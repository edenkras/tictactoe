import { User, UserDocument } from '../users/users.schema';

export type JWTPayload = Pick<UserDocument, 'id' | 'username'>;

export interface AuthenticationRequest extends Express.Request {
  body: Pick<User, 'username' | 'password'>;
}

export interface AuthenticatedRequest extends Express.Request {
  user: JWTPayload;
}
