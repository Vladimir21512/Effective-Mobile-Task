import { Controller, JsonController, Get, Param, Post, Body, Res, UseBefore } from 'routing-controllers';
import { checkBodyMiddleware } from '../middleware/checkBodyMiddleware';
import { authMiddleware } from '../middleware/authMiddleware';
import { AppDataSource } from '../config/db';
import { User } from '../entity/userEntity'
import bcrypt from 'bcrypt';
import { checkRoleMiddleware } from "../middleware/checkRoleMiddleware"
import jwt from 'jsonwebtoken'
import 'reflect-metadata';

import { getMetadataArgsStorage } from 'routing-controllers'
import { OpenAPI, routingControllersToSpec } from 'routing-controllers-openapi'

@JsonController()
export class UserController{

    @Get('/api')
    @OpenAPI({
        description: 'Получить все конечные точки',
    })
    async Api (@Body() info: any){
        const storage = getMetadataArgsStorage()
        const spec = routingControllersToSpec(storage)
        return spec
    }

    // В теле запроса:    {"firstname": "frstnm", "lastname": "lstnm", "patronymic": "ptrnmc", "birthdate": "YYYY-MM-DD", "email": "test@mail.ru", "password": "test"}
    @Post('/users/create')
    @OpenAPI({
        requestBody: {content: {"application/json": {"schema":{
            properties: {
                firstname:{type: "string"},
                lastname:{type: "string"},
                patronymic:{type: "string"},
                birthdate:{type: "string"},
                email:{type: "string"},
                password:{type: "string"},
            },
            description: 'Создать пользователя. Для поля birthdate использовать формат YYYY-MM-DD.'
        }}}}
    })
    @UseBefore(checkBodyMiddleware)
    async createUser (@Body() info: any) {
        let isAdmin=false
        if (info['password']==process.env.ADMIN_PASSWORD){
            isAdmin=true;
        }
        
        let result
       
        await new Promise((resolve,rej)=>{
            resolve(AppDataSource
                .getRepository(User)
                .createQueryBuilder('user')
                .where('user.email = :email',{email: info['email']})
                .getOne().then((l)=>{result = l}))
        })
        
        await new Promise((res,rej)=>{
            if(result!=null){
                result = 'user already exist. Please, sign in.'
                res(result)
            }
            else{
                bcrypt.hash(info['password'], 9).then((a)=>{
                    return AppDataSource
                    .createQueryBuilder()
                    .insert()
                    .into(User)
                    .values({lastname: info['lastname'], 
                        firstname: info['firstname'], 
                        patronymic: info['patronymic'], 
                        birthdate: info['birthdate'], 
                        email: info['email'], 
                        isadmin: isAdmin,
                        isactive: true,
                            password: a})
                    .execute().then((b)=>{
                        delete info['password']
                        info.id = b.identifiers[0].id
                        let message = 'Account is created! U can use this tokens in `Authorization: Bearer` Header for queries: \n'+ 
                        'Access token: '+jwt.sign(info, process.env.SECRET, {expiresIn: '3m'})+'\n'+
                        'Refresh token: '+jwt.sign(info, process.env.SECRET, {expiresIn: '3d'})+'\n';
                        return message
                    })}).then((j)=>{
                        result = j
                        res(result)
                    })
            }
            //res(result)
        })
        
      
        
    
        return result
        
    }

    // получаем новую пару токенов(endpoint используется при истечении access токена)
    // В теле запроса:    {"refresh-token": "ReFrEsHtOkEnReFrEsHtOkEn..."}
    @Post('/users/resfresh-tokens')
    @OpenAPI({ 
        requestBody: {content: {"application/json": {"schema":{
            properties: {
                'refresh-token':{type: "string"},
            },
             description: 'Получить новую пару токенов, используя refresh токен',
        }}}}
    })
    async getTokenPair (@Body() info: any) {

        if(!info){
            return 'invalid'
        }

        try{
            if(info['refresh-token']!=undefined){
            try{
                let refresh = jwt.verify(info['refresh-token'], process.env.SECRET);
                delete refresh['iat']
                delete refresh['exp']
                const userRepository = await AppDataSource.getRepository(User);
                const user = await userRepository.findOneBy({email: refresh['email']});
                if(user==null){
                    return 'invalid refresh token';
                }
                return 'New access-token:\n'+jwt.sign(JSON.parse(JSON.stringify(user)), process.env.SECRET, {expiresIn: '3m'});
            }
            catch(e){
                console.log(e)
                return 'invalid refresh token';
            }
        }
        }
        catch(e){
            return 'invalid field'; 
        }              
    }

