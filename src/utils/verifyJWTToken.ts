import jwt from 'jsonwebtoken';
import { strict } from 'assert';
import { IUser } from '../models/User';


export default (token: string) =>  
    new Promise((resolve, reject) =>
    {
        jwt.verify(token, process.env.JWT_SECRET || '', (err, decodedToken) => 
        {
            if (err || !decodedToken) {
                return reject(err)
            }
            resolve(decodedToken)
        })
    })