import type { User } from '@prompt-kitchen/shared/src/dtos';
import jwt from 'jsonwebtoken';
import { UserRepository } from './UserRepository';

export interface UserServiceDeps {
  userRepository: UserRepository;
  jwtSecret: string;
}

export class UserService {
  private userRepository: UserRepository;
  private jwtSecret: string;

  constructor(deps: UserServiceDeps) {
    this.userRepository = deps.userRepository;
    this.jwtSecret = deps.jwtSecret;
  }

  /**
   * Finds or creates a user from Google profile info.
   * @param profile Google profile info
   */
  async findOrCreateGoogleUser(profile: { id: string; email: string; name: string; avatarUrl?: string }): Promise<User> {
    let user = await this.userRepository.findByEmail(profile.email);
    if (!user) {
      user = await this.userRepository.createUser({
        id: profile.id,
        email: profile.email,
        name: profile.name,
        avatarUrl: profile.avatarUrl,
      });
    }
    return user;
  }

  /**
   * Generates a JWT for the given user.
   */
  generateJwt(user: User): string {
    return jwt.sign(
      {
        id: user.id,
        email: user.email,
        name: user.name,
        avatarUrl: user.avatarUrl,
      },
      this.jwtSecret,
      { expiresIn: '7d' }
    );
  }

  /**
   * Verifies a JWT and returns the decoded payload.
   */
  verifyJwt(token: string): any {
    return jwt.verify(token, this.jwtSecret);
  }

  /**
   * Gets a user by id (returns User DTO or null)
   */
  async getUserById(id: string) {
    return this.userRepository.findById(id);
  }
}
