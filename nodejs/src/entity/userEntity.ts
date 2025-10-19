import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
} from "typeorm";
import {
    IsEmail,
    IsDate,
    MinLength, 
    MaxLength
} from "class-validator"
import 'reflect-metadata';

@Entity({name: "users"})
export class User {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  @MinLength(4, {
    message: 'firstname is too short',
  })
  @MaxLength(20, {
    message: 'firstname is too long',
  })
  firstname!: string;

  @Column()
  @MinLength(4, {
    message: 'lastname is too short',
  })
  @MaxLength(20, {
    message: 'lastname is too long',
  })
  lastname!: string;

  @Column()
  @MinLength(4, {
    message: 'patronymic is too short',
    }
  )
  @MaxLength(20, {
    message: 'patronymic is too long',
  })
  patronymic!:string;

  @Column()
  birthdate!: Date;

  @Column()
  @IsEmail()
  email!: string;

  @Column()
  @MinLength(4, {
    message: 'password is too short',
    }
  )
  @MaxLength(20, {
    message: 'password is too long',
  })
  password!: string;

  @Column()
  isadmin!: boolean;

  @Column()
  isactive!: boolean;

}