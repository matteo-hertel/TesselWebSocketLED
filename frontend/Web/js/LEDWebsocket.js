function LEDWebsocket() {
    var self = this;
    //Dom Elements
    this.status = document.getElementById("status");
    this.buttons = document.getElementsByClassName("button");
    this.content = document.getElementById('content');
    this.openLeft = document.getElementById('open-left');
    this.serverID = document.getElementById('server');
    this.portID = document.getElementById('port');
    this.saveID = document.getElementById('save');
    this.clearID = document.getElementById('save');
    this.sidebarError = document.getElementById('sidebarError');

    //Tessel's PIN
    this.pinPool = {
        green: "G2",
        red: "G3",
        blue: "G4",
        white: "G5"
    };

    //Server 
    this.serverIP = "178.62.97.176";
    this.serverPort = 8080;

    //Connection reference
    this.connection = null;
    this.connectionStatus = 0;

    //Snap.js reference
    this.snap = null;

    //Connection flag
    this.connectionError = false;

    //localStorage support
    this.localStorage = false;

    this.preprocess = function() {
        self.snap = new Snap({
            element: self.content,
            disable: "right",
            hyperextensible: false
        });
        try {
            self.localStorage = 'localStorage' in window && window.localStorage !== null;
        } catch (e) {
            self.localStorage = false;
        }
    };

    this.createConnection = function() {
        self.status.innerHTML = "Connecting";
        self.status.className = "";
        self.connection = new WebSocket('ws://' + self.serverIP + ':' + self.serverPort + "/chat");

    };

    this.bindEvents = function() {
        self.connection.onclose = function() {
            if (self.connectionError) {
                self.status.innerHTML = "Server not available";
            } else {
                self.status.innerHTML = "Connection closed";
            }
        };
        self.connection.onopen = function() {
            self.status.innerHTML = "Connected";
            self.status.className = "success";
        };
        self.connection.onerror = function() {
            self.connectionError = true;
            self.status.innerHTML = "Server not available";
            self.status.className = "error";
        };
        for (var i = 0; i < self.buttons.length; i++) {
            self.buttons[i].addEventListener("click", self.handleClick);
        }
        self.openLeft.addEventListener("click", self.toggleSnap, false);
        self.serverID.addEventListener("keyup", self.changeServer, false);
        self.portID.addEventListener("keyup", self.changePort, false);
        self.saveID.addEventListener("click", self.save, false);
        self.clearID.addEventListener("click", self.clear, false);

    };

    this.handleClick = function() {
        var color = this.dataset.color;
        if (!color) {
            return;
        }

        if (self.pinPool.hasOwnProperty(color)) {
            self.connection.send(self.pinPool[color]);
        }
    };

    this.toggleSnap = function() {
        var data = self.snap.state();

        if (data.state === "closed") {
            self.snap.open('left');
        } else {
            self.snap.close('left');
        }
    };

    this.changeServer = function() {};
    this.changePort = function() {};
    this.save = function() {};
    this.clear = function() {};


    this.run = function() {
        this.preprocess();
        this.createConnection();
        this.bindEvents();
    };

    this.run();
}
