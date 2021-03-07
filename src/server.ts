import ws from "ws";
import uuid from "./uuid";
import Log from "./log";

interface room {
  [id: string]: roomInfo
}
interface roomInfo {
  members: string[];
  key: string
}
interface userInfo {
  un: string;
  rooms: string[];
  conn: any
}
interface user {
  [id: number]: userInfo
}
let rooms: room = {};
let users: user = {};
const log = new Log(false);

const wss = new ws.Server({
  port: 1111,
  perMessageDeflate: false
}, () => {
  console.log(`websocket server listening at ws://localhost:1111`);
  wss.on('connection', (socket: ws, req) => {
    const uid = uuid();
    log.debug(`get a connect from ${req.socket.remoteAddress}:${req.socket.remotePort}, create uuid ${uid}`);
    const tid = setTimeout(() => {
      if (!users[uid]) {
        socket.close();
        log.debug(`auto close connection [${req.socket.remoteAddress}:${req.socket.remotePort}/${uid}] which too long no response`);
      }
    }, 10 * 60 * 1000);
    socket.on('message', (data: string) => {
      let raw = data;
      log.debug(`received data [${raw}] from [${req.socket.remoteAddress}:${req.socket.remotePort}/${uid}]`);
      try {
        let pkg = JSON.parse(raw);
        log.debug(`parsed data from [${req.socket.remoteAddress}:${req.socket.remotePort}/${uid}]`);
        if (pkg.action === 'SUN') {
          if (pkg.data && typeof pkg.data === "string") {
            if (!users[uid]) {
              users[uid] = { un: pkg.data, rooms: [], conn: socket };
            }
            socket.send(JSON.stringify({ action: 'SUN', code: 1 }));
          } else {
            socket.send(JSON.stringify({ action: 'SUN', code: -1 }));
            clearTimeout(tid);
          }
        } else if (pkg.action === 'CR') {
          if (users[uid]) {
            if (pkg.data && typeof pkg.data === 'object' && pkg.data.key && pkg.data.rid && typeof pkg.data.key === 'string' && typeof pkg.data.rid === 'string') {
              if (!rooms[pkg.data.rid]) {
                rooms[pkg.data.rid] = { members: [uid], key: pkg.data.key };
                users[uid].rooms.push(pkg.data.rid);
                socket.send(JSON.stringify({ action: 'CR', rid: pkg.data.rid, code: 1 }));
              } else {
                socket.send(JSON.stringify({ action: 'CR', rid: pkg.data.rid, code: 0 }));
              }
            } else {
              socket.send(JSON.stringify({ action: 'CR', code: -1 }));
            }
          } else {
            socket.send(JSON.stringify({ action: 'CR', code: -999 }));
          }
        } else if (pkg.action === 'JR') {
          if (users[uid]) {
            if (pkg.data && typeof pkg.data === 'object' && pkg.data.rid && pkg.data.key && typeof pkg.data.rid === 'string' && typeof pkg.data.key === 'string') {
              if (rooms[pkg.data.rid]) {
                if (rooms[pkg.data.rid].key === pkg.data.key) {
                  rooms[pkg.data.rid].members.push(uid);
                  users[uid].rooms.push(pkg.data.rid);
                  rooms[pkg.data.rid].members.forEach((id)=>{
                    users[id].conn.send(JSON.stringify({ action: 'PM', data: { rid: pkg.data.rid, from: { uid:'server', un: 'server' }, msg: `${users[uid].un} was joined` } }));
                  })
                  socket.send(JSON.stringify({ action: 'JR', rid: pkg.data.rid, code: 1 }));
                } else {
                  socket.send(JSON.stringify({ action: 'JR', rid: pkg.data.rid, code: 0.1 }));
                }
              } else {
                socket.send(JSON.stringify({ action: 'JR', rid: pkg.data.rid, code: 0 }));
              }
            } else {
              socket.send(JSON.stringify({ action: 'JR', code: -1 }));
            }
          } else {
            socket.send(JSON.stringify({ action: 'JR', code: -999 }));
          }
        } else if (pkg.action === 'SM') {
          if (users[uid]) {
            if (pkg.data && typeof pkg.data === 'object' && pkg.data.rid && typeof pkg.data.rid === 'string' && pkg.data.msg && typeof pkg.data.msg === 'string') {
              if (rooms[pkg.data.rid]) {
                rooms[pkg.data.rid].members.forEach(id => {
                  if (id !== uid) {
                    users[id].conn.send(JSON.stringify({ action: 'PM', data: { rid: pkg.data.rid, from: { uid, un: users[uid].un }, msg: pkg.data.msg } }));
                  }
                })
                socket.send(JSON.stringify({ action: 'SM', data: { rid: pkg.data.rid, from: { uid, un: users[uid].un }, msg: pkg.data.msg }, code: 1 }));
              } else {
                socket.send(JSON.stringify({ action: 'SM', code: 0 }));
              }
            } else {
              socket.send(JSON.stringify({ action: 'SM', code: -1 }));
            }
          } else {
            socket.send(JSON.stringify({ action: 'SM', data: -999 }));
          }
        } else {
          socket.send("N M S L, Son of the Bitch");
        }
      } catch (e) {
        socket.close();
      }
    })
    socket.on('error', () => {
      if (users[uid]) {
        if (users[uid].rooms.length !== 0) {
          users[uid].rooms.forEach((rid: string) => {
            rooms[rid].members.splice(rooms[rid].members.indexOf(uid), 1);
            if (rooms[rid].members.length === 0) {
              delete rooms[rid];
            }else {
              rooms[rid].members.forEach(id => {
                users[id].conn.send(JSON.stringify({ action: 'PM', data: { rid: rid, from: { uid:'server', un: 'server' }, msg: `${users[uid].un} was left` } }));
              })
            }
          })
        }
        delete users[uid];
      }
    })
    socket.on('close', () => {
      if (users[uid]) {
        if (users[uid].rooms.length !== 0) {
          users[uid].rooms.forEach((rid: string) => {
            rooms[rid].members.splice(rooms[rid].members.indexOf(uid), 1);
            if (rooms[rid].members.length === 0) {
              delete rooms[rid];
            } else {
              rooms[rid].members.forEach(id => {
                users[id].conn.send(JSON.stringify({ action: 'PM', data: { rid: rid, from: { uid:'server', un: 'server' }, msg: `${users[uid].un} was left` } }));
              })
            }
          })
        }
        delete users[uid];
      }
    })
  })
})