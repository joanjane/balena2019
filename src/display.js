const env = require('./environment');

function remoteDisplayClientFactory() {
    const { RemoteDisplayClient } = require('pi-sense-hat-remote-simulator/cjs/client');
    const { nodeWebSocketFactory } = require('pi-sense-hat-remote-simulator/cjs/client/node-web-socket-provider');
    const display = new RemoteDisplayClient(nodeWebSocketFactory, env.SERVER_URI, env.DEVICE);

    return display;
}

function displayFactory() {
    const { Display } = require('pi-sense-hat-library/cjs/display');
    const display = new Display();

    return display;
}

module.exports.createDisplay = () => {
    return env.MODE === 'simulator' ?
        remoteDisplayClientFactory() :
        displayFactory();
};
