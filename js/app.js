const emitter = mitt();

app = Vue.createApp({
	data() {
		return {
			size: 15,
			mines: 35,
			currentMines: 0,
			fieldMatrix: Array.from(Array(this.size), () => new Array(this.size).fill(0)),
			closeCells: Math.pow(this.size, 2),
			timer: 0,
			timerLink: null,
			message: 'you win!!!',
			msFieldKey: 0,
		}
	},
	methods: {
		//if the clicked cell was empty, it will change the value of cells nearby
		makeWave(data) {
			let i = data.i, j = data.j;
			this.fieldMatrix[i][j] = -1;
			for (let row = i - 1; row < i + 2; row++) {
				for (let col = j - 1; col < j + 2; col++) {
					if (row < 0 || row >= this.size ||
						col < 0 || col >= this.size ||
						(row == i && col == j)) continue;
					if (!this.scoutMines(row, col) &&
						this.fieldMatrix[row][col] != -1) this.makeWave({ i: row, j: col });
					if (this.fieldMatrix[row][col] == 0) this.fieldMatrix[row][col] = -1;
				}
			}
		},
		//this part of code is obvious :)
		increaseMine() {
			this.currentMines++;
		},
		decreaseMine() {
			this.currentMines--;
		},
		decreaseCell() {
			this.closeCells--;
		},
		increaseCell() {
			this.closeCells++;
		},
		startTimer() {
			this.timerLink = setInterval(() => this.timer++, 1000);
		},
		finishTimer() {
			clearInterval(this.timerLink);
		},
		//return amount of mines nearby
		scoutMines(i, j) {
			let counter = 0;
			for (let row = i - 1; row <= i + 1; row++) {
				for (let col = j - 1; col <= j + 1; col++) {
					if (row < 0 || row >= this.size ||
						col < 0 || col >= this.size) continue;
					if (this.fieldMatrix[row][col] == 1) counter++;
				}
			}
			return counter;
		},
		//if the cell isn't open after changing the matrix field, it'll be opened
		showWaves() {
			for (let row = 0; row < this.size; row++) {
				for (let col = 0; col < this.size; col++) {
					let cell = document.querySelector('#i' + row + 'j' + col);
					if (cell && this.fieldMatrix[row][col] == -1 && !cell.classList.contains('cellEmpty')) {
						cell.dispatchEvent(new Event('show'));
					}
				}
			}
		},
		//check if the game is ended
		isGameEnd(answer) {
			if (answer) {
				clearInterval(this.timerLink);
				this.message = 'you lose!!!';
				this.$refs.msFooter.show(false);
			} else if (!this.closeCells) {
				clearInterval(this.timerLink);
				this.message = 'you win!!!';
				this.$refs.msFooter.show(true);
			}
			if (answer || !this.closeCells) this.$refs.msField.showAll();
		},
		//initialize restart by changing key counter from <minesweep-field>
		restart() {
			this.currentMines = this.mines;
			this.fieldMatrix = Array.from(Array(this.size), () => new Array(this.size).fill(0));
			this.closeCells = Math.pow(this.size, 2);
			this.timer = 0;
			this.msFieldKey++;
		},
		//change data from main app
		changeMode(data) {
			if (data.size == this.size || data.mines == this.mines) return;
			this.size = data.size;
			this.mines = data.mines;
		},
		shareSize() {
			return this.size;
		},
		shareMines() {
			return this.mines;
		},
	},
	computed: {
		calculateAll() {
			this.currentMines = this.mines;
			this.fieldMatrix = Array.from(Array(this.size), () => new Array(this.size).fill(0));
			this.closeCells = Math.pow(this.size, 2);
			this.timer = 0;
			this.timerLink = null;
		}
	},
	template:
		/* html */
		`
	<div>{{ calculateAll }}</div>
	<header class="header">
		<minesweep-header :size="size" ref="msHeader"></minesweep-header>
	</header>
	<main>
		<minesweep-field :size="shareSize()" :mines="shareMines()" ref="msField" :key="msFieldKey"></minesweep-field>
	</main>
	<footer>
		<minesweep-footer :message="message" ref="msFooter"></minesweep-footer>
	</footer>
	`,
	provide() {
		//shared some computing data with other components
		return {
			timer: Vue.computed(() => this.timer),
			currentMines: Vue.computed(() => this.currentMines),
			mines: Vue.computed(() => this.mines),
			closeCells: Vue.computed(() => this.closeCells),
			fieldmatrix: Vue.computed(() => this.fieldMatrix),
		}
	},
	created() {
		//set events, which do some functions when components calling the certain event (event bus)
		this.emitter.on('minus-mine', () => this.decreaseMine());
		this.emitter.on('plus-mine', () => this.increaseMine());
		this.emitter.on('start-timer', () => this.startTimer());
		this.emitter.on('finish-timer', () => this.finishTimer());
		this.emitter.on('make-wave', (data) => this.makeWave(data));
		this.emitter.on('show-waves', () => this.showWaves());
		this.emitter.on('minus-cell', () => this.decreaseCell());
		this.emitter.on('plus-cell', () => this.increaseCell());
		this.emitter.on('is-game-end', (answer) => this.isGameEnd(answer));
		this.emitter.on('restart', () => this.restart());
		this.emitter.on('changeMode', (data) => this.changeMode(data));
	},
});
app.config.globalProperties.emitter = emitter;