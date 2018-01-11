import esl from 'modesl'
import logger from './logger'
import backoff from 'backoff'
import { broadcast } from './index'
import { fsEvent, userEvent } from './admin-socket'
import { FS_HOST, FS_PORT, FS_PASSWORD, FS_SUBSCRIPTIONS } from './constants'
import { addActiveCall, removeActiveCall, getActiveCallLength } from './redis'


let started = false;
let fsConnection = null;
const reconnectTries = 100;
const activeCalls = {};

const fsConnect = backoff.fibonacci({
    randomisationFactor: 0,
    initialDelay: 10,
    maxDelay: 60000
});

fsConnect.failAfter(reconnectTries);

fsConnect.on('ready', (number, delay) => {
    if (number >= 5) {
        logger.warn('Attempting to connect to freeswitch (try ' + number + ')');
        fsEvent('connecting', { attempt: number });
    }
    fsConnection = connect();
});

fsConnect.on('fail', function() {
    logger.error('Failed to connect to freeswitch after ' + reconnectTries + ' tries');
    fsEvent('failed', { attempts: reconnectTries });
    fsConnection = connect();
});

export const connectFreeswitch = () => {
    if (started) { return; }
    started = true;
    fsConnect.backoff();
}

const send = (eventName, evt, data) => {
    const userId = evt.getHeader('variable_user_id');
    if (!userId) { return logger.error('Recieved freeswitch event without user_id', data); }
    data.userId = userId;
    broadcast('FS_' + userId, eventName, data);
    if (data.callType == 'USER') {
        const map = {
            'PARKED_USER': 'parked',
            'ENDED': 'hungup',
            'BRIDGED': 'bridged'
        }
        console.log(evt);
        if (map[data.status])
            userEvent(userId, map[data.status], { phone: data.phone });
    }
    if (data.callType == 'TARGET' && data.status == 'ORIGINATING')
        userEvent(userId, 'dialing', { phone: data.phone });
}

const setChannelMedia = (uuid, path) => {
    if(fsConnection){
       fsConnection.api('uuid_break', [uuid, "all"], (res) => {
           fsConnection.api('uuid_broadcast', [uuid, path, "aleg"], (res) => {});
       });
    }
}

const handleCallStatus = (evt) => {
    let useRingTone = true;
    const data = {
        uuid: evt.getHeader('Unique-ID') || evt.getHeader('Unique-Id'),
        phone: evt.getHeader('variable_phone'),
        hangupCause: '',
        status: evt.getHeader('variable_storm_status'),
        callType: evt.getHeader('variable_call_type'),
        ringTimeout: evt.getHeader('variable_ring_timeout'),
        sessionId: evt.getHeader('variable_session_id')
    };
    send('callEvents', evt, data);

    if(data.status == "ORIGINATING" && data.sessionId){
        getActiveCallLength(data.sessionId, (err, res) => {
            if(err) //do something
                return;
            if(res < 1 && useRingTone)
                setChannelMedia(data.sessionId, "local_stream://storm_moh_ringing");

            addActiveCall(data.sessionId, data.uuid, data.phone);
        });
    }
};

const handleMessageStatus = (evt) => {
    const data = {
        messageId: evt.getHeader('variable_message_id'),
        messageName: evt.getHeader('variable_message_name'),
        status: evt.getHeader('variable_message_status')
    };
    send('messages', evt, data);
};

const handleChannelHangup = (evt) => {
    let musicId = "6424cb4f-8c2d-4a95-a7d6-956e623c7f5a";
    let useRingTone = true;
    const data = {
        uuid: evt.getHeader('Unique-ID') || evt.getHeader('Unique-Id'),
        phone: evt.getHeader('variable_phone'),
        hangupCause: evt.getHeader('Hangup-Cause'),
        status: 'ENDED',
        callType: evt.getHeader('variable_call_type'),
        ringTimeout: evt.getHeader('variable_ring_timeout'),
        sessionId: evt.getHeader('variable_session_id')
    };
    send('callEvents', evt, data);
};

const connect = () => {
    const fs = new esl.Connection(FS_HOST, FS_PORT, FS_PASSWORD);

    fs.on('esl::ready', () => {
        fs.subscribe(FS_SUBSCRIPTIONS);
        logger.info('Connected to freeswitch');
        fsEvent('connected');
        fsConnect.reset();
    })

    fs.on('esl::event::CHANNEL_HANGUP_COMPLETE::*', handleChannelHangup);

    fs.on('esl::event::CUSTOM::*', (evt) => {
        switch (evt.getHeader("Event-Subclass")) {
            case 'STORM::call_status': handleCallStatus(evt); break;
            case 'STORM::message_status': handleMessageStatus(evt); break;
            default: logger.error('Unknown CUSTOM event'); break;
        }
    });

    fs.on('error', (err) => {
        logger.error('freeswitch ESL err', err);
        fsEvent('error', { error: err });
        if (err.code == 'ECONNREFUSED') { fsConnect.backoff(); }
    });

    fs.on('esl::end', () => {
        logger.error('Connection to freeswitch lost');
        fsEvent('disconnected');
        fsConnect.backoff();
    });

    return fs;
};