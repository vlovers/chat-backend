import socket from "socket.io";
import express from "express";

import { MessageModel, DialogModel } from '../models';


class MessageController {
    io: socket.Server;

    constructor(io: socket.Server) {
        this.io = io;
    }

    // updateReadStatus = (
    //     res: express.Response,
    //     userId: any,
    //     dialogId: string
    // ): void => {
    //     MessageModel.updateMany(
    //         { dialog: dialogId, user: { $ne: userId } },
    //         { $set: { unread: true } },
    //         {upsert: false},
    //         (err: any) => {
    //             if (err) {
    //                 console.log(err);
    //                 return res.status(500).json({
    //                     status: "error",
    //                     message: err
    //                 });
    //             } else {
    //                 this.io.emit("SERVER:MESSAGES_READED", {
    //                     userId,
    //                     dialogId,
    //                 });
    //             }
    //         }
    //     );
    //   };
      
      

    index = (req: any, res: any) => {
        const dialogId = req.query.dialog;    
        const userId = req.user._id;
        // console.log(this.updateReadStatus);
        // this.updateReadStatus(res, userId, dialogId);
        
        // MessageModel.updateMany(
        //     { dialog: dialogId, user: { $ne: userId } },
        //     { $set: { unread: true } },
        //     {upsert: false},
        //     (err: any) => {
        //         if (err) {
        //             console.log(err);
        //             return res.status(500).json({
        //                 status: "error",
        //                 message: err
        //             });
        //         } else {
        //             this.io.emit("SERVER:MESSAGES_READED", {
        //                 userId,
        //                 dialogId,
        //             });
        //         }
        //     }
        // );

        MessageModel.find({dialog: dialogId})
            .populate(['dialog', 'user', 'attachments'])
            .exec(function (err:any, message:any) {
                
                if (err) {
                    return res.status(404).json({
                        message: "Messages not found"
                    });
                }
                return res.json(message);
            });
    }

    // show(req: express.Request, res: express.Response) {
    //     const id: string = req.params.id;
    //     MessageModel.findById(id, (err: any, user: any) => {
    //         if (err) {
    //             return res.status(404).json({
    //                 message: "Not found"
    //             });
    //         } 
    //         res.json(user);
    //     })
    // }

    create = (req: any, res: express.Response) => {
        const userId = req.user._id;
    
        const postData = {
            text: req.body.text,
            dialog: req.body.dialog_id,
            attachments: req.body.attachments,
            user: userId
        };
    
        const message = new MessageModel(postData);
    
        message
            .save()
            .then((obj: any) => {

                obj.populate(["dialog", "user", "attachments"],
                (err: any, message: any) => {
                    if (err) {
                        return res.status(500).json({ message: err });
                    
                }

                DialogModel.findOneAndUpdate(
                    { _id: postData.dialog },
                    { lastMessage: message._id },
                    { upsert: true },
                    function(err) {
                      if (err) {
                        return res.status(500).json({
                            status: "error",
                            message: err
                        });
                      }
                    }
                );

                res.json(message);
                
                this.io.emit("SERVER:NEW_MESSAGE", message);
                });
            })
            .catch(reason => {
                res.json(reason);
            });
        };

        delete = (req: any, res: any) => {
            const id: any = req.query.id;
            const userId: any = req.user._id;

            // Find message
            MessageModel.findById(id, (err: any, message: any) => {
                if (err || !message) {
                    return res.status(404).json({
                        status: "error",
                        message: "Message not found"
                    });
                }
                // If author

                if (message.user.toString() === userId) {
                    const dialogId = message.dialog;
                    message.remove();

                    MessageModel.findOne({
                            dialog: dialogId
                        }, {}, {
                            sort: {
                                created_at: -1
                            }
                        },
                        (err, lastMessage) => {
                            if (err) {
                                res.status(500).json({
                                    status: "error",
                                    message: err
                                });
                            }

                            DialogModel.findById(dialogId, (err: any, dialog: any) => {
                                if (err) {
                                    res.status(500).json({
                                        status: "error",
                                        message: err
                                    });
                                }

                                dialog.lastMessage = lastMessage;
                                dialog.save();
                            });
                        }
                    );

                    return res.json({
                        status: "success",
                        message: "Message deleted"
                    });
                } else {
                    return res.status(403).json({
                        status: "error",
                        message: "Not have permission"
                    });
                }
            });
        };
};



export default MessageController;