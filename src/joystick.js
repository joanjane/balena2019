var env = require('./environment');

function websocketFactory() {
    return require('./ws').nodeWebSocketFactory;
}

module.exports.createJoystick = () => {
    return new Joystick(
        env.MODE === 'simulator' ?
            simulatorJoystickFactory :
            nodeSenseHatJoystickFactory
    );
};

function nodeSenseHatJoystickFactory() {
    return require('node-sense-hat').Joystick.getJoystick();
}

async function simulatorJoystickFactory() {
    const { getJoystick } = await import('pi-sense-hat-remote-simulator/client');
    const j = await getJoystick(
        websocketFactory(),
        env.SERVER_URI,
        env.DEVICE
    );
    return j;
}

class Joystick {
    constructor(joystickFactory) {
        this.joystickFactory = joystickFactory;
        this.onPressListeners = [];
        this.onHoldListeners = [];
        this.onReleaseListeners = [];
    }

    async connect() {
        this.joystick = await this.joystickFactory()
        await this.joystick.connect();
        this.joystick.on('press', (direction) => {
            this.onPressListeners.forEach(listener => listener(direction));
        });

        this.joystick.on('hold', (direction) => {
            this.onHoldListeners.forEach(listener => listener(direction));
        });

        this.joystick.on('release', (direction) => {
            this.onReleaseListeners.forEach(listener => listener(direction));
        });
           
        return this;
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

        return this;
    }
}

class JoystickSimulator {
    listen() {
        const readline = require('readline');
        readline.emitKeypressEvents(process.stdin);
        process.stdin.setRawMode && process.stdin.setRawMode(true);
        return this;
    }

    onPress(callback) {
        process.stdin.on('keypress', (str, key) => {
            let name = key.name;
            if (key.ctrl && name === 'c') {
                process.exit();
            } else if (str === '.') { // simulate click with "."
                name = 'click';
            }
            callback(name);
        });
        return this;
    }

    onHold(callback) {
        // not implemented
    }
}