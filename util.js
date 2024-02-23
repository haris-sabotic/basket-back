import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

export const comparePasswords = (password, hash) => {
    return bcrypt.compare(password, hash);
};

export const hashPassword = (password) => {
    return bcrypt.hash(password, 5);
};

export const signToken = (id) => {
    const secret = "urmom";

    return jwt.sign({ id }, secret, {
        expiresIn: '1d',
    });
};

export const getUserIdFromToken = async (token) => {
    const secret = "urmom";

    const { id } = jwt.verify(token, secret);

    return id;
};