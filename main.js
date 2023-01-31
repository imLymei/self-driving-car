const initialize = () => {
	const carCanvas = document.getElementById('carCanvas');
	carCanvas.width = 200;
	const networkCanvas = document.getElementById('networkCanvas');
	networkCanvas.width = window.innerWidth / 2;

	const carContext = carCanvas.getContext('2d');
	const networkContext = networkCanvas.getContext('2d');

	const road = new Road(carCanvas.width / 2, carCanvas.width * 0.9);
	let saveCooldown = 100;
	let sameBrain = 0;
	let maxSameBrain = 100;

	const cars = generateCars(1000);

	let bestCar = cars[0];
	if (localStorage.getItem('bestBrain')) {
		for (let i = 0; i < cars.length; i++) {
			cars[i].brain = JSON.parse(localStorage.getItem('bestBrain'));
			if (i != 0) {
				NeuralNetwork.mutate(cars[i].brain, 0.126549);
			}
		}
	}

	const traffic = [
		new Car(road.getLaneCenter(1), -100, 30, 50, 'DUMMY', 2),
		new Car(road.getLaneCenter(0), -300, 30, 50, 'DUMMY', 2),
		new Car(road.getLaneCenter(2), -300, 30, 50, 'DUMMY', 2),
		new Car(road.getLaneCenter(1), -100, 30, 50, 'DUMMY', 2),
		new Car(road.getLaneCenter(1), -500, 30, 50, 'DUMMY', 2),
		new Car(road.getLaneCenter(0), -500, 30, 50, 'DUMMY', 2),
		new Car(road.getLaneCenter(2), -800, 30, 50, 'DUMMY', 2),
		new Car(road.getLaneCenter(1), -900, 30, 50, 'DUMMY', 2),
		new Car(road.getLaneCenter(0), -1000, 30, 50, 'DUMMY', 2),
	];

	animate();

	function save() {
		let oldBrain = localStorage.getItem('bestBrain');
		localStorage.setItem('bestBrain', JSON.stringify(bestCar.brain));
		let newBrain = localStorage.getItem('bestBrain');
		if (oldBrain == newBrain) {
			if (sameBrain < maxSameBrain) {
				sameBrain++;
			} else initialize();
		}
	}

	function discard() {
		localStorage.removeItem('bestBrain');
	}

	function generateCars(N) {
		const cars = [];
		for (let i = 1; i <= N; i++) {
			cars.push(new Car(road.getLaneCenter(1), 100, 30, 50, 'AI', 3));
		}
		return cars;
	}

	function animate(time) {
		for (let i = 0; i < traffic.length; i++) {
			traffic[i].update(road.borders, []);
		}
		for (let i = 0; i < cars.length; i++) {
			cars[i].update(road.borders, traffic);
		}

		bestCar = cars.find((data) => data.score == Math.max(...cars.map((e) => e.score)));
		if (saveCooldown > 0) {
			saveCooldown--;
		} else {
			save();
		}
		// console.log(bestCar.score);

		carCanvas.height = window.innerHeight;
		networkCanvas.height = window.innerHeight;

		carContext.save();
		carContext.translate(0, -bestCar.y + carCanvas.height * 0.7);

		road.draw(carContext);
		for (let i = 0; i < traffic.length; i++) {
			traffic[i].draw(carContext, 'blue');
		}
		carContext.globalAlpha = 0.2;
		for (let i = 0; i < cars.length; i++) {
			cars[i].draw(carContext);
		}
		carContext.globalAlpha = 1;
		bestCar.draw(carContext);
		bestCar.sensor.draw(carContext);

		carContext.restore();

		networkContext.lineDashOffset = -time / 50;
		Visualizer.drawNetwork(networkContext, bestCar.brain);
		requestAnimationFrame(animate);
	}
};

initialize();
