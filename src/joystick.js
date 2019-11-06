var env = require('./environment');

module.exports.createJoystick = () => {
    return env.MODE === 'simulator' ?
        simulatorJoystickFactory() :
        joystickFactory();
};

function simulatorJoystickFactory() {
    const { RemoteJoystick } = require('pi-sense-hat-remote-simulator/cjs/client');
    const { nodeWebSocketFactory } = require('pi-sense-hat-remote-simulator/cjs/client/node-web-socket-provider');
    const joystick = new RemoteJoystick(nodeWebSocketFactory, env.SERVER_URI, env.DEVICE);

    return joystick;
}

function joystickFactory() {
    const { Joystick } = require('pi-sense-hat-library/cjs/joystick');
    const joystick = new Joystick();

    return joystick;
}