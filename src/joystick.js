var env = require('./environment');

module.exports.createJoystick = () => {
    return env.MODE === 'simulator' ?
        simulatorJoystickFactory() :
        new Joystick();
};

function simulatorJoystickFactory() {
    const { RemoteJoystick } = require('pi-sense-hat-remote-simulator/cjs/client');
    const { nodeWebSocketFactory } = require('pi-sense-hat-remote-simulator/cjs/client/node-web-socket-provider');
    const joystick = new RemoteJoystick(nodeWebSocketFactory, env.SERVER_URI, env.DEVICE);

    return joystick;
}

class Joystick {
    connect() {
        require('node-sense-hat').Joystick.getJoystick().then(joystick => {
            this.joystick = joystick;

            this.joystick.on('press', (direction) => {
                this.onPressListeners.forEach(listener => listener(direction));
            });

            this.joystick.on('hold', (direction) => {
                this.onHoldListeners.forEach(listener => listener(direction));
            });

            this.joystick.on('release', (direction) => {
                this.onReleaseListeners.forEach(listener => listener(direction));
            });
        })
    }

    close() {
        if (this.joystick) {
            this.onPressListeners.forEach(listener => this.joystick.off('press', listener));
            this.onHoldListeners.forEach(listener => this.joystick.off('hold', listener));
            this.onReleaseListeners.forEach(listener => this.joystick.off('release', listener));
            this.onPressListeners = [];
            this.onHoldListeners = [];
            this.onReleaseListeners = [];
        }

    }

    on(event, callback) {
        switch (event) {
            case 'press':
                this.onPressListeners.push(callback);
                break;
            case 'hold':
                this.onHoldListeners.push(callback);
                break;
            case 'release':
                this.onReleaseListeners.push(callback);
                break;
            default:
                throw new Error(`${event} event is not valid. Try with press, hold and release.`);
        }
    }
}