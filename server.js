const express = require('express');
const cors = require('cors');
const net = require ('net');
const PORT_EXP = 4000;
const PORT_NTP = 6000;
const HOST= '10.9.11.236';



//----------------NTP Server (TCP)--------------------------------//

var serverNtp = net.createServer(function (socket){

    socket.on('data', function(data){
        var T2 = new Date();
        var T3 = new Date();
        socket.write(data.toString() + ',' + T2.getTime().toString() +','+ T3.getTime().toString());  //le mando al cliente la hora actual del servidor
    });

    socket.on('error', (error)=>{
        console.log('Algun cliente se desconectó de la sala'+ '('+error+')');
    })
});

serverNtp.on('close',function(){
    console.log('Server NTP cerrado');
});

serverNtp.listen(PORT_NTP,HOST);
console.log('Servidor NTP escuchando en puerto ' + PORT_NTP);

//------------------- Express server------------------------------------------------// 

var app = express();
app.use(cors());
var user_sessions = [];


app.get('/register', function(req, res) {
    registraUsuario(req.query);
    console.log('Lista de nodos activos:');
    console.log(user_sessions);
    res.setHeader('Content-Type', 'application/json');
    res.send(JSON.stringify(user_sessions));
});

app.get('/userlist', function(req, res) {
    res.send(JSON.stringify(user_sessions));
});

app.listen(PORT_EXP, function() {
  console.log('Servidor Express escuchando en puerto '+ PORT_EXP);
});

function registraUsuario(query){
    var user = {
        username: query.username,
        ip : query.ip,
        port : query.port,
        timestamp : new Date()
    }
    var found = false; 
    user_sessions.forEach(function(item){
        if(item.username == user.username && item.ip == user.ip && item.port == user.port){
            item.timestamp = new Date();
            found =true;
        }
    });
    if (! found)
         user_sessions.push(user);
}

function controlaSesiones(){
    console.log('Controlando sesiones:');
    user_sessions.forEach(function(value){
        let time_actual = new Date().getTime();
        if(  (time_actual - value.timestamp.getTime() ) > 90000 ){
            user_sessions.splice(user_sessions.indexOf(value), 1);
            console.log('Se elimino el elemento: ');
            console.log(value);
        }
    })
}

setInterval(controlaSesiones, 1000*30);