const initialize = () => {
	const carCanvas = document.getElementById('carCanvas');
	carCanvas.width = 200;
	const networkCanvas = document.getElementById('networkCanvas');
	networkCanvas.width = window.innerWidth / 2;

	const generationText = document.getElementById('generationText');
	const timerText = document.getElementById('timerText');
	const bestScoreText = document.getElementById('bestScoreText');
	const allTimeBestScoreText = document.getElementById('allTimeBestScoreText');
	const distanceText = document.getElementById('distanceText');

	const carContext = carCanvas.getContext('2d');
	const networkContext = networkCanvas.getContext('2d');

	const road = new Road(carCanvas.width / 2, carCanvas.width * 0.9);

	let oldTime = Date.now();
	let newTime = Date.now();
	let reloadTimer = 0;
	const maxReloadTimer = 20;
	let isRunning = true;

	let generation = { generation: 0 };
	if (localStorage.getItem('generation')) {
		const data = JSON.parse(localStorage.getItem('generation'));
		generation = data;
		generation.generation++;
	}

	generationText.innerHTML = `🧬 Generation: ${generation.generation}`;

	const cars = generateCars(1000);
	// const cars = [new Car(road.getLaneCenter(1), 100, 30, 50, 'KEYS', 30, 0.12)];

	let bestCar = cars[0];
	if (localStorage.getItem('bestBrain')) {
		for (let i = 0; i < cars.length; i++) {
			cars[i].brain = JSON.parse(localStorage.getItem('bestBrain'));
			if (i != 0) {
				NeuralNetwork.mutate(cars[i].brain, Math.random() * 0.5);
			}
		}
	}

	const dummySpeed = 20;

	const traffic = [
		new Car(road.getLaneCenter(1), -100, 30, 50, 'DUMMY', dummySpeed),
		new Car(road.getLaneCenter(1), -100, 30, 50, 'DUMMY', dummySpeed),
		new Car(road.getLaneCenter(0), -300, 30, 50, 'DUMMY', dummySpeed),
		new Car(road.getLaneCenter(2), -300, 30, 50, 'DUMMY', dummySpeed),
		new Car(road.getLaneCenter(1), -500, 30, 50, 'DUMMY', dummySpeed),
		new Car(road.getLaneCenter(0), -500, 30, 50, 'DUMMY', dummySpeed),
		new Car(road.getLaneCenter(2), -800, 30, 50, 'DUMMY', dummySpeed),
		new Car(road.getLaneCenter(1), -900, 30, 50, 'DUMMY', dummySpeed),
		new Car(road.getLaneCenter(0), -1100, 30, 50, 'DUMMY', dummySpeed),
	];

	animate();

	function save() {
		if (bestCar.score > JSON.parse(localStorage.getItem('bestScore'))) {
			localStorage.setItem('bestBrain', JSON.stringify(bestCar.brain));
			localStorage.setItem('bestScore', JSON.stringify(bestCar.score));
		}
	}

	function discard() {
		localStorage.removeItem('bestBrain');
		localStorage.removeItem('generation');
		localStorage.removeItem('bestScore');
	}

	function generateCars(N) {
		const cars = [];
		for (let i = 1; i <= N; i++) {
			cars.push(new Car(road.getLaneCenter(1), 0, 30, 50, 'AI', 30, 0.12));
		}
		return cars;
	}

	const nextGeneration = () => {
		reloadTimer = 0;
		localStorage.setItem('generation', JSON.stringify(generation));
		save();
		document.location.reload();
	};

	function animate(time) {
		oldTime = newTime;
		newTime = Date.now();
		let delta = (newTime - oldTime) / 1000;

		let allDeath = true;

		for (let i = 0; i < traffic.length; i++) {
			traffic[i].update(road.borders, [], bestCar);
		}
		for (let i = 0; i < cars.length; i++) {
			if (!cars[i].damage) {
				allDeath = false;
				cars[i].update(road.borders, traffic, bestCar);
			}
		}

		bestCar = cars.find((data) => data.score == Math.max(...cars.map((e) => e.score)));

		// console.log(bestCar.score);

		carCanvas.height = window.innerHeight;
		networkCanvas.height = window.innerHeight;
		if (networkCanvas.width != window.innerWidth / 2) {
			networkCanvas.width = window.innerWidth / 2;
		}
		// carContext.clearRect(0, 0, carCanvas.width, carCanvas.height);

		carContext.save();
		carContext.translate(0, -bestCar.y + carCanvas.height * 0.7);

		road.draw(carContext);
		for (let i = 0; i < traffic.length; i++) {
			traffic[i].draw(carContext, 'blue');
		}
		carContext.globalAlpha = 0.2;
		for (let i = 1; i < cars.length; i++) {
			cars[i].draw(carContext);
		}
		carContext.globalAlpha = 1;
		cars[0].draw(carContext, 'purple');
		bestCar.sensor.draw(carContext);
		bestCar.draw(carContext);

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

		if (reloadTimer < maxReloadTimer) {
			reloadTimer += delta;
			if (allDeath && isRunning) {
				allDeath = false;
				isRunning = false;
				nextGeneration();
			}
		} else {
			nextGeneration();
		}

		timerText.innerHTML = `⏳ Timer: ${setDecimal(maxReloadTimer - reloadTimer, 3)}`;
		bestScoreText.innerHTML = `🥇 Best score: ${setDecimal(bestCar.score, -3)}`;
		allTimeBestScoreText.innerHTML = `🏆 Best score ever: ${setDecimal(
			JSON.parse(localStorage.getItem('bestScore')),
			-3
		)}`;
		distanceText.innerHTML = `🧭 Distance: ${setDecimal(-bestCar.y / 1000, 2)}`;

		window.requestAnimationFrame(animate);
	}
};

initialize();
