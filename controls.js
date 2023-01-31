class Controls {
	// ? Create the controls variables
	constructor() {
		this.forward = false;
		this.left = false;
		this.right = false;
		this.down = false;

		// ? Add event listeners
		this.#addKeyboardListeners();
	}

	#addKeyboardListeners() {
		// ? When key pressed do something
		document.onkeydown = (event) => {
			switch (event.key) {
				case 'ArrowLeft':
					this.left = true;
					break;

				case 'ArrowRight':
					this.right = true;
					break;

				case 'ArrowUp':
					this.forward = true;
					break;

				case 'ArrowDown':
					this.down = true;
					break;
			}

			// ? Show variables in the console
			console.table(this);
		};
		// ? When key stop being pressed do something
		document.onkeyup = (event) => {
			switch (event.key) {
				case 'ArrowLeft':
					this.left = false;
					break;

				case 'ArrowRight':
					this.right = false;
					break;

				case 'ArrowUp':
					this.forward = false;
					break;

				case 'ArrowDown':
					this.down = false;
					break;
			}
			// ? Show variables in the console
			console.table(this);
		};
	}
}
