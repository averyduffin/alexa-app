import express from 'express'
import http from 'http'
import socketio from 'socket.io'
import { vortex } from './routes'
// import jwt from 'jsonwebtoken'
// import { connectFreeswitch } from './freeswitch'
import { ENV, PORT, JWT_SECRET } from './constants'
// import { userEvent } from './admin-socket'
// import { getConfigValue } from './config'



export const app = express()
const server = http.createServer(app)
export const io = socketio(server, {path: '/io'})

app.get('/alexa', (req, res) => res.send('Hello World!'));

app.get('/api/leads', (req, res) => res.send('THIS WORKED'));


// export const broadcast = (room, eventName, data={}) => {
//     logger.info('[ ' + room + ' ] [ ' + eventName + ' ] ', data);
//     io.to(room).emit(eventName, data);
// }


// io.on('connection', (socket) => {

//     socket.on('disconnect', () => {
//         if (socket.user_id) {
//             logger.debug(socket.user_id + ' disconnected');
//             userEvent(socket.user_id, 'disconnected');
//         }
//     })

//     socket.on('subscribe', (data) => {
//         // note: we ignore expiration because the jwt has a tight window and we still want the socket to connect
//         jwt.verify(data.token, getConfigValue('jwt-secret'), { ignoreExpiration: true }, (err, payload) => {
//             if (err) {
//                 logger.error('JWT verification failed', err);
//             } else {
//                 socket.user_id = payload.user_id;
//                 socket.join('users');
//                 socket.join('U_' + socket.user_id);
//                 socket.join('FS_' + socket.user_id);
//                 socket.emit('useSocketIO', true);
//                 logger.info(socket.user_id + ' subscribed');
//                 userEvent(socket.user_id, 'connected');
//             }
//         })
//     })

// })


server.listen(PORT, () => {
    console.log('Node server listening on port ' + PORT);
    //connectFreeswitch();
});
