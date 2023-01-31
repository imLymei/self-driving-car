class Controls {
	// ? Create the controls variables
	constructor(type) {
		this.forward = false;
		this.left = false;
		this.right = false;
		this.down = false;

		switch (type) {
			case 'KEYS':
				this.#addKeyboardListeners();
				break;
			case 'DUMMY':
				this.forward = true;
		}
		// ? Add event listeners
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
		};
	}
}
