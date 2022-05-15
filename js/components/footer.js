app.component('minesweep-footer', {
	data() {
		return {
			classesBody: ['minesweep-footer', 'minesweep-footer__already-hide'],
			classesWrapper: ['minesweep-footer__wrapper', 'wrapper', 'wrapper__already-hide'],

		}
	},
	template:
		/* html */
		`
	<div id="finish" :class="getClassesBody" :style="calcScales()">
		<div :class="getClassesWrapper">
			<div class="wrapper__message">{{ message }}</div>
			<div class="wrapper__stat stat">
					<div class="stat__time">{{ countTimer() }}</div>
					<div class="stat__mine">{{ (mines.value - currentMines.value) + '/' + mines.value }}</div>
					<img @click="restart" class="stat__image" src="images/restart.png" alt="restart">
			</div>
		</div>
	</div>
	`,
	props: {
		message: {
			type: String,
			required: true,
		}
	},
	methods: {
		//calculate scales of dark background, cause user shouldn't click on neutral cells after the game was ended
		calcScales() {
			let field = document.querySelector('#field');
			return {
				height: field.clientHeight + 'px',
				width: field.clientWidth + 'px',
				top: field.offsetTop + 'px',
			}
		},
		//translate int to timer form
		countTimer() {
			return (this.timer.value % 60 < 10) ? Math.floor(this.timer.value / 60) + ':0' + this.timer.value % 60 :
				Math.floor(this.timer.value / 60) + ':' + this.timer.value % 60;
		},
		//initialize the game over screen
		show(result) {
			this.removeClasses(this.classesBody, 'minesweep-footer__already-hide');
			this.addClasses(this.classesBody, 'minesweep-footer__show');
			setTimeout(() => {
				this.removeClasses(this.classesBody, 'minesweep-footer__show');
				this.addClasses(this.classesBody, 'minesweep-footer__already-show');
			}, 1500);

			this.addClasses(this.classesWrapper, 'wrapper__show', ((result) ? 'wrapper__win' : 'wrapper__lose'));
			setTimeout(() => {
				this.removeClasses(this.classesWrapper, 'wrapper__show', 'wrapper__already-hide');
				this.addClasses(this.classesWrapper, 'wrapper__already-show');
			}, 1500);
		},
		//hide game over screen when the game restarts
		restart() {
			this.removeClasses(this.classesBody, 'minesweep-footer__already-show');
			setTimeout(() => {
				this.addClasses(this.classesBody, 'minesweep-footer__already-hide');
			}, 500);

			this.addClasses(this.classesWrapper, 'wrapper__hide');
			setTimeout(() => {
				this.removeClasses(this.classesWrapper, 'wrapper__hide', 'wrapper__already-show', 'wrapper__win', 'wrapper__lose');
				this.addClasses(this.classesWrapper, 'wrapper__already-hide');
			}, 500);

			this.emitter.emit('restart');
		},
		addClasses(where, ...list) {
			list.forEach(elem => (where.indexOf(elem) == -1) ? where.push(elem) : elem);
			return where.join(' ');
		},
		removeClasses(where, ...list) {
			list.forEach(elem => {
				let index = where.indexOf(elem);
				if (index != -1) where.splice(index, 1);
			});
			return where.join(' ');
		},
	},
	computed: {
		getClassesBody() {
			return this.classesBody.join(' ')
		},
		getClassesWrapper() {
			return this.classesWrapper.join(' ')
		}
	},
	inject: ['mines', 'currentMines', 'timer'],
	created() {
		this.emitter.on('headerCall', () => this.restart());
	},
});