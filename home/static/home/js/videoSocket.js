function createSocket(websocketPath, socketCallback){
    let videoSocket = ""; 
    if(window.location.protocol == "http:"){
      videoSocket = new WebSocket('ws://' + window.location.host + websocketPath);
    }else{
      videoSocket = new WebSocket('wss://' + window.location.host + websocketPath);
    }
    socketCallback(videoSocket);
}

function closeSocket(socket){
    socket.close()
}