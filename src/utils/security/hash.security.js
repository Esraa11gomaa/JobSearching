
import bcrypt from 'bcrypt';

export const generateHash = async ({ plainText = "", salt = parseInt(process.env.SALT) } = {}) => {
    return await bcrypt.hash(plainText, salt);
};

export const compareHash = async ({ plainText = "", hashValue = "" } = {}) => {
    return await bcrypt.compare(plainText, hashValue);
};
