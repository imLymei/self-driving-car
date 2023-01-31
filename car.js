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

		// ? Set Car's controls
		this.controls = new Controls();
	}

	// ? Update the car position
	update() {
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

		this.y -= this.speed;
	}

	// ? Draw the car
	draw(context) {
		context.beginPath();
		context.rect(this.x - this.width / 2, this.y - this.height / 2, this.width, this.height);
		context.fill();
	}
}
