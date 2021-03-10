import bcrypt from 'bcrypt';

export default (password: any = '') => {
    return new Promise((resolve, reject) => {
        console.log(password);

        bcrypt.hash(password, 10, function(err, hash: string) {
            if (err) return reject(err);

        resolve(hash);
        });
    });
};