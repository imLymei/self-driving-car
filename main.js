const initialize = () => {
	const carCanvas = document.getElementById('carCanvas');
	carCanvas.width = 200;
	const networkCanvas = document.getElementById('networkCanvas');
	networkCanvas.width = window.innerWidth / 2;

	const generationText = document.getElementById('generationText');
	const timerText = document.getElementById('timerText');

	const carContext = carCanvas.getContext('2d');
	const networkContext = networkCanvas.getContext('2d');

	const road = new Road(carCanvas.width / 2, carCanvas.width * 0.9);
	let saveCooldown = 100;
	let oldTime = Date.now();
	let newTime = Date.now();
	let reloadTimer = 0;

	let generation = { generation: 0 };
	if (localStorage.getItem('generation')) {
		const data = JSON.parse(localStorage.getItem('generation'));
		generation = data;
		generation.generation++;
	}

	generationText.innerHTML = `Generation: ${generation.generation}`;

	const cars = generateCars(1000);
	// const cars = [new Car(road.getLaneCenter(1), 100, 30, 50, 'KEYS', 30, 0.12)];

	let bestCar = cars[0];
	if (localStorage.getItem('bestBrain')) {
		for (let i = 0; i < cars.length; i++) {
			cars[i].brain = JSON.parse(localStorage.getItem('bestBrain'));
			if (i != 0) {
				NeuralNetwork.mutate(cars[i].brain, 0.2);
			}
		}
	}

	const dummySpeed = 20;

	const traffic = [
		new Car(road.getLaneCenter(1), -100, 30, 50, 'DUMMY', dummySpeed),
		new Car(road.getLaneCenter(0), -300, 30, 50, 'DUMMY', dummySpeed),
		new Car(road.getLaneCenter(2), -300, 30, 50, 'DUMMY', dummySpeed),
		new Car(road.getLaneCenter(1), -100, 30, 50, 'DUMMY', dummySpeed),
		new Car(road.getLaneCenter(1), -500, 30, 50, 'DUMMY', dummySpeed),
		new Car(road.getLaneCenter(0), -500, 30, 50, 'DUMMY', dummySpeed),
		new Car(road.getLaneCenter(2), -800, 30, 50, 'DUMMY', dummySpeed),
		new Car(road.getLaneCenter(1), -900, 30, 50, 'DUMMY', dummySpeed),
		new Car(road.getLaneCenter(0), -1100, 30, 50, 'DUMMY', dummySpeed),
	];

	animate();

	function save() {
		localStorage.setItem('bestBrain', JSON.stringify(bestCar.brain));
	}

	function discard() {
		localStorage.removeItem('bestBrain');
		localStorage.removeItem('generation');
	}

	function generateCars(N) {
		const cars = [];
		for (let i = 1; i <= N; i++) {
			cars.push(new Car(road.getLaneCenter(1), 100, 30, 50, 'AI', 30, 0.12));
		}
		return cars;
	}

	function animate(time) {
		oldTime = newTime;
		newTime = Date.now();
		let delta = (newTime - oldTime) / 1000;

		for (let i = 0; i < traffic.length; i++) {
			traffic[i].update(road.borders, [], bestCar);
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
		// carContext.clearRect(0, 0, carCanvas.width, carCanvas.height);

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

		document.onkeydown = (event) => {
			if (event.key == 'r') {
				document.location.reload();
			} else if (event.key == 'R') {
				discard();
				document.location.reload();
			}
		};

		if (reloadTimer < 10) {
			reloadTimer += delta;
		} else {
			reloadTimer = 0;
			localStorage.setItem('generation', JSON.stringify(generation));
			document.location.reload();
		}

		timerText.innerHTML = `Timer: ${setDecimal(10 - reloadTimer, 3)}`;

		window.requestAnimationFrame(animate);
	}
};

initialize();
