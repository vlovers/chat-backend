import mongoose, {Schema, Document} from 'mongoose';

export interface IMessage extends Document {
    text: {
        type: string,
        require: boolean
    };

    dialog: {
        // type: Schema.Types.ObjectId,
        // ref: string,
        // require: boolean
    };
    user: {
        type: Schema.Types.ObjectId,
        ref: string,
        required: boolean
    };
    unread: {
        // type: boolean,
        // default: boolean
    };
}

const MessageSchema = new Schema({
    text: { type: String },
    dialog: { type: Schema.Types.ObjectId, ref: 'Dialogs', required: true },
    user: { type: Schema.Types.ObjectId, ref: "Users", required: true },
    unread: { type: Boolean, default: false },
    attachments: [{ type: Schema.Types.ObjectId, ref: "UploadFiles", required: true }]
},
{
    timestamps: true,
    usePushEach: true
});

const MessageModel = mongoose.model<IMessage>('Messages', MessageSchema);

export default MessageModel;