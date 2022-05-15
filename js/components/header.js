app.component('minesweep-header', {
	data() {
		return {
			classes: ['list__modes', 'modes', 'modes__hide'],
		}
	},
	props: {
		size: {
			type: Number,
			required: true,
		}
	},
	template:
		/* html */
		`
	<div class="header__list list">
		<div id="selected" @click.stop="toggleList">{{getSize}} X {{getSize}}</div>
		<ul :class="getClasses">
			<li @click="changeSize" class="modes__item" id="easy">15 X 15</li>
			<li @click="changeSize" class="modes__item" id="medium">20 X 20</li>
			<li @click="changeSize" class="modes__item" id="hard">25 X 25</li>
		</ul>
	</div>
	<div class="header__text">minesweeper</div>
	<div class="header__count-mine">
		<img src="images/mine.png" alt="justMine">
		<div id="counter">{{ currentMines.value }}</div>
	</div>
	<div class="header__count-time">
		<img src="images/timer.png" alt="justTimer">
		<div id="timer">{{ countTimer() }}</div>
	</div>
	`,
	methods: {
		//translate int to timer form
		countTimer() {
			return (this.timer.value % 60 < 10) ? Math.floor(this.timer.value / 60) + ':0' + this.timer.value % 60 :
				Math.floor(this.timer.value / 60) + ':' + this.timer.value % 60;
		},
		//open or hide list of modes
		toggleList() {
			this.toggleClasses('modes__hide', 'modes__show');
			document.addEventListener('click', this.hideList);
		},
		//hide list (made for document event listener)
		hideList() {
			this.addClasses('modes__hide');
			this.removeClasses('modes__show');
			document.removeEventListener('click', this.hideList);
		},
		//change the size of field? therefore amount of mines
		changeSize(event) {
			const sizeID = event.target.id;
			switch (sizeID) {
				case 'easy':
					this.emitter.emit('changeMode', { size: 15, mines: 35 });
					break;
				case 'medium':
					this.emitter.emit('changeMode', { size: 20, mines: 50 });
					break;
				case 'hard':
					this.emitter.emit('changeMode', { size: 25, mines: 65 });
					break;
				default:
					console.log('error');
					return;
			}
			this.emitter.emit('headerCall');
			this.emitter.emit('finish-timer');
		},
		addClasses(...list) {
			list.forEach(elem => (this.classes.indexOf(elem) == -1) ? this.classes.push(elem) : elem);
			return this.classes.join(' ');
		},
		removeClasses(...list) {
			list.forEach(elem => {
				let index = this.classes.indexOf(elem);
				if (index != -1) this.classes.splice(index, 1);
			});
			return this.classes.join(' ');
		},
		toggleClasses(...list) {
			list.forEach(elem => {
				let index = this.classes.indexOf(elem);
				if (index != -1) this.classes.splice(index, 1);
				else this.classes.push(elem);
			});
			return this.classes.join(' ');
		},
	},
	computed: {
		getClasses() {
			return this.classes.join(' ')
		},
		getSize() {
			return this.size;
		},
	},
	inject: ['timer', 'currentMines'],
});