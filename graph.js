class Graph {
	static draw(context, bestScore) {
		const bestOfLastTen = document.getElementById('bestOfLastTen');

		this.size = window.innerWidth * 0.15;

		this.top = 10;
		this.left = 10;
		this.right = this.size - 10;
		this.bottom = this.size - 10;

		this.bestScore = bestScore.find((value) => value == Math.max(...bestScore));

		context.beginPath();
		context.moveTo(this.left, this.top);
		context.lineTo(this.left, this.bottom);
		context.lineTo(this.right, this.bottom);
		context.strokeStyle = 'white';
		context.fillStyle = 'white';
		context.stroke();

		for (let i = 0; i < bestScore.length; i++) {
			const actualY = Math.max(this.bottom - this.bottom * (bestScore[i] / this.bestScore), 10);
			const nextY = Math.max(this.bottom - this.bottom * (bestScore[i + 1] / this.bestScore), 10);
			const actualX = this.left + this.size * (i / bestScore.length);
			const nextX = this.left + this.size * ((i + 1) / bestScore.length);

			context.beginPath();
			context.arc(actualX, actualY, this.size * 0.01, 0, Math.PI * 2, true);
			context.stroke();
			context.fill();
			if (i < bestScore.length - 1) {
				context.beginPath();
				context.moveTo(actualX, actualY);
				context.lineTo(nextX, nextY);
				if (bestScore[i] > bestScore[i + 1]) {
					context.strokeStyle = '#e35353';
					context.fillStyle = '#e35353';
				} else {
					context.strokeStyle = 'white';
					context.fillStyle = 'white';
				}
				context.stroke();
			}
		}

		bestOfLastTen.innerHTML = `Best score of last 10: ${setDecimal(this.bestScore, -3)}`;
	}
}
