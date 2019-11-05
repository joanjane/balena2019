const env = require('./environment');

function websocketFactory() {
    return require('./ws').nodeWebSocketFactory;
}

async function RemoteDisplayClientFactory() {
    const { RemoteDisplayClient } = await import('pi-sense-hat-remote-simulator/client');
    return new RemoteDisplayClient(websocketFactory(), env.SERVER_URI, env.DEVICE);
}

module.exports.createDisplay = () => {
    return new Display(
        env.MODE === 'simulator' ?
            RemoteDisplayClientFactory() :
            Promise.resolve(require('node-sense-hat').Leds)
    );
};

class Display {
    constructor(displayController) {
        this.displayController = displayController;
        this.matrix = null;
    }

    async connect() {
        this.matrix = await this.displayController;
        if (this.matrix.connect) {
            await this.matrix.connect();
        }
    }

    clear() {
        this.matrix.clear();
    }

    setPixel(x, y, color) {
        this.matrix.setPixel(x, y, color);
    }
}

class ConsoleDisplay {
    constructor() {
        this.clear();
        this.lastRender = null;
    }

    clear() {
        this.display = [
            [0, 0, 0, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0, 0, 0, 0]
        ];
        this.render();
    }

    setPixel(x, y, color) {
        // simplify colors to 1 or 0
        const value = color !== color.reduce((a, b) => a + b) > 0 ? 1 : 0;
        this.display[y][x] = this.display[y][x] + value;
        this.render();
    }

    render() {
        const textRender = this.display.map(row => {
            return row.join(' ');
        }).join('\n');
        if (textRender !== this.lastRender) {
            process.stdout.write('\n\n\n\n\n\n\n');
            console.log(textRender);
            this.lastRender = textRender;
        }
    }
}