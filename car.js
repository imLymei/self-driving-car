class Car {
	// ? Set Car's variables
	constructor(x, y, width, height) {
		this.x = x;
		this.y = y;
		this.width = width;
		this.height = height;

		this.speed = 0;
		this.acceleration = 0.2;
		this.maxSpeed = 3;
		this.friction = 0.05;
		this.angle = 0;

		// ? Set Car's controls
		this.controls = new Controls();
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
			this.angle -= 0.01 * this.speed;
		} else if (this.controls.left) {
			this.angle += 0.01 * this.speed;
		}

		this.x -= Math.sin(this.angle) * this.speed;
		this.y -= Math.cos(this.angle) * this.speed;
	}

	// ? Update the car
	update() {
		this.#move();
	}

	// ? Draw the car
	draw(context) {
		context.save();

		context.translate(this.x, this.y);
		context.rotate(-this.angle);

		context.beginPath();
		context.rect(-this.width / 2, -this.height / 2, this.width, this.height);
		context.fill();

		context.restore();
	}
}
