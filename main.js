const initialize = () => {
	const carCanvas = document.getElementById('carCanvas');
	carCanvas.width = 200;
	const networkCanvas = document.getElementById('networkCanvas');
	networkCanvas.width = window.innerWidth / 2;
	const graphCanvas = document.getElementById('graphCanvas');
	graphCanvas.width = window.innerWidth * 0.15;
	graphCanvas.height = window.innerWidth * 0.15;

	const generationText = document.getElementById('generationText');
	const timerText = document.getElementById('timerText');
	const bestScoreText = document.getElementById('bestScoreText');
	const allTimeBestScoreText = document.getElementById('allTimeBestScoreText');
	const distanceText = document.getElementById('distanceText');

	const amountCars = document.getElementById('amountCars');
	amountCars.value = getAmountCars();
	const carsText = document.getElementById('carsText');

	const amountSensors = document.getElementById('amountSensors');
	amountSensors.value = getAmountSensors();
	const sensorsText = document.getElementById('sensorsText');

	const rangeSensors = document.getElementById('rangeSensors');
	rangeSensors.value = getRangeSensors();
	const rangeSensorsText = document.getElementById('rangeSensorsText');

	const amountMutation = document.getElementById('amountMutation');
	amountMutation.value = getAmountMutation();
	const mutationText = document.getElementById('mutationText');

	const carContext = carCanvas.getContext('2d');
	const networkContext = networkCanvas.getContext('2d');
	const graphContext = graphCanvas.getContext('2d');

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

	let bestScoreArray = getBestScoreArray();
	console.log(bestScoreArray);

	Graph.draw(graphContext, bestScoreArray);

	generationText.innerHTML = `📆 Generation: ${generation.generation}`;

	const cars = generateCars(getAmountCars());
	// const cars = [new Car(road.getLaneCenter(1), 100, 30, 50, 'KEYS', 30, 0.12)];

	let bestCar = cars[0];
	if (localStorage.getItem('bestBrain')) {
		for (let i = 0; i < cars.length; i++) {
			cars[i].brain = JSON.parse(localStorage.getItem('bestBrain'));
			if (i != 0) {
				NeuralNetwork.mutate(cars[i].brain, Math.random() * (amountMutation.value / 100) + 0.05);
			}
		}
	}

	const dummySpeed = 20;

	const traffic = [
		new Car(road.getLaneCenter(1), -100, 30, 50, 'DUMMY', 0, 0, dummySpeed),
		new Car(road.getLaneCenter(0), -200, 30, 50, 'DUMMY', 0, 0, dummySpeed),

		new Car(road.getLaneCenter(1), -400, 30, 50, 'DUMMY', 0, 0, dummySpeed),
		new Car(road.getLaneCenter(2), -600, 30, 50, 'DUMMY', 0, 0, dummySpeed),
		new Car(road.getLaneCenter(0), -600, 30, 50, 'DUMMY', 0, 0, dummySpeed),
		new Car(road.getLaneCenter(0), -800, 30, 50, 'DUMMY', 0, 0, dummySpeed),

		new Car(road.getLaneCenter(2), -800, 30, 50, 'DUMMY', 0, 0, dummySpeed),

		new Car(road.getLaneCenter(1), -1000, 30, 50, 'DUMMY', 0, 0, dummySpeed),

		new Car(road.getLaneCenter(0), -1100, 30, 50, 'DUMMY', 0, 0, dummySpeed),
	];

	animate();

	function getAmountCars() {
		if (localStorage.getItem('amountCars')) {
			return JSON.parse(localStorage.getItem('amountCars'));
		}
		return 1000;
	}

	function getAmountSensors() {
		if (localStorage.getItem('amountSensors')) {
			return JSON.parse(localStorage.getItem('amountSensors'));
		}
		return 20;
	}

	function getRangeSensors() {
		if (localStorage.getItem('rangeSensors')) {
			return JSON.parse(localStorage.getItem('rangeSensors'));
		}
		return 50;
	}

	function getAmountMutation() {
		if (localStorage.getItem('amountMutation')) {
			return JSON.parse(localStorage.getItem('amountMutation'));
		}
		return 50;
	}

	function getBestScoreArray() {
		let array = [0];

		if (localStorage.getItem('bestScoreArray')) {
			array = [...JSON.parse(localStorage.getItem('bestScoreArray'))];
		}
		return array;
	}

	function save() {
		localStorage.setItem('bestBrain', JSON.stringify(bestCar.brain));
		localStorage.setItem('bestScore', JSON.stringify(bestCar.score));
		localStorage.setItem('amountCars', JSON.stringify(amountCars.value));
		localStorage.setItem('amountSensors', JSON.stringify(amountSensors.value));
		localStorage.setItem('rangeSensors', JSON.stringify(rangeSensors.value));
		localStorage.setItem('amountMutation', JSON.stringify(amountMutation.value));
		if (bestScoreArray.length === 10) {
			bestScoreArray.shift();
			bestScoreArray.push(bestCar.score);
		} else {
			bestScoreArray.push(bestCar.score);
		}
		localStorage.setItem('bestScoreArray', JSON.stringify(bestScoreArray));
	}

	function discard() {
		localStorage.removeItem('bestBrain');
		localStorage.removeItem('generation');
		localStorage.removeItem('bestScore');
		localStorage.removeItem('amountCars');
		localStorage.removeItem('amountSensors');
		localStorage.removeItem('rangeSensors');
		localStorage.removeItem('amountMutation');
		localStorage.removeItem('bestScoreArray');
	}

	function generateCars(N) {
		const cars = [];
		for (let i = 1; i <= N; i++) {
			cars.push(
				new Car(road.getLaneCenter(1), 0, 30, 50, 'AI', getAmountSensors(), getRangeSensors() * 3.6, 30, 0.12)
			);
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
				localStorage.setItem('amountCars', JSON.stringify(amountCars.value));
				localStorage.setItem('amountSensors', JSON.stringify(amountSensors.value));
				localStorage.setItem('rangeSensors', JSON.stringify(rangeSensors.value));
				localStorage.setItem('amountMutation', JSON.stringify(amountMutation.value));
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
		allTimeBestScoreText.innerHTML = `🏆 Last best score: ${setDecimal(
			JSON.parse(localStorage.getItem('bestScore')),
			-3
		)}`;
		distanceText.innerHTML = `🧭 Distance: ${setDecimal(-bestCar.y / 1000, 2)}`;
		carsText.innerHTML = `${amountCars.value} / 10000`;
		sensorsText.innerHTML = `${amountSensors.value} / 100`;
		rangeSensorsText.innerHTML = `${rangeSensors.value * 3.6}º / 360º`;
		mutationText.innerHTML = `${amountMutation.value}% / 100%`;

		window.requestAnimationFrame(animate);
	}
};

initialize();
