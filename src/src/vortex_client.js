import Request from 'request'
import { VORTEX_URL, VORTEX_USERNAME, VORTEX_PASSWORD } from './constants'

let jwtToken = '';
let userId = '';

export const getVortexToken = (callback) => {
    var options = {
        uri: VORTEX_URL + "/login",
        method: 'POST',
        json: {
            "username":VORTEX_USERNAME,
            "password":VORTEX_PASSWORD
        }
      };

    Request(options, function (error, response, body) {
        console.log(body.token);
        jwtToken = body.token;
        userId = body.id;
        callback();
    }); 
}

export const getNumberOfNewLeads = (callback) => {
    var options = {
        uri: VORTEX_URL + "/users/" + userId + "/leads/search?access_token=" + jwtToken,
        method: 'POST',
        json: {}
      };

    Request(options, function (error, response, body) {
        console.log(body.counts.funnel.New);
        callback(body.counts.funnel.New);
    });
}

export const getLeadStats = (callback) => {
    var options = {
        uri: VORTEX_URL + "/users/" + userId + "/leads/search?access_token=" + jwtToken,
        method: 'POST',
        json: {}
      };

    Request(options, function (error, response, body) {
        console.log(body.counts.funnel);
        callback(body.counts.funnel);
    });
}

export const getCallbacks = (callback)=> {
    var options = {
        uri: VORTEX_URL + "/users/" + userId + "/tasks?access_token=" + jwtToken,
        method: 'GET'
      };

    Request(options, function (error, response, body) {
        let task = JSON.parse(body);
        callback(task);
    });

}