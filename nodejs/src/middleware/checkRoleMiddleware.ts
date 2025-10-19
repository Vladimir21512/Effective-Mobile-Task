import {Request, Response} from 'express';
import { AppDataSource } from '../config/db';
import { User } from '../entity/userEntity';
import jwt from 'jsonwebtoken'

export function checkRoleMiddleware(req: Request, res: Response, next?: (err?: any) => any): any{

    try{
        const us = jwt.verify(req.headers.authorization.split(' ')[1], process.env.SECRET)
        if(us['isadmin']==true){
            res.locals.details = {isAdmin: true, finderId: Number(us['id'])}
            next()
        }
        else{ 
            res.locals.details = {isAdmin: false, finderId: Number(us['id'])}
            next()
        }
    }
    catch(e){
        res.send('Invalid access-token token. Make new access-token at `/users/resfresh-tokens`, using your refresh-token')
    }
  
}