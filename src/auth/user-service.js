import userModel from './user-model.js';
import emailService from './email-service.js';
import tokenService from './token-service.js';
import UserDto from './user-dto.js';
import AuthError from './auth-error.js';

import bcrypt from 'bcryptjs';
import { v4 } from 'uuid';

class UserService {
  async register(username, email, password) {
    const candidate = await userModel.findOne({ username, email });
    if (candidate) {
      throw AuthError.getBadRequest(
        `User with name '${username}' or email ${email} already exists`,
        [`User with name '${username}' or email ${email} already exists`]
      );
    }
    const salt = bcrypt.genSaltSync(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    const activationToken = v4();
    const user = await userModel.create({
      username,
      email,
      password: hashedPassword,
      activationToken,
    });
    const activationLink = `${process.env.API_URL}/auth/activate/${activationToken}`;
    await emailService.sendActivationMail(email, activationLink);
    const userDto = new UserDto(user);
    const tokens = tokenService.generateTokens({ ...userDto });
    await tokenService.save(userDto.id, tokens.refreshToken);
    return {
      ...tokens,
      user: userDto,
    };
  }

  async login(username, password) {
    const user = await userModel.findOne({ username });
    if (!user) {
      throw AuthError.getBadRequest(`User with login '${username}' not found`, [
        `User with login '${username}' not found`,
      ]);
    }
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw AuthError.getBadRequest('Invalid password', ['Invalid password']);
    }
    const userDto = new UserDto(user);
    const tokens = tokenService.generateTokens({ ...userDto });
    await tokenService.save(userDto.id, tokens.refreshToken);
    return {
      ...tokens,
      user: userDto,
    };
  }

  async logout(refreshToken) {
    const token = await tokenService.remove(refreshToken);
    return token;
  }

  async activate(activationToken) {
    const user = await userModel.findOne({ activationToken });
    if (!user) {
      throw AuthError.getBadRequest(`Invalid activation link. User not found`, [
        `Invalid activation link. User not found`,
      ]);
    }
    user.isActivated = true;
    await user.save();
  }

  async findByToken(refreshToken) {
    if (!refreshToken) {
      throw AuthError.getUnauthorizedError();
    }
    const userData = tokenService.validateRefreshToken(refreshToken);
    const tokenFromDataBase = await tokenService.find(refreshToken);
    if (!userData || !tokenFromDataBase) {
      throw AuthError.getUnauthorizedError();
    }
    const user = await userModel.findById(userData.id);
    return user;
  }

  async refresh(refreshToken) {
    const user = await this.findByToken(refreshToken);
    const userDto = new UserDto(user);
    const tokens = tokenService.generateTokens({ ...userDto });
    await tokenService.save(userDto.id, tokens.refreshToken);
    return {
      ...tokens,
      user: userDto,
    };
  }

  async deleteByName(username) {
    if (!username) {
      throw AuthError.getBadRequest(`Cannot delete. User with name '${username}' not found`, [
        `Cannot delete. User with name '${username}' not found`,
      ]);
    }
    const deletedUser = await userModel.findOneAndDelete({ username });
    return deletedUser;
  }

  async findByTokenAndDelete(refreshToken) {
    const { username } = await this.findByToken(refreshToken);
    const deletedUser = await this.deleteByName(username);
    return deletedUser;
  }

  async getUsers() {
    const users = await userModel.find();
    return users;
  }
}

export default new UserService();
