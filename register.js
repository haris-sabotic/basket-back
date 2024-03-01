import { v4 as uuidv4 } from 'uuid';
import prisma from "./db.js";
import { hashPassword, signToken } from "./util.js";

export async function register(username, email, password) {
    if (!username || !email || !password) {
        return {
            success: false,
            message: "Korisničko ime, email i šifra su obavezni"
        };
    }

    const emailExists = await prisma.user.findUnique({
        where: { email },
    });
    const usernameExists = await prisma.user.findUnique({
        where: { username },
    });
    if (emailExists) {
        return {
            success: false,
            message: "Email je zauzet"
        };
    }
    if (usernameExists) {
        return {
            success: false,
            message: "Korisničko ime je zauzeto"
        };
    }

    const user = await prisma.user.create({
        data: {
            username, email, password: await hashPassword(password),
            passwordResetToken: uuidv4()
        }
    });

    let token = await signToken(user.id);

    return {
        success: true,
        token
    };
}