import express from 'express';
import { verifyJWTToken } from '../utils';
import { IUser } from '../models/User';

interface RequestCustom extends express.Request{
    user?: IUser;
    headers: {
        token?: string;
    }
}
 
export default (
    req: any,
    res: express.Response,
    next: express.NextFunction
) => {
    if (req.path === '/user/login' 
        || req.path === '/user/registration' 
        || req.path === '/user/verify') {
        return next();
    }

    

    const token = req.headers.token;

    verifyJWTToken(token)
    .then((user?: any) => {
        req.user = user.data._doc;
        next();
    })
    .catch(() => {
        res.status(403)
        .json({message: "Invalid auth token provaider."});
    });

};