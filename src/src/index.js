import express from 'express'
import http from 'http'
import socketio from 'socket.io'
import bodyParser from 'body-parser'
import alexaVerifier from 'alexa-verifier'
import { getVortexToken, getNumberOfNewLeads } from './vortex_client'

// import { connectFreeswitch } from './freeswitch'
import { ENV, PORT, JWT_SECRET } from './constants'
// import { userEvent } from './admin-socket'




export const app = express()
const server = http.createServer(app)
export const io = socketio(server, {path: '/io'})

app.use(bodyParser.json());

const requestVerifier = (req, res, next) => {
    console.log('verifing the request')
    next();
}
/*{ intent:
   { name: 'MyColorIsIntent',
     confirmationStatus: 'NONE',
     slots: { Color: [Object] } },
  intentName: 'MyColorIsIntent' }*/
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
    console.log(req.body);
    let repromptText = '';
    let sessionAttributes = {};
    let shouldEndSession = false;
    let speechOutput = 'The Red x personal assistant currently unavailable.'; 
    
    switch (req.body.intent.name){
        case "VortexStats":
            console.log("Getting storm stats")
            getNumberOfNewLeads((newLeadsCount) => {
                speechOutput = "Your total new lead count is " + newLeadsCount; 
                sendResponse(repromptText, sessionAttributes, shouldEndSession, speechOutput);
            }); 
            break;
        default:
            shouldEndSession = true;
            speechOutput += " Exiting the red x personal assitant"
            sendResponse(repromptText, sessionAttributes, shouldEndSession, speechOutput);
            break;
    }
});


const sendResponse = (repromptText, sessionAttributes, shouldEndSession, speechOutput) => {
    res.json({
        repromptText,
        sessionAttributes,
        shouldEndSession,
        speechOutput 
    })
}

app.get('/api/leads', (req, res) => res.send('THIS WORKED'));


server.listen(PORT, () => {
    console.log('Node server listening on port ' + PORT);
    getVortexToken(()=>{
        // getNumberOfNewLeads((newLeadsCount) => {
        //     console.log(newLeadsCount);
        // }); 
    });
});
