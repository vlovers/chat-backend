import { validationResult } from 'express-validator';
import socket from "socket.io";
import express from "express";
import bcrypt from 'bcrypt';

import { createJWToken } from '../utils'
import { UserModel } from '../models';
import { IUser } from '../models/User'
import { mailer } from '../utils'

class UserControlleer {
    io: socket.Server;

    constructor(io: socket.Server) {
      this.io = io;
    }

    show(req: express.Request, res: express.Response) {
        const id: string = req.params.id;
        UserModel.findById(id, (err: any, user: IUser) => {
            if (err) {
                return res.status(404).json({
                    message: "Not found"
                });
            } 
            res.json(user);
        })
    }

    getMe(req: any, res: express.Response) {
        const id: string = req.user._id;

        UserModel.findById(id, (err: any, user: IUser) => {
            if (err) {
                return res.status(404).json({
                    message: "Not found"
                });
            } 
            res.json(user);
        })
    }

    create(req: express.Request, res: express.Response) {
        const postData = {
            email : req.body.email,
            fullname : req.body.fullname,
            password : req.body.password
        }
        const user = new UserModel(postData);
        user
            .save()
            .then((obj: any) => {
                res.json(obj);

                const verifyUrl = (`http://localhost:3000/verify?hash=${obj.confirm_hash}`);
                const verifyEmail ={
                    from: '"Fred Foo 👻" <test.dev.mailsend@gmail.com>', // sender address
                    to: "mishakogyt17@gmail.com", // list of receivers
                    subject: "Привет, рады что ты с нами", // Subject line
                    text: `Перейди по ссылке для подтверждения твоего акаунта! ${verifyUrl}`, // plain text body
                }
            
                mailer(verifyEmail)
            })
            .catch(reason =>{
                res.json(reason);
            });
    }

    delete(req: express.Request, res: express.Response) {
        const id: string = req.params.id;
        UserModel.findOneAndRemove({_id: id})
            .then(user => {
                if (user) {
                    res.json({
                        message: `User ${user.fullname} deleted`
                    });
                }
            })
            .catch(err =>{
                res.json({
                    message: err
                });
            });
    }

    findUsers = (req: any, res: express.Response) => {
        const query: any = req.query.query;
        
        UserModel.find()
            .or([
                { fullname: new RegExp(query, "i") },
                { email: new RegExp(query, "i") }
            ])
            .then((users: any) => res.json(users))
            .catch((err: any) => {
                return res.status(404).json({
                status: "error",
                message: err
                });
            });
    };

    verify = (req: express.Request, res: express.Response): void => {
        const hash: any = req.query.hash;
        console.log(hash);
        
        if (!hash) {
            res.status(422).json({ errors: "Invalid hash" });
        } else {
            UserModel.findOne({ confirm_hash: hash }, (err: any, user: IUser) => {
                if (err || !user) {
                return res.status(404).json({
                    status: "error",
                    message: "Hash not found",
                });
                }
    
                user.confirmed = true;
                user.save((err: any) => {
                    if (err) {
                        return res.status(404).json({
                        status: "error",
                        message: err,
                        });
                    }
            
                    res.json({
                        status: "success",
                        message: "Аккаунт успешно подтвержден!",
                    });
                });
            });
        }
    };

    login(req: express.Request, res: express.Response) {
        const postData = {
            email: req.body.email,
            password: req.body.password,
        };

        
        const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(422).json({ errors: errors.array() });
        }
    
        UserModel.findOne({ email: postData.email }, (err: any, user: any) => {
            if (err) {
                return res.status(404).json({
                message: 'User not found',
                });
            }
        
            if (user && bcrypt.compareSync(postData.password, user.password)) {
                const token = createJWToken(user);
                res.json({
                    status: 'success',
                    token,
                    confirmed: user.confirmed
                });
            } else {
                res.json({
                    status: 'error',
                    message: 'Incorrect password or email',
                });
            }
        });
    }
};



export default UserControlleer;