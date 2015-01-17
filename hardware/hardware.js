function LEDWebsocket() {
    var self = this;
    this.tessel = require('tessel');
    this.webSocket = require('nodejs-websocket');
    this.pinPool = ["G2","G3", "G4","G5"];
    this.currentPin = "G4";
    this.serverIP = "178.62.97.176";
    this.serverPort = 8080;
    this.connection = null;

    this.bindEvents = function() {
        process.stdin.on('readable', function() {
            var input = String(process.stdin.read()).replace(/(\r\n|\n|\r)/gm, "");
            self.processData(input);
        });
    };

    this.processData = function(input) {
        if (self.pinPool.indexOf(input) !== -1) {
            if (self.currentPin === input) {
                self.connection.sendText("The requested pin is already on");
                return false;
            }
            self.turnOffCurrentPin().currentPin = input;
            self.process();
        } else {
            self.connection.sendText("The requested does not exists");
        }
    };

    this.turnOffCurrentPin = function() {
        console.log("Turning off pin " + self.currentPin);
        self.tessel.port.GPIO.pin[self.currentPin].write(false);
        return self;
    };

    this.process = function() {
        console.log("turing on pin " + self.currentPin);
        self.tessel.port.GPIO.pin[self.currentPin].write(true);

    };
    this.preprocess = function() {
        this.webSocket.setBinaryFragmentation(1);
    };
    this.createConnection = function() {
    	try{
        self.connection = self.webSocket.connect('ws://' + self.serverIP + ':' + self.serverPort + "/chat", function() {
            self.connection.on("text", function(data) {
                self.processData(data);
            });
        });
    }catch(exc){
    	console.log("connection failed", exc);
    }
    };
    this.run = function() {
        this.preprocess();
        this.createConnection();
        this.bindEvents();
        this.process();
    };
}
var wifi = require('wifi-cc3000');
wifi.on('connect', function(data){
  // you're connected
  new LEDWebsocket().run();
});
process.ref();
