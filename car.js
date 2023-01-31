class Car {
	// ? Set Car's variables
	constructor(x, y, width, height, controlType, maxSpeed = 3) {
		this.x = x;
		this.y = y;
		this.width = width;
		this.height = height;

		this.score = 0;

		this.speed = 0;
		this.acceleration = 0.1;
		this.maxSpeed = maxSpeed;
		this.friction = 0.05;
		this.angle = 0;
		this.polygon = this.#createPolygon();
		this.damage = false;
		this.counter = 0;

		this.useBrain = controlType == 'AI';

		if (controlType != 'DUMMY') {
			this.sensor = new Sensor(this);
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
			this.angle -= 0.005 * this.speed;
		} else if (this.controls.left) {
			this.angle += 0.005 * this.speed;
		}

		this.x -= Math.sin(this.angle) * this.speed;
		this.y -= Math.cos(this.angle) * this.speed;
	}

	// ? Update the car
	update(roadBorders, traffic) {
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

			this.score -= 1;
			if (this.controls.forward) {
				this.score += 2;
			}
			if (this.controls.down) {
				this.score -= 50;
			}
		}
	}

	#assessDamage(roadBorders, traffic) {
		for (let i = 0; i < roadBorders.length; i++) {
			if (polysIntersect(this.polygon, roadBorders[i])) {
				return true;
			}
		}
		for (let i = 0; i < traffic.length; i++) {
			if (polysIntersect(this.polygon, traffic[i].polygon)) {
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