    // нужно заново логиниться для получения нового refresh токена при его истечении 
    // Body:    { "email": "mail@mail.ru", "password": "pswrd"}
    @Post('/users/login')
     @OpenAPI({
        requestBody: {content: {"application/json": {"schema":{
            properties: {
                'email':{type: "string"},
                'password':{type: "string"},
            },
             description: 'Получить новую пару токенов, используя refresh токен',
        }}}}
    })
    async loginUser (@Body() info: any) {
        if(!info){
            return 'invalid'
        }
        if(info.hasOwnProperty('password') && info.hasOwnProperty('email') && Object.keys(info).length ==2){
            const userRepository = await AppDataSource.getRepository(User);
            const user = await userRepository.findOneBy({email: info['email']});
            let result="";
            if(user==null){
                return 'no user found'
            }
            await new Promise((res,rej)=>{
                bcrypt.compare(info['password'], user['password'],function(err,resul){
                    if(err){
                        console.log(err)
                       result='err'
                       res(result)
                    }
                    if (resul) {
                        let refresh_token=jwt.sign(JSON.parse(JSON.stringify(user)), process.env.SECRET, {expiresIn:'3d'})
                       let access_token=jwt.sign(JSON.parse(JSON.stringify(user)), process.env.SECRET, {expiresIn:'3m'})
                          result = "Successfully! Your Reffresh-Token: "+refresh_token+"\n"+"Access-Token: "+access_token;
                       res(result)
                    } else {
                        result="Password is incorrect!";
                       res(result)
                    }
                })  
            })
            return result;
        }
        else{
            return 'invalid fields'
        }
    }

    // в рандомном запросе проверяем access токен в middleware 
    // в заголовке запроса Authorization: Bearer `your-access-token`
    @Post('/users/example-query-auth')
     @OpenAPI({
        description: 'в рандомном запросе проверяем access токен в Authorization: Bearer `your-access-token`, используя middleware ',
    })
    @UseBefore(authMiddleware)
    async authUser (@Body() info: any) {
        return 'successfully execute auth query';           
    }
   
    // в теле запроса:  {"getId": "id"}
    @Post('/users/get-user')
    @OpenAPI({
        requestBody: {content: {"application/json": {"schema":{
            properties: {
                'getId':{type: 'integer'},
            },
            description: 'Получить пользователя по id',
        }}}}
    })
    @UseBefore(checkRoleMiddleware)
    async getUserById (@Res() body:any, @Body() info:any) {
        if(!info){
            return 'invalid'
        }
        if(info.hasOwnProperty('getId') && Object.keys(info).length ==1){
            const userRepository = await AppDataSource.getRepository(User);
            const user = await userRepository.findOneBy({id: Number(info['getId'])});
            if(user==null){
                return 'user not found'
            }
            if(!body.locals.details.isAdmin && body.locals.details.finderId!=user['id']){
                return 'user not found'
            }
            else{
                return JSON.stringify(user)
            }
           
        }
        else{
            return 'invalid fields'
        } 
         
    }

    @Post('/users/users-list')
    @OpenAPI({
        description: 'Получить список пользователей(только для админа)',
    })
    @UseBefore(checkRoleMiddleware)
    async getUserList (@Res() res:any, @Body() body:any){
        if(!res.locals.details.isAdmin){
            return 'access denied'
        }
        let result
        await new Promise((resolve, reject) => {
            const userRepository = AppDataSource.getRepository(User);
            const find  = userRepository.find().then((f)=>{
                result=f
                return f
            }).then((a)=>resolve(a))
        })
        return JSON.stringify(result)
    }

    // тело запроса {"blockId": "id"}
    @Post('/users/block')
     @OpenAPI({    
        requestBody: {content: {"application/json": {"schema":{
            properties: {
                'blockId':{type: 'integer'},
            },
            description: 'Блокировка пользователя',
        }}}}
    })
    @UseBefore(checkRoleMiddleware)
    async blockUser (@Res() res:any, @Body() body:any){
       
        if(!body){
            return 'invalid'
        }
        if(!body.hasOwnProperty('blockId')){
            return 'invalid'
        }

        if(res.locals.details.isAdmin){
            const userRepository = await AppDataSource.getRepository(User);
            const user = await userRepository.update({id: body.blockId}, {isactive: false})
            if(user.affected!=0){
                let message = "you have blocked user "+String(body.blockId)
                return message
            }
            else{
                'user not found'
            }
        }
        else{
            if(res.locals.details.finderId!=body.blockId){
                return 'access denied'
            }
            if(res.locals.details.finderId==body.blockId){
                const userRepository = await AppDataSource.getRepository(User);
                const user = await userRepository.update({id: body.blockId}, {isactive: false})
                return 'you have blocked yourself'
            }
        }

    }
}

const storage = getMetadataArgsStorage()
const spec = routingControllersToSpec(storage)
console.log(spec)