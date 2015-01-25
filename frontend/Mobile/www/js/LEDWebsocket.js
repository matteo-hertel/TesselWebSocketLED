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
    this.clearID = document.getElementById('clear');
    this.sidebarError = document.getElementById('sidebarError');

    //Tessel's PIN
    this.pinPool = {
        green: "G2",
        red: "G3",
        blue: "G4",
        white: "G5"
    };

    //Server 
    this.serverIP = null;
    this.serverPort = null;

    //Connection reference
    this.connection = null;

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
            self.sidebarError.innerHTML = "The storage system used in this app is not supported, you will be able to connect to the server but the given connection details will not be persistent.";
        }
        self.restoreData();
        self.serverID.value = self.serverIP;
        self.portID.value = self.serverPort;
    };

    this.restoreData = function() {
        if (!self.localStorage) {
            return false;
        }
        var data = localStorage.getItem("serverConfiguration");

        if (!data) {
            return false;
        }
        try {
            data = JSON.parse(data);
        } catch (exc) {
            return false;
        }
        for (var i in data) {
            if (self.hasOwnProperty(i)) {
                self[i] = data[i];
            }
        }
    };

    this.createConnection = function() {
        if (!self.serverPort || !self.serverIP) {
            return false;
        }
        if (self.connection) {
            self.connection.close();
        }
        self.connection = null;
        self.status.innerHTML = "Connecting";
        self.status.className = "";
        try {
            self.connection = new WebSocket('ws://' + self.serverIP.trim() + ':' + self.serverPort.trim() + "/chat");
        } catch (exc) {
            self.status.innerHTML = "Invalid server parameters";
            return false;
        }
        self.bindConnectionEvent();
    };

    this.bindEvents = function() {
        for (var i = 0; i < self.buttons.length; i++) {
            self.buttons[i].addEventListener("click", self.handleClick);
        }
        self.openLeft.addEventListener("click", self.toggleSnap, false);
        self.serverID.addEventListener("keyup", self.changeServer, false);
        self.portID.addEventListener("keyup", self.changePort, false);
        self.saveID.addEventListener("click", self.save, false);
        self.clearID.addEventListener("click", self.clearData, false);

    };
    this.bindConnectionEvent = function() {
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
    };

    this.handleClick = function() {
        var color = this.dataset.color;
        if (!color) {
            return false;
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

    this.changeServer = function() {
        self.serverIP = this.value;
    };
    this.changePort = function() {
        self.serverPort = this.value;
    };
    this.save = function() {
        if (self.localStorage) {
            self.saveToLocalStorage();
        }
        self.status.innerHTML = "Storage saved";
        self.snap.close();
        self.createConnection();
    };
    this.saveToLocalStorage = function() {
        localStorage.setItem("serverConfiguration", JSON.stringify({
            serverIP: self.serverIP,
            serverPort: self.serverPort
        }));
    };
    this.clearData = function() {
        localStorage.removeItem("serverConfiguration");
        self.status.innerHTML = "Storage cleared";
        self.snap.close();
        self.reset();
    };
    this.reset = function() {
        self.connection.close();
        self.serverID.value = "";
        self.portID.value = "";
        self.status.className = "";
        self.status.innerHTML = "Not Connected";
    };

    this.run = function() {
        this.preprocess();
        this.createConnection();
        this.bindEvents();
    };

    this.run();
}
