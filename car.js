class Car {
	// ? Set Car's variables
	constructor(x, y, width, height, controlType, sensorAmount, sensorRange, maxSpeed = 3, acceleration = 0.1) {
		this.x = x;
		this.y = y;
		this.width = width;
		this.height = height;

		this.score = 0;

		this.timeClosePoints = 0;

		this.speed = 0;
		this.acceleration = acceleration;
		this.maxSpeed = maxSpeed;
		this.friction = 0.05;
		this.angle = 0;
		this.polygon = this.#createPolygon();
		this.damage = false;
		this.counter = 0;
		this.controlType = controlType;

		this.useBrain = controlType == 'AI';

		if (controlType != 'DUMMY') {
			this.sensor = new Sensor(this, sensorAmount, sensorRange);
			this.brain = new NeuralNetwork([this.sensor.rayCount, 6, 4]);
		}

		// ? Set Car's controls
		this.controls = new Controls(controlType);
	}

	// ? Update the car position and angle
	#move() {
		// ? Check if it's going forward
		if (this.controls.forward) {
			// ? Add acceleration to speed
			this.speed += this.acceleration;
			// ? Check if it's going backward
		} else if (this.controls.down) {
			// ? Subtract acceleration from speed
			this.speed -= this.acceleration;
		}

		// ? Max speed going forward
		if (this.speed > this.maxSpeed) {
			this.speed = this.maxSpeed;
			// ? Max speed going backward
		} else if (this.speed < -this.maxSpeed / 2) {
			this.speed = -this.maxSpeed / 2;
		}

		// ? Add friction
		if (this.speed > 0) {
			this.speed -= this.friction;
		} else if (this.speed < 0) {
			this.speed += this.friction;
		}
		if (Math.abs(this.speed) < this.friction) {
			this.speed = 0;
		}

		if (this.controls.right) {
			this.angle -= 0.005 / ((this.speed != 0 ? this.speed : 1000) * 0.05);
		} else if (this.controls.left) {
			this.angle += 0.005 / ((this.speed != 0 ? this.speed : 1000) * 0.05);
		}

		this.x -= Math.sin(this.angle) * this.speed;
		this.y -= Math.cos(this.angle) * this.speed;
	}

	// ? Update the car
	update(roadBorders, traffic, bestCar) {
		if (!this.damage) {
			this.#move();
			this.polygon = this.#createPolygon();
			this.damage = this.#assessDamage(roadBorders, traffic);
			if (this.sensor) {
				this.sensor.update(roadBorders, traffic);
				const offset = this.sensor.readings.map((s) => (s == null ? 0 : 1 - s.offset));
				const outputs = NeuralNetwork.feedForward(offset, this.brain);

				if (this.useBrain) {
					this.controls.forward = outputs[0];
					this.controls.left = outputs[1];
					this.controls.right = outputs[2];
					this.controls.down = outputs[3];
				}
			}

			if (this.controlType == 'DUMMY') {
				if (bestCar.y - this.y < -window.innerHeight * 0.3) {
					this.y -= 1000 + lerp(0, Math.random() * 300, 0.3);
				}
			}

			for (let i = 0; i < traffic.length; i++) {
				if (Math.abs(this.y - traffic[i].y) < 150) {
					if (Math.abs(this.x - traffic[i].x) < 150) {
						const verticalDistance = Math.abs(this.y - traffic[i].y);
						const horizontalDistance = Math.abs(this.x - traffic[i].x);

						this.score += 1000 / (pitagoras(verticalDistance, horizontalDistance) + this.timeClosePoints);
						this.timeClosePoints += 5;
					} else if (this.timeClosePoints > 0) {
						this.timeClosePoints--;
					}
				} else if (this.y - traffic[i].y < -200 && this.y - traffic[i].y > -200 - this.speed * 1.1) {
					this.score += 5000;
				}
			}

			this.score += 10 * -Math.sign(this.y) * this.speed - 40;

			if (bestCar.y - this.y < -window.innerHeight * 0.3) {
				this.damage = true;
			}
		}
	}

	#assessDamage(roadBorders, traffic) {
		for (let i = 0; i < roadBorders.length; i++) {
			if (polysIntersect(this.polygon, roadBorders[i])) {
				this.score *= 0.5;
				return true;
			}
		}
		for (let i = 0; i < traffic.length; i++) {
			if (polysIntersect(this.polygon, traffic[i].polygon)) {
				this.score *= 0.5;
				return true;
			}
		}
		return false;
	}

	#createPolygon() {
		const points = [];
		const rad = Math.hypot(this.width, this.height) / 2;
		const alpha = Math.atan2(this.width, this.height);
		points.push({
			x: this.x - Math.sin(this.angle - alpha) * rad,
			y: this.y - Math.cos(this.angle - alpha) * rad,
		});
		points.push({
			x: this.x - Math.sin(this.angle + alpha) * rad,
			y: this.y - Math.cos(this.angle + alpha) * rad,
		});
		points.push({
			x: this.x - Math.sin(Math.PI + this.angle - alpha) * rad,
			y: this.y - Math.cos(Math.PI + this.angle - alpha) * rad,
		});
		points.push({
			x: this.x - Math.sin(Math.PI + this.angle + alpha) * rad,
			y: this.y - Math.cos(Math.PI + this.angle + alpha) * rad,
		});

		return points;
	}

	// ? Draw the car
	draw(context, color = 'red') {
		if (this.counter < 20) {
			if (this.damage) {
				context.fillStyle = 'gray';
				this.counter++;
				this.sensor.isOn = false;
			} else {
				context.fillStyle = color;
			}
			context.beginPath();
			context.moveTo(this.polygon[0].x, this.polygon[0].y);
			for (let i = 1; i < this.polygon.length; i++) {
				context.lineTo(this.polygon[i].x, this.polygon[i].y);
			}
			context.fill();
		}
	}
}
