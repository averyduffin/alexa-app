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
    console.log("recieved ", req.rawBody);
    let repromptText = '';
    let sessionAttributes = {};
    const shouldEndSession = false;
    let speechOutput = 'This should have worked'; 
    res.json({
        repromptText,
        sessionAttributes,
        shouldEndSession,
        speechOutput 
    });
});

app.get('/api/leads', (req, res) => res.send('THIS WORKED'));


server.listen(PORT, () => {
    console.log('Node server listening on port ' + PORT);
});
