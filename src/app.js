const { createJoystick } = require('./joystick');
const { createDisplay } = require('./display');
const env = require('./environment');
const Client = require('./client');
const { ballExitAction, actionTypes } = require('./actions');

module.exports = class App {
	constructor() {
		this.device = env.DEVICE;
		this.display = createDisplay();
		this.displayMatrix = emptyDisplay();
		this.joystick = createJoystick();
		this.config = {
			xmax: 8,
			ymax: 8,
			color: env.BALL_COLOR
		};
	}

	start() {
		this.reset();

		this.client = new Client(env.SERVER_URI)
			.connect()
			.onOpen(() => {
				console.log('Connected');
				this.display.connect(() => {
					this.render();
				});
				this.listenJoystick();
			})
			.onMessage((message) => {
				console.log('Received message\n', message);
				this.messageReceived(message);
			});
	}

	stop() {
		this.display.close();
		this.joystick.close();
	}

	reset() {
		this.balls = [
			{
				color: this.config.color,
				x: env.BALL_X,
				y: env.BALL_Y
			}
		];
		this.displayMatrix = emptyDisplay();
	}

	render() {
		this.displayMatrix = emptyDisplay();

		this.balls.forEach((ball) => {
			this.displayMatrix[ball.y * this.config.xmax + ball.x] = ball.color;
		});

		setTimeout(() => 
			this.display.setPixels(this.displayMatrix)
		);
	}

	listenJoystick() {
		this.joystick.connect();
		this.joystick.on('press', (direction) => {
			console.log('The joystick was pressed ' + direction);
			this.processMovement(direction);
		});

		this.joystick.on('hold', (direction) => {
			console.log('The joystick is being held ' + direction);
			this.processMovement(direction);
		});
	}

	messageReceived(message) {
		if (message.type !== actionTypes.BALL_EXIT ||
			message.destination !== this.device) {
			console.log('Discarded message', JSON.stringify(message));
			return;
		}

		switch (message.origin) {
			case 'N':
				this.receiveFromNorth(message.ball)
				break;
			case 'S':
				this.receiveFromSouth(message.ball)
				break;
			case 'E':
				this.receiveFromEast(message.ball)
				break;
			case 'W':
				this.receiveFromWest(message.ball)
				break;
		}
		this.render();
	}

	sendNorth(ball) {
		this.client.send(ballExitAction('N', ball));
	}

	sendSouth(ball) {
		this.client.send(ballExitAction('S', ball));
	}

	sendEast(ball) {
		this.client.send(ballExitAction('E', ball));
	}

	sendWest(ball) {
		this.client.send(ballExitAction('W', ball));
	}

	eastExit(ball) {
		return ball.x < 0;
	}

	westExit(ball) {
		return ball.x > this.config.xmax - 1;
	}

	northExit(ball) {
		return ball.y < 0;
	}

	southExit(ball) {
		return ball.y > this.config.ymax - 1;
	}

	receiveFromNorth(ball) {
		switch (this.device) {
			case 'S':
				if (this.northExit(ball))
					ball.y = 0;
				else
					ball.y = 7;
				break;
			case 'E':
				ball.x = 0;
				break;
			case 'W':
				ball.x = 7;
				break;
		}
		this.balls.push(ball);
	}

	receiveFromSouth(ball) {
		switch (this.device) {
			case 'N':
				if (this.northExit(ball))
					ball.y = 0
				else
					ball.y = 7;
				break;
			case 'E':
				ball.x = 7;
				break;
			case 'W':
				ball.x = 0;
				break;
		}
		this.balls.push(ball);
	}

	receiveFromEast(ball) {
		switch (this.device) {
			case 'N':
				ball.x = 7;
				break;
			case 'S':
				ball.x = 0;
				break;
			case 'W':
				if (this.northExit(ball))
					ball.y = 0;
				else
					ball.y = 7;
				break;
		}
		this.balls.push(ball);
	}

	receiveFromWest(ball) {
		switch (this.device) {
			case 'N':
				ball.x = 0;
				break;
			case 'S':
				ball.x = 7;
				break;
			case 'E':
				if (this.northExit(ball))
					ball.y = 0;
				else
					ball.y = 7;
				break;
		}
		this.balls.push(ball);
	}

	processMovement(direction) {
		if (direction === 'click') {
			this.reset();
			this.render();
			return;
		}

		var vector = this.directionToVector(direction);
		if (!vector) return;

		var newBalls = [];

		this.balls.forEach((ball) => {
			ball.x += vector.x;
			ball.y += vector.y;

			if (this.southExit(ball)) {
				switch (this.device) {
					case 'N':
						this.sendSouth(ball);
						break;
					case 'S':
						this.sendNorth(ball);
						break;
					case 'E':
						this.sendWest(ball);
						break;
					case 'W':
						this.sendEast(ball);
						break;
				}
			} else if (this.northExit(ball)) {
				switch (this.device) {
					case 'N':
						this.sendSouth(ball);
						break;
					case 'S':
						this.sendNorth(ball);
						break;
					case 'E':
						this.sendWest(ball);
						break;
					case 'W':
						this.sendEast(ball);
						break;
				}
			} else if (this.westExit(ball)) {
				switch (this.device) {
					case 'N':
						this.sendEast(ball);
						break;
					case 'S':
						this.sendWest(ball);
						break;
					case 'E':
						this.sendSouth(ball);
						break;
					case 'W':
						this.sendNorth(ball);
						break;
				}
			} else if (this.eastExit(ball)) {
				switch (this.device) {
					case 'N':
						this.sendWest(ball);
						break;
					case 'S':
						this.sendEast(ball);
						break;
					case 'E':
						this.sendNorth(ball);
						break;
					case 'W':
						this.sendSouth(ball);
						break;
				}
			} else {
				newBalls.push(ball);
			}
		});
		this.balls = newBalls;
		this.render();
	}

	directionToVector(direction) {
		switch (direction) {
			case 'up':
				return { x: 0, y: -1 };
			case 'down':
				return { x: 0, y: 1 };
			case 'left':
				return { x: -1, y: 0 };
			case 'right':
				return { x: 1, y: 0 };
		}
	}
}

const O = '#000000';
const emptyDisplay = () => [
  O, O, O, O, O, O, O, O,
  O, O, O, O, O, O, O, O,
  O, O, O, O, O, O, O, O,
  O, O, O, O, O, O, O, O,
  O, O, O, O, O, O, O, O,
  O, O, O, O, O, O, O, O,
  O, O, O, O, O, O, O, O,
  O, O, O, O, O, O, O, O
];
