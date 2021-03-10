import bodyParser from 'body-parser';
import express from "express";
import socket from "socket.io";
import { UserCtrl, DialogCtrl, MessageCtrl, UploadCtrl } from '../controlleers';
import { updateLastSeen, checkAuth } from '../middleware';
import { loginValidation } from '../utils/validations';

import multer from "./multer";

export default (app: express.Express, io: socket.Server) => {
    const UserController = new UserCtrl(io);
    const DialogController = new DialogCtrl(io);
    const MessageController = new MessageCtrl(io);
    const UploadFileController = new UploadCtrl();

    
    app.use(bodyParser.json());
    app.use(updateLastSeen);
    app.use(checkAuth);
    
    app.get("/user/me", UserController.getMe);
    app.get("/user/verify", UserController.verify);

    app.get("/user/find", UserController.findUsers);

    app.post("/user/registration", UserController.create);
    app.post("/user/login", loginValidation, UserController.login);
    app.get("/user/:id", UserController.show);
    app.delete("/user/:id", UserController.delete);

    app.get("/dialogs", DialogController.index);
    app.post("/dialogs", DialogController.create);
    app.delete("/dialogs/:id", DialogController.delete);

    app.get("/messages", MessageController.index);
    app.post("/messages", MessageController.create);
    app.delete("/messages", MessageController.delete);

    app.post("/files", multer.single("file"), UploadFileController.create);
    app.delete("/files", UploadFileController.delete);
}