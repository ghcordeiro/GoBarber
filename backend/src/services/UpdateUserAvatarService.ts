import { getRepository } from 'typeorm';
import path from 'path';
import fs from 'fs';
import User from '../models/User';
import uploadConfig from '../config/upload';
import AppError from '../errors/AppError';

interface Request {
  user_id: string;
  avatarFilename: string;
}

class UpdateUserAvatarService {
  public async execute({ user_id, avatarFilename }: Request): Promise<User> {
    const userRepository = getRepository(User);

    const userExists = await userRepository.findOne(user_id);

    if (!userExists) {
      throw new AppError('Only authenticated users can change avatar', 401);
    }

    if (userExists.avatar) {
      const userAvatarFilePath = path.join(
        uploadConfig.directory,
        userExists.avatar,
      );
      const userAvatarFileExists = await fs.promises.stat(userAvatarFilePath);
      if (userAvatarFileExists) {
        await fs.promises.unlink(userAvatarFilePath);
      }
    }

    userExists.avatar = avatarFilename;
    await userRepository.save(userExists);

    return userExists;
  }
}

export default UpdateUserAvatarService;
