import { WebSocketServer } from 'ws';
import { register } from './register.js';
import { login } from './login.js';
import {
    check60SecsElapsed,
    checkBallHoopDistance,
    checkBallNotStationary,
    checkConsecutiveFrameDistance,
    checkHoopStationaryAfterTenPoints,
    checkRepeatingRecordings,
    checkTimeSinceLastPoint
} from './checks.js';

import CryptoJS from 'crypto-js';
import { getUserIdFromToken } from './util.js';
import prisma from './db.js';

const WS_SERVER = new WebSocketServer({ port: 8000 });

let CLIENTS = {};


const initGame = (token, ws) => {
    CLIENTS[token] = { ws };

    CLIENTS[token].score = 0;

    CLIENTS[token].timeStart = Date.now();

    CLIENTS[token].prevBallRecording = null;
    CLIENTS[token].prevHoopRecording = null;
};

WS_SERVER.on('connection', function connection(ws) {
    ws.on('error', console.error);

    ws.on('message', async function (data) {
        const json = JSON.parse(data);

        if (json.tag == "register") {
            const result = await register(
                json.msg.username,
                json.msg.email,
                json.msg.password
            );

            ws.send(JSON.stringify({
                tag: "register",
                data: result
            }));
        } else if (json.tag == "login") {
            const result = await login(
                json.msg.username,
                json.msg.password
            );

            ws.send(JSON.stringify({
                tag: "login",
                data: result
            }));
        }
    });

    ws.on('message', async function message(data) {
        const json = JSON.parse(data);

        if (json.tag == "new_client") {
            initGame(json.authToken, ws);
        }

        if (json.tag == "scored") {
            const sendError = (error) => {
                console.log(`Error: ${error}`);
                ws.send(JSON.stringify({ tag: "error", error }));
            };

            try {
                const msgText = CryptoJS.AES.decrypt(json.msg, CLIENTS[json.authToken].score.toString()).toString(CryptoJS.enc.Utf8);
                const msg = JSON.parse(msgText);

                if (!CLIENTS[json.authToken]) {
                    return;
                }

                const ballRecording = msg.ballRecording;
                const hoopRecording = msg.hoopRecording;

                if (!checkConsecutiveFrameDistance(ballRecording)) {
                    sendError("checkConsecutiveFrameDistance");
                    return;
                }
                if (!checkBallNotStationary(ballRecording)) {
                    sendError("checkBallNotStationary");
                    return;
                }
                if (!checkBallHoopDistance(ballRecording, hoopRecording)) {
                    sendError("checkBallHoopDistance");
                    return;
                }
                if (!checkHoopStationaryAfterTenPoints(hoopRecording, CLIENTS[json.authToken].score)) {
                    sendError("checkHoopStationaryAfterTenPoints");
                    return;
                }
                if (!check60SecsElapsed(CLIENTS[json.authToken])) {
                    sendError("check60SecsElapsed");
                    return;
                }
                if (!checkRepeatingRecordings(CLIENTS[json.authToken], ballRecording, hoopRecording)) {
                    sendError("checkRepeatingRecordings");
                    return;
                }
                if (!checkTimeSinceLastPoint(CLIENTS[json.authToken])) {
                    sendError("checkTimeSinceLastPoint");
                    return;
                }

                CLIENTS[json.authToken].timeSinceLastPoint = Date.now();
                CLIENTS[json.authToken].score += (msg.scoreType == "one") ? 1 : 2;

                ws.send(JSON.stringify({ tag: "score_approved", currentScore: CLIENTS[json.authToken].score }));
            } catch (error) {
                sendError("no haxx0ring!!");
            }
        }

        if (json.tag == "finished") {
            const id = getUserIdFromToken(json.authToken);

            const user = await prisma.user.findUnique({
                where: { id }
            });

            if (user) {
                const score = CLIENTS[json.authToken].score;
                const highscore = (user.highscore < score) ? score : user.highscore;

                await prisma.user.update({
                    where: { id },
                    data: {
                        highscore
                    }
                });

                ws.send(JSON.stringify({ tag: "results", score, highscore }));
            }
        }
    });
});