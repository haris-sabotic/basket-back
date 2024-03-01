import prisma from "./db.js";
import { hashPassword } from "./util.js";

export async function resetPassword(password, token) {
    if (!password || !token) {
        return {
            success: false,
            message: "Šifra i token su obavezni"
        };
    }

    const user = await prisma.user.findUnique({
        where: { passwordResetToken: token },
    });

    if (!user) {
        return {
            success: false,
            message: `Token za resetovanje šifre je nevalidan`
        };
    }

    await prisma.user.update({
        where: { passwordResetToken: token },
        data: {
            password: await hashPassword(password)
        }
    });

    // SEND EMAIL

    return {
        success: true,
        message: "Šifra je resetovana"
    };
}