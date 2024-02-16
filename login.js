import prisma from "./db.js";
import { comparePasswords, signToken } from "./util.js";

export async function login(username, password) {
    if (!username || !password) {
        return {
            success: false,
            message: "Korisničko ime i šifra su obavezni"
        };
    }

    const user = await prisma.user.findUnique({
        where: { username: username },
    });

    if (!user) {
        return {
            success: false,
            message: `Korisnik ${username} ne postoji`
        };
    }

    const isPasswordCorrect = await comparePasswords(password, user.password);

    if (isPasswordCorrect) {
        let token = signToken(user.id);

        return {
            success: true,
            token
        };
    } else {
        return {
            success: false,
            message: `Netačna šifra`
        };
    }
}