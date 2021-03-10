import { IUser } from '../models/User';

declare module 'express' {
    interface Request{
        user?: IUser;
    }
}

declare namespace Express {
    export interface Request {
        user?: IUser;
    }
 }