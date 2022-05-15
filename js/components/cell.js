app.component('cell', {
	template:
		/* html */
		`
		<td :class="getClasses" 
		:id="'i' + row + 'j' + cell" :style="styles" @check="checkCell" @set-flag.prevent="setFlag"
		@show="showYourself" @open-if-needed="openMine">{{ value }}</td>
	`,
	props: {
		styles: {
			type: Object,
			required: true,
		},
		row: {
			type: Number,
			required: true,
		},
		cell: {
			type: Number,
			required: true,
		},
		width: {
			type: String,
			required: true,
		},
		size: {
			type: Number,
			required: true,
		}
	},
	data() {
		return {
			classes: ['cellNeutral'],
			value: '',
		}
	},
	methods: {
		//check if cell is empty, with mines around or mine itself
		checkCell() {
			let i = this.row, j = this.cell;
			if (i < 0 || i >= this.size || j < 0 || j >= this.size ||
				this.fieldmatrix.value[i][j] == -1 ||
				this.classes.indexOf('cellNeutralWithFlag') != -1) return;

			let num = this.scoutMines(i, j);
			this.removeClasses('cellNeutral');
			if (this.fieldmatrix.value[i][j] == 0) {
				if (!num) {
					this.emitter.emit('make-wave', { i: i, j: j });
					this.emitter.emit('show-waves');
				} else {
					this.fieldmatrix.value[i][j] = -1;
					this.showYourself();
				}
			} else {
				this.addClasses('cellMineClick');
				this.emitter.emit('is-game-end', true);
			}
		},
		//return amount of mines nearby
		scoutMines(i, j) {
			let counter = 0;
			for (let row = i - 1; row <= i + 1; row++) {
				for (let col = j - 1; col <= j + 1; col++) {
					if (row < 0 || row >= this.size ||
						col < 0 || col >= this.size) continue;
					if (this.fieldmatrix.value[row][col] == 1) counter++;
				}
			}
			return counter;
		},
		addClasses(...list) {
			list.forEach(elem => (~~this.classes.indexOf(elem)) ? this.classes.push(elem) : elem);
			return this.classes.join(' ');
		},
		removeClasses(...list) {
			list.forEach(elem => {
				let index = this.classes.indexOf(elem);
				if (index != -1) this.classes.splice(index, 1);
			});
			return this.classes.join(' ');
		},
		//reveal clearly cell without mine
		showYourself() {
			this.removeClasses('cellNeutral');
			let i = this.row, j = this.cell;
			let num = this.scoutMines(i, j);
			if (num) {
				this.addClasses('n' + num);
				this.value = String(num);
			}
			this.addClasses('cellEmpty');
			this.emitter.emit('minus-cell');
			this.emitter.emit('is-game-end', false);
		},
		//set or remove flag from cell
		setFlag() {
			if (this.fieldmatrix.value[this.row][this.cell] == -1) return;

			if (this.classes.indexOf('cellNeutralWithFlag') == -1) {
				this.removeClasses('cellNeutral');
				this.addClasses('cellNeutralWithFlag');
				this.emitter.emit('minus-mine');
				this.emitter.emit('minus-cell');
				this.emitter.emit('is-game-end', false);
			} else {
				this.removeClasses('cellNeutralWithFlag');
				this.addClasses('cellNeutral');
				this.emitter.emit('plus-mine');
				this.emitter.emit('plus-cell');
			}
		},
		//opens non-flag mines and shows if flag on cell is correct or not
		openMine() {
			if (this.classes.indexOf('cellNeutralWithFlag') != -1) {
				if (this.fieldmatrix.value[this.row][this.cell] == 1) {
					this.removeClasses('cellNeutralWithFlag');
					this.addClasses('cellCorrect');
				} else {
					this.removeClasses('cellNeutralWithFlag');
					let num = this.scoutMines(this.row, this.cell);
					if (num) {
						this.addClasses('n' + num);
						this.value = String(num);
					}
					this.addClasses('cellEmpty');
				}
			} else if (this.fieldmatrix.value[this.row][this.cell] == 1) {
				this.removeClasses('cellNeutral');
				this.addClasses('cellMine');
			}
		},
	},
	computed: {
		getClasses() {
			return this.classes.join(' ')
		}
	},
	inject: ['fieldmatrix'],
});