app.component('minesweep-field', {
	data() {
		return {
			width: Math.floor(660 / this.size) + 'px',
			height: Math.floor(660 / this.size) + 'px',
			inProgress: false,
			row: 0,
			cell: -1,
		}
	},
	props: {
		size: {
			type: Number,
			required: true,
		},
		mines: {
			type: Number,
			required: true,
		}
	},
	template:
		/* html */
		`
		<table id="field" cellspacing="0" cellpadding="0" border="0" @dragstart.prevent=""
		@click="handleClick" @contextmenu.prevent="handleContextMenu">
			<tr v-for="row in size">
				<cell v-for="cell in size" :styles="computeSize" :row="row-1" :cell="cell-1" 
				:width="this.width" :size="size"></cell>
			</tr>
		</table>
	`,
	computed: {
		//calculate and return properties of field
		computeSize() {
			this.width = (this.width) ? this.width : Math.floor(660 / this.size) + 'px';
			this.height = this.width;
			return {
				width: this.width,
				height: this.width,
				outline: '1px solid black',
				outlineOffset: '-1px',
				overflow: 'hidden',
				fontSize: Math.floor(parseFloat(this.width) / 1.5) + 'px',
			}
		},
	},
	methods: {
		//add event of first click or others
		handleClick(event) {
			if (!this.inProgress) this.initProcess(event);
			else this.waitClick(event);
		},
		//add event on right click
		handleContextMenu(event) {
			if (this.inProgress) this.setFlag(event);
		},
		//init field after first click
		initProcess(event) {
			let elem = event.target,
				row = elem.id.slice(1, elem.id.match(/[j]/).index),
				col = elem.id.slice(elem.id.match(/[j]/).index + 1),
				bors = {
					borL: +col - 1,
					borT: +row - 1,
					borR: +col + 1,
					borB: +row + 1,
				};

			this.initMines(bors);
			elem.dispatchEvent(new Event('check'));
			this.inProgress = true;
			this.emitter.emit('start-timer');
		},
		//initialize mines :)
		initMines(bors) {
			countMines = this.mines;
			while (countMines) {
				let i = Math.floor(Math.random() * this.size),
					j = Math.floor(Math.random() * this.size);
				if (this.fieldmatrix.value[i][j] ||
					(i >= bors.borT && j >= bors.borL && i <= bors.borB && j <= bors.borR)) continue;
				this.fieldmatrix.value[i][j] = 1;
				countMines--;
			}
		},
		//cause of deligation event call event from cell(target)
		waitClick(event) {
			event.target.dispatchEvent(new Event('check'));
		},
		//cause of deligation event call event from cell(target)
		setFlag(event) {
			event.target.dispatchEvent(new Event('set-flag'));
		},
		//after end of game call open event from cells with falg or mine
		showAll() {
			for (let row = 0; row < this.size; row++) {
				for (let col = 0; col < this.size; col++) {
					let cell = document.querySelector('#i' + row + 'j' + col);
					cell.dispatchEvent(new Event('open-if-needed'));
				}
			}
		},
	},
	inject: ['fieldmatrix'],
});