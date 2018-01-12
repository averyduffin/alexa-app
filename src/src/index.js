import express from 'express'
import http from 'http'
import socketio from 'socket.io'
import bodyParser from 'body-parser'
import alexaVerifier from 'alexa-verifier'
import { getVortexToken, getNumberOfNewLeads, getLeadStats, getCallbacks } from './vortex_client'

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
        case "VortexNewLeads":
            console.log("Getting storm stats")
            getNumberOfNewLeads((newLeadsCount) => {
                speechOutput = "Your total new lead count is " + newLeadsCount; 
                sendResponse(res, repromptText, sessionAttributes, shouldEndSession, speechOutput);
            }); 
            break;
        case "VortexStats":
            console.log("Getting storm stats")
            getLeadStats((stats) => {
                speechOutput = "Your lead stats are as follows: new leads, " + stats.New + ", Contacted, " + stats.Contacted + ", In Progress, " + stats.InProgress + ", callbacks, " + stats.Callback + ", Previously sold, " + stats.PrevSold + ", Relisted, " + stats.Relisted + ", Not interested, " + stats.NotInterested; 
                sendResponse(res, repromptText, sessionAttributes, shouldEndSession, speechOutput);
            }); 
            break;
        case "VortexCallbacks":
            console.log("Getting storm stats")
            getCallbacks((tasks) => {
                speechOutput = "Your total scheduled callbacks for today are, " + tasks.tasks.length + ", Your first callback is scheduled for 3 o'clock today, the name is, " + tasks.tasks[0].title + ", would you like to call them now with the storm dialer? Or Here the next one?"; 
                sendResponse(res, repromptText, sessionAttributes, shouldEndSession, speechOutput);
            }); 
            break;
        default:
            shouldEndSession = true;
            speechOutput += " Exiting the red x personal assitant"
            sendResponse(res, repromptText, sessionAttributes, shouldEndSession, speechOutput);
            break;
    }
});


const sendResponse = (res, repromptText, sessionAttributes, shouldEndSession, speechOutput) => {
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
        // getCallbacks((tasks) => {
        //     console.log(tasks.tasks[0].title);
        // }); 
    });
});
