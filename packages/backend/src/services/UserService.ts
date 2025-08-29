import { JwtService } from '@prompt-kitchen/shared';
import type { User } from '@prompt-kitchen/shared/src/dtos';
import { UserRepository } from '../repositories/UserRepository';

export interface UserServiceDeps {
  userRepository: UserRepository;
  jwtSecret: string;
}

export interface JwtPayload {
  id: string;
  email: string;
  name: string;
  avatarUrl?: string;
  iat?: number;
  exp?: number;
}

export class UserService {
  private userRepository: UserRepository;
  private jwtSecret: string;
  private jwtService: JwtService;

  constructor(deps: UserServiceDeps) {
    this.userRepository = deps.userRepository;
    this.jwtSecret = deps.jwtSecret;
    this.jwtService = new JwtService(this.jwtSecret);
  }

  /**
   * Finds or creates a user from Google profile info.
   * @param profile Google profile info
   */
  async findOrCreateGoogleUser(profile: { id: string; email: string; name: string; avatarUrl?: string }): Promise<User> {
    if (!profile.email) {
      throw new Error('findOrCreateGoogleUser: profile.email is missing');
    }
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
    return this.jwtService.generateJwt(user);
  }

  /**
   * Verifies a JWT and returns the decoded payload.
   */
  verifyJwt(token: string): JwtPayload {
    return this.jwtService.verifyJwt(token);
  }

  /**
   * Gets a user by id (returns User DTO or null)
   */
  async getUserById(id: string) {
    return this.userRepository.findById(id);
  }
}
