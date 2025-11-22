import { AppDataSource } from "../config/database.config";
import { User } from "../database/entities/user.entity";

export const findByIDuserService = async (userID: string) => {
         const userRepository = AppDataSource.getRepository(User);
         return await userRepository.findOne({ where: { id: userID } });         
}
