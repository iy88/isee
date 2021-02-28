import ws from "ws";
const conn = new ws('ws://localhost:1111');
conn.on('open',()=>{
  conn.send(JSON.stringify({action:'SUN',data:'kivin'}));
  conn.on('message',(data:string)=>{
    let pkg = JSON.parse(data);
    if(pkg.action === 'SUN'){
      if(pkg.code === 1){
        console.log('set username successfully');
        conn.send(JSON.stringify({action:'JR',data:{rid:'1234',key:'aaa'}}));
      }
    }else if(pkg.action === 'JR'){
      if(pkg.code === 1){
        console.log('join room successfully');
        setTimeout(() => {
          conn.send(JSON.stringify({action:'SM',data:{rid:'1234',msg:'message'}}));
        },2000);
      }
    }else if(pkg.action === 'SM'){
      if(pkg.code === 1){
        console.log('send message to room successfully');
      }
    }else if(pkg.action === 'PM'){
      console.log('received message from sv:',pkg.data);
    }
  })
})
conn.on('close',()=>{
  console.log('connection closed');
})