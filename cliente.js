const readline = require('readline');
const net = require('net');
const http = require('http');
const querystring = require('querystring');
const dgram = require('dgram');

const HOST_HTTP = '127.0.0.1';          //host servidor HTTP
const PORT_HTTP = 4000;
const HOST_NTP = '127.0.0.1';           //host servidor NTP
const PORT_NTP = 3000;                  //puerto servidor NTP
const PORT_UDP = getRndInteger(8000,9000);   //puerto cliente para escuchar conexiones UDP entrantes
const HOST_UDP = '127.0.0.1';                //host cliente para escuchar conexiones UDP entrantes
const nombreUsuario = process.argv[2];       //nombre de usuario por consola
const client_ip = '127.0.0.1';               //ip local del cliente(para la lista de nodos)
var lista ;                                 //lista de nodos del chat
var offset = null;                                 //offset del reloj


const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });

//---------------------Cliente NTP (TCP)--------------------------------------------//

var clienteNTP = new net.Socket();
clienteNTP.connect(PORT_NTP,HOST_NTP, function(){
    var T1 = new Date();
    clienteNTP.write(T1.getTime().toString()); 
});

clienteNTP.on('data', function(data){
    offset = calculoOffset(data);
    console.log('Reloj Sincronizado con NTP: Offset en ms: '+ offset);
    userRegister();
    console.log('Entraste a la sala de chat');
    heartBeat();
});

clienteNTP.on('error', (error)=>{
    console.log(error);
})

clienteNTP.on('close', function() {
	console.log('Conexion cerrada');
});


function calculoOffset(data){
    var T4 = new Date().getTime();
    var tiempos = data.toString().split(",");
    var T1 = parseInt(tiempos[0]);
    var T2 = parseInt(tiempos[1]);
    var T3 = parseInt(tiempos[2]);
    var offset = ((T2 - T1) + (T3 - T4)) / 2;   // calculamos offset de la red
   // console.log('T1: '+ T1 + ', T2: '+ T2 + ', T3: '+ T3+ ' T4: '+ T4);
    return offset;
}

//---------------------------Cliente HTTP--------------------------------------------------//

function userRegister(){
    let path_register ='/register?'+ querystring.stringify({ username: process.argv[2], ip : client_ip , port: PORT_UDP });
    http.get( {hostname: HOST_HTTP, port: PORT_HTTP, path: path_register, agent: false}, function(res){       
            let rawData = ''; 
            res.on('data', function(chunk){
                rawData+= chunk;
            });
    
            res.on('end', function(){
                lista = JSON.parse(rawData);
                //console.log(lista);
                console.log('Lista de usuarios actualizada' );
            });   
    });
}



function heartBeat(){
    setInterval(userRegister, 1000*60);
}


//---------------------Cliente P2P escucha(UDP)------------------------------------------//

function getRndInteger(min, max) {
    return Math.floor(Math.random() * (max - min + 1) ) + min;
} 


var server = dgram.createSocket('udp4');

server.on('message', function(message, remote) {
   var mensaje = JSON.parse(message);
   console.log(mensaje.from + ' dice: '+ mensaje.message +' ('+ muestraFecha(mensaje.timestamp, mensaje.offset)+')');
});

server.bind(PORT_UDP, HOST_UDP);

function muestraFecha(date, offset){
    var d = new Date(date+offset);
    return ("0" + d.getDate()).slice(-2) + "-" + ("0"+(d.getMonth()+1)).slice(-2) + "-" +
    d.getFullYear() + " a las " + ("0" + d.getHours()).slice(-2) + ":" + ("0" + d.getMinutes()).slice(-2)+ ":" + ("0" + d.getSeconds()).slice(-2);
}

//---------------------Cliente P2P broadcast --------------------------------------------//

var clientUDP = dgram.createSocket('udp4');

rl.on('line', (input) => {
    var message = {
        from: nombreUsuario,
        to: 'all',
        message : input,
        timestamp : new Date().getTime(),
        offset : offset
    };
    var json = new Buffer(JSON.stringify(message));

    lista.forEach(function (item){
        var puerto_destino= item.port;
        var host_destino= item.host;
        if(item.port != PORT_UDP ) // tamb controlar por host distinto
             clientUDP.send(json, 0, json.length, puerto_destino, host_destino, function(err, bytes) {
        if (err) throw err;
   
        });

    });    
  });

