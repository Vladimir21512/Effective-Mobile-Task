import {Request, Response} from 'express';
import { AppDataSource } from '../config/db';
import { User } from '../entity/userEntity';
import { validate } from 'class-validator';
//import 'reflect-metadata';

export function checkBodyMiddleware(req: Request, res: Response, next?: (err?: any) => any): any {

    try {
         if(/^\d{4}-\d{2}-\d{2}$/.test(req.body.birthdate)){
            let info = req.body
            const user = AppDataSource.manager.create(User, info)
        
                let errMain="";
                let flag = false;
                validate(user).then(errors=>{
                    if (errors.length > 0) {
                     flag=true;
                     let err=""
                     for( var i=0;i<errors.length;i++){
                         if(i+1!=errors.length){
                                err+=errors[i]['property']+', '
                            }
                            else{
                                err+=errors[i]['property']
                            }
                        }
                     errMain='invalid fields: '+err
                 } else {
                     return 0;
                 }   
                }).then(()=>{
                    if(flag){
                        res.send(errMain)
                    }
                    else{
                        next()
                    }
        })  
   
  }
  else{
    res.send('invalid')
  }
    } catch (error) {
        return 'invalid'
    }
 

}