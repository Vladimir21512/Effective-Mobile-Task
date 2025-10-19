import { DataSource } from "typeorm"
import 'reflect-metadata';
import { User } from '../entity/userEntity'

export const AppDataSource = new DataSource({
    type: "postgres",
    host: process.env.POSTGRES_HOST || "localhost",
    port: Number(process.env.POSTGRES_PORT) || 5432,
    username: process.env.POSTGRES_USER || "postgres",
    password: process.env.POSTGRES_PASSWORD || "postgres",
    database: process.env.POSTGRES_DB || "postgres",
    entities: [User],
    //entities: ['../entity/userEntity.ts'],
})

try {
    //async()=>{await AppDataSource.initialize()}
    AppDataSource.initialize()
    console.log("Data Source has been initialized!")
    
} catch (error) {
    console.error("Error during Data Source initialization", error)
}