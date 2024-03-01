import { v4 as uuidv4 } from 'uuid';
import prisma from "./db.js";
import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
    service: "Gmail",
    host: "smtp.gmail.com",
    port: 465,
    secure: true,
    auth: {
        user: "basketlob@gmail.com",
        pass: "gewd ingn eins qbfa",
    },
});

export async function forgotPassword(email) {
    if (!email) {
        return {
            success: false,
            message: "Email je obavezan"
        };
    }

    const user = await prisma.user.findUnique({
        where: { email: email },
    });

    if (!user) {
        return {
            success: false,
            message: `Korisnik ${email} ne postoji`
        };
    }

    const token = uuidv4();

    await prisma.user.update({
        where: { email: email },
        data: {
            passwordResetToken: token
        }
    });

    // SEND EMAIL

    const mailOptions = {
        from: "basketlob@gmail.com",
        to: email,
        subject: "Zahtjev za resetovanje lozinke",
        text: `Udjite na ovaj link kako biste resetovali lozinku: http://84.247.177.105:8080/reset.html?token=${token}`,
    };

    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            console.error("Error sending email: ", error);
        } else {
            console.log("Email sent: ", info.response);
        }
    });

    return {
        success: true,
        message: "Mail je poslat"
    };
}