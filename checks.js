// Return false if the distance between any 2 consecutive ball positions is greater than 400
export function checkConsecutiveFrameDistance(RECORDING_BALL) {
    for (let i = 1; i < RECORDING_BALL.length; i++) {
        const prevPosition = RECORDING_BALL[i - 1];
        const position = RECORDING_BALL[i];

        if (Math.abs(prevPosition - position) > 400) {
            return false;
        }
    }

    return true;
}

// Return false if the ball was stationary for the entire recording
export function checkBallNotStationary(RECORDING_BALL) {
    let firstPosition = RECORDING_BALL[0];

    for (let i = 0; i < RECORDING_BALL.length; i++) {
        const position = RECORDING_BALL[i];

        if (position.x != firstPosition.x && position.y != firstPosition.y) {
            return true;
        }
    }

    return false;
}

// Return false if the distance between the hoop and ball on their last recordings is greater than 400
export function checkBallHoopDistance(RECORDING_BALL, RECORDING_HOOP) {
    let lastBallPosition = RECORDING_BALL[RECORDING_BALL.length - 1];
    let lastHoopPosition = RECORDING_HOOP[RECORDING_HOOP.length - 1];

    let distanceSquared =
        Math.pow(lastBallPosition.x - lastHoopPosition.x, 2) +
        Math.pow(lastBallPosition.y - lastHoopPosition.y, 2);

    return distanceSquared <= Math.pow(400, 2);
}

// Return false if the hoop was stationary at any point when the score was over 10
export function checkHoopStationaryAfterTenPoints(RECORDING_HOOP, score) {
    if (score > 10) {
        for (let i = 1; i < RECORDING_HOOP.length; i++) {
            const prevPosition = RECORDING_HOOP[i - 1];
            const position = RECORDING_HOOP[i];

            if (position == prevPosition) {
                return false;
            }
        }
    }

    return true;
}

// Return false if more than 65 seconds have elapsed since the first point
// NOTE: it's 65 instead of 60 because of the hulk video
export function check60SecsElapsed(client) {
    const sixtySecs = 65 * 1000;

    if (client.timeSinceLastPoint) {
        return (Date.now() - client.timeSinceLastPoint) <= sixtySecs;
    } else {
        return true;
    }
}

// Return false if one of the recording is the same as the previous point's
export function checkRepeatingRecordings(client, RECORDING_BALL, RECORDING_HOOP) {
    const prevRecordingsExist = client.prevBallRecording && client.prevHoopRecording;
    const sameRecording = client.prevBallRecording == RECORDING_BALL ||
        client.prevHoopRecording == RECORDING_HOOP;

    if (prevRecordingsExist) {
        if (sameRecording) {
            return false;
        } else {
            return true;
        }
    } else {
        return true;
    }
}

// Return false if the time elapsed since the last point is less than 500ms
export function checkTimeSinceLastPoint(client) {
    if (client.timeSinceLastPoint) {
        if (Date.now() - client.timeSinceLastPoint < 500) {
            return false;
        } else {
            return true;
        }
    } else {
        return true;
    }
}