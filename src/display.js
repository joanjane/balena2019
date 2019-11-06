const env = require('./environment');

function remoteDisplayClientFactory() {
    const { RemoteDisplayClient } = require('pi-sense-hat-remote-simulator/cjs/client');
    const { nodeWebSocketFactory } = require('pi-sense-hat-remote-simulator/cjs/client/node-web-socket-provider');
    const display = new RemoteDisplayClient(nodeWebSocketFactory, env.SERVER_URI, env.DEVICE);

    return display;
}


module.exports.createDisplay = () => {
    return env.MODE === 'simulator' ?
        remoteDisplayClientFactory() :
        new Display();
};

class Display {
    constructor() {
        this.senseHatLeds = null;
    }

    connect() {
        this.senseHatLeds = require('sense-hat-led');
    }

    close() {
    }

    clear() {
        this.senseHatLeds.clear();
    }
    
    showMessage(message, speed, color, done) {
        this.senseHatLeds.showMessage(message, speed, color, done);
    }

    setPixel(x, y, color) {
        this.senseHatLeds.setPixel(x, y, color);
    }
    
    render() {
        this.senseHatLeds.setPixel(x, y, color);
    }
}