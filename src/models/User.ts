import mongoose, {Schema, Document} from 'mongoose';
import isEmail  from 'validator';
import differenceInMinutes from "date-fns/differenceInMinutes";

import { generatePasswordHash } from '../utils';

export interface IUser extends Document {
    email?: string;
    fullname?: string;
    password?: string;
    confirmed?: boolean;
    avatar?: string;
    confirm_hash?: string;
    last_seen?: Date;
}

const UserSchema = new Schema({
    email: {
        type: String,
        required: 'Email adress is required',
        // validate: [isEmail, 'Invalid email'],
        index: {unique: true}
    },
    avatar: String,
    fullname: {
        type: String,
        required: 'Fullname is required'
    },
    password: {
        type: String,
        required: 'Password is required'
    },
    confirmed: {
        type: Boolean,
        default: false
    },
    confirm_hash: String,
    last_seen: {
        type: Date,
        default: new Date()
    }
}, {
    timestamps: true,
});

UserSchema.virtual("isOnline").get(function(this: any) {
    return differenceInMinutes(new Date(), this.last_seen) < 5;
});
  
UserSchema.set("toJSON", {
    virtuals: true
});
UserSchema.pre('save', function(next) {
    const user: IUser = this;
  
    if (!user.isModified('password')) return next();

    generatePasswordHash(user.password)
      .then(hash => {
        user.password = String(hash);
        console.log(+new Date());

        generatePasswordHash(String(+new Date())).then((confirmHash) => {
            console.log("confirmHalolllllsh");
            
          user.confirm_hash = String(confirmHash);
          next();
        });
      })
      .catch(err => {
        next(err);
      });
  });

const UserModel = mongoose.model<IUser>('Users', UserSchema);

export default UserModel;