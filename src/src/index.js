import express from 'express'
import http from 'http'
import socketio from 'socket.io'
import bodyParser from 'body-parser'
import alexaVerifier from 'alexa-verifier'
import { vortex } from './routes'
// import jwt from 'jsonwebtoken'
// import { connectFreeswitch } from './freeswitch'
import { ENV, PORT, JWT_SECRET } from './constants'
// import { userEvent } from './admin-socket'
// import { getConfigValue } from './config'



export const app = express()
const server = http.createServer(app)
export const io = socketio(server, {path: '/io'})

app.use(bodyParser.json({
    verify: function getRawBody(req, res, buf) {
        req.rawBody = buf.toString();
    }
}));

const requestVerifier = (req, res, next) => {
    console.log('verifing the request')
    next();
    // alexaVerifier(
    //     req.headers.signaturecertchainurl,
    //     req.headers.signature,
    //     req.rawBody,
    //     function verificationCallback(err) {
    //         if (err) {
    //             res.status(401).json({ message: 'Verification Failure', error: err });
    //         } else {
    //             next();
    //         }
    //     }
    // );
}

app.get('/alexa', requestVerifier, (req, res) => {
    console.log("REQUEST TO GET WAS JUST MADE");
    res.json({
        "version": "1.0",
        "response": {
            "shouldEndSession": true,
            "outputSpeech": {
                "type": "SSML",
                "ssml": "<speak>Looks like a great day!</speak>"
            }
        }
    });
})

app.post('/alexa', requestVerifier, (req, res) => {
    console.log("recieved request");
    if (req.body.request.type === 'LaunchRequest') {
        console.log("Launch Request");
        res.json({
            "version": "1.0",
            "response": {
            "shouldEndSession": true,
            "outputSpeech": {
                "type": "SSML",
                "ssml": "<speak>Hmm <break time=\"1s\"/> What day do you want to know about?</speak>"
            }
            }
        });
    }
    else if (req.body.request.type === 'SessionEndedRequest') {
        // Per the documentation, we do NOT send ANY response... I know, awkward.
        console.log('Session ended', req.body.request.reason);
    }
    else if (req.body.request.type === 'IntentRequest' &&
        req.body.request.intent.name === 'Forecast') {
        console.log("Forecast");
        if (!req.body.request.intent.slots.Day ||
            !req.body.request.intent.slots.Day.value) {
            // Handle this error by producing a response like:
            // "Hmm, what day do you want to know the forecast for?"
        }
        let day = new Date(req.body.request.intent.slots.Day.value);

        // Do your business logic to get weather data here!
        // Then send a JSON response...

        res.json({
            "version": "1.0",
            "response": {
                "shouldEndSession": true,
                "outputSpeech": {
                    "type": "SSML",
                    "ssml": "<speak>Looks like a great day!</speak>"
                }
            }
        });
    } 
});

app.get('/api/leads', (req, res) => res.send('THIS WORKED'));


server.listen(PORT, () => {
    console.log('Node server listening on port ' + PORT);
});
