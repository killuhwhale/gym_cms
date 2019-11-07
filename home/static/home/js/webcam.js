class Scanner {
   constructor(socket, videoElement, autoStart=false){
      this._stream = null;
      this._socket = socket;
      this._constraints = { audio: false, video: { width: 640, height: 360 } }; 
      this._mcanvas = document.createElement("canvas");
      this._scale = 1.0;
      this._videoElement = videoElement;
      this._autoStart = autoStart;
   }

   // setters and getters
   socketIsNull(){
      return (this._socket == null)? true : false; 
   }
   streamIsNull(){
      return (this._stream == null)? true : false; 
   }
   setSocket(socket){
      this._socket = socket;
   }

   // Starts camera
   getUserWebcam(){
      navigator.mediaDevices.getUserMedia(this._constraints)
      .then((stream) => {
         this._stream = stream;
         this._videoElement.srcObject = stream;
         this._videoElement.onloadedmetadata = function(e) {
               e.srcElement.play();
               // this._videoElement.play();
         };
      })
      .catch(function(err) { console.log(err.name + ": " + err.message); });
      if(this._autoStart){
         this.getImage();
      }
   }

   // gets an image from canvas
   getImage(){
      this._mcanvas.width = this._videoElement.videoWidth * this._scale;
      this._mcanvas.height = this._videoElement.videoHeight * this._scale;
      this._mcanvas.getContext('2d')
         .drawImage(this._videoElement, 0, 0, this._mcanvas.width, this._mcanvas.height);
      let message = {
         url: this._mcanvas.toDataURL()
      };
      this._socket.send(JSON.stringify(message));
      
   };
 
   // close scanner
   close(){
      this._stream.getTracks().forEach(track => { track.stop(); });
      this._stream = null;
      this._socket.close();
      this._socket = null;
   }
}
   
// helper to create socket for scanner
function createSocket(socketPath, onMessageCallback){
      let socket = null;
   if(window.location.protocol == "http:"){
      socket = new WebSocket('ws://' + window.location.host + socketPath);
   }else{
      socket = new WebSocket('wss://' + window.location.host + socketPath);
   }
   console.log("Creating socket...");
   socket.onmessage = onMessageCallback;
   return socket; 
}