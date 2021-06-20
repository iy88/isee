import ws from "ws";
let promises: any[] = [];
let conns: ws[] = [];
// new Promise((resolve) => {
//   const h = new ws('ws://localhost:1111');
//   h.on('open', () => {
//     resolve(h);
//   });
// });
for (let i = 0; i < 100000; i++) {
  promises.push(new Promise((resolve) => {
    const conn = new ws('ws://localhost:1111');
    conn.on('open', () => {
      resolve(conn);
    });
  }));
}
console.time();
Promise.all(promises).then((connections: any[]) => {
  console.timeEnd();
  console.log('all connections are opened');
  conns = connections;
  // let head = conns[0];
  // head.on('message', (data: string) => {
  //   let pkg = JSON.parse(data);
  //   if (pkg.action === 'CR') {
  //     if (pkg.code === 1) {
  //       console.log('create room successfully');
        conns.forEach((conn, ind) => {
          conn.send(JSON.stringify({ action: 'SUN', data: `${ind}` }))
        });
  //     }
  //   } else if (pkg.action === 'SUN') {
  //     if (pkg.code === 1) {
  //       console.log('set username successfully');
  //       head.send(JSON.stringify({ action: 'CR', data: { rid: '1234', key: 'aaa' } }));
  //     }
  //   } else if (pkg.action === 'SM') {
  //     if (pkg.code === 1) {
  //       console.log('send message to room successfully');
  //     }
  //   } else if (pkg.action === 'PM') {
  //     // console.log('received message from sv:', pkg.data);
  //   }
  // })
  promises = [];
  connections.forEach((conn,index) => {
    promises.push(new Promise((resolve) => {
      conn.on('message', (data: string) => {
        let pkg = JSON.parse(data);
        if (pkg.action === 'SUN') {
          if (pkg.code === 1) {
            // console.log('set username successfully',index);
            conn.send(JSON.stringify({ action: 'JR', data: { rid: '1234', key: 'aaa' } }));
          }
        } else if (pkg.action === 'SM') {
          if (pkg.code === 1) {
            console.log('send message to room successfully',index);
          }
        } else if (pkg.action === 'PM') {
          // console.log('received message from sv:', pkg.data);
        } else if (pkg.action === 'JR') {
          // console.log('join room successfully',index);
          resolve(conn);
        }
      })
    }));
  });
  console.time();
  Promise.all(promises).then((connections: any[]) => {
    console.timeEnd();
    console.log('all joined room');
    connections.forEach((conn)=>{
      conn.send(JSON.stringify({action:'SM',data:{rid:'1234',msg:'aaaaaaaaa'}}))
    })
  })
  // head.send(JSON.stringify({ action: 'SUN', data: '0' }));
});
