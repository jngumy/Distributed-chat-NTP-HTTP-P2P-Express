# Distributed-chat-NTP-HTTP-P2P (Express Version)

This was a project for my University's Distributed Systems subject. Basically, it's a  distributed shell chat implemented with Node.js and Express Framework. The main concepts here were work with:
* NTP servers (a TCP client connecting to a TCP server to synchronize his time and obtain an offset)
* hybrid architectures (client-server with the TCP client connecting to an http server for register and P2P with UDP sockets to chat with other peers)

## Requirements
Here are some of the requirements:
* The client must calculate his clock's offset with reference server by NTP (TCP Socket)
* The client must register on an HTTP server with the GET method in the following endpoint:
 ```
/register?username=<user_name>&ip=<ipaddress>&port=<port>
```
* The http server must return a list of active nodes with this JSON format:

 ```
{username: 'userNameX', ip: 'XXX.XXX.XXX.XXX', PORT:YYYY}
```

* The client with the active nodes list must be able to send and receive messages with the following JSON format, using UDP sockets:

 ```
{ 
  from: 'userNameX',
  to: 'all',
  message: 'payload',
  timestamp: millis,
  offset: millis
}
```
* Show the received message with this format:
 ```
day/month/year hour:minutes:seconds "message payload"
```

* Periodically (every 1 minute) the client must send a heartbeat to indicate his active status

* Implement a web client (HTML/JavaScript) to show the active nodes list (username, IP and Port and register time)

## Server Endpoints

 ```
/register?username=<user_name>&ip=<ipaddress>&port=<port> // to register a new client on the server

/userlist //to obtain the active nodes list
```

## Setup

Clone the repo and install the dependencies.

 ```
git clone https://github.com/jngumy/Distributed-chat-NTP-HTTP-P2P.git
cd Distributed-chat-NTP-HTTP-P2P
```
and install the dependencies

 ```
npm install
```

To start the express server, run the following

 ```
node server.js 
```

and to start some clients, run the following

 ```
node cliente.js [username]
```
