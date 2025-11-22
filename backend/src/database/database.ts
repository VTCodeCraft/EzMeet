import "reflect-metadata";
import  { AppDataSource } from "../config/database.config";

export const initializeDatabase = async () => {
         try{
                  await AppDataSource.initialize();
                  console.log("Database connection established successfully.");
         }catch(error){
                  console.error("Error connecting to the database:", error);
                  process.exit(1);
         }
};