export const ENV = process.env.STORM_ENV || 'dev';
export const PROD = ENV.toLowerCase() == 'prod';
export const PORT = 4040;

export const FS_HOST = 'storm-ip';
export const FS_PORT = 8021;
export const FS_PASSWORD = 'stormyday';

// BE CAREFUL, the order in which you subscribe to events matters!
// ("custom" must come after native events, but before specific custom events)
export const FS_SUBSCRIPTIONS = [
        'HEARTBEAT',
        'PLAYBACK_START',
        'CHANNEL_HANGUP_COMPLETE',
        'CHANNEL_APPLICATION',
        'CUSTOM',
        'STORM::call_status',
        'STORM::message_status'
];

export const VORTEX_URL = 'https://vortex.theredx.com/api';
export const VORTEX_USERNAME = 'aduffin';
export const VORTEX_PASSWORD = '!help!';