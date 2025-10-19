import {Request, Response} from 'express';
import jwt from 'jsonwebtoken'

export function authMiddleware(req: Request, res: Response, next?: (err?: any) => any): any{

    try{
        jwt.verify(req.headers.authorization.split(' ')[1], process.env.SECRET);
        next()
    }
    catch(e){
        res.send('Expired access-token token. Make new access-token at `/users/resfresh-tokens`, using your refresh-token')
    }
  
}