import mongoose, {Schema, Document} from 'mongoose';

export interface IDialog extends Document {
    author: {
        // type: Schema.Types.ObjectId, 
        // ref: any,
        // required: true
    };
    partner: {
        type: Schema.Types.ObjectId, 
        ref: string,
        required: boolean
    };
    messages:{
        type: Schema.Types.ObjectId;
        ref: string;
    };
}

const DialogSchema = new Schema(
    {
        author: {type: Schema.Types.ObjectId, ref: 'Users'},
        partner: {type: Schema.Types.ObjectId, ref: 'Users'},
        lastMessage: { type: Schema.Types.ObjectId, ref: "Messages"}
    },
    {
        timestamps: true,
    }
);

const DialogModel = mongoose.model<IDialog>('Dialogs', DialogSchema);

export default DialogModel;