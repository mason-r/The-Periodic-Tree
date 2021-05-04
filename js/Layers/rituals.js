Vue.component("rune", {
	props: ["layer", "data"],
	template: `<div class="upgAlign">
		<button class="upg can rune" style="width: 60px; min-height: 60px;"
			v-on:click="setRune(data)"
			v-bind:style="{
				background: (player.rituals.board[\`\$\{data[0]\}\$\{data[1]\}\`] ? 'url(images/' + player.rituals.board[\`\$\{data[0]\}\$\{data[1]\}\`] + 'Rune.webp) no-repeat center / contain ' : '') + (layers[player.rituals.board[\`\$\{data[0]\}\$\{data[1]\}\`]]?.color || ritualsColor)
			}">
		</button>
	</div>`
});

Vue.component("ritual", {
	props: ["layer", "data"],
	template: `<div class="ritual">
		<span>
			<div v-for="(row, index) in data.pattern" v-key="index" style="text-align: center;">
				<div v-for="(symbol, index) in row" v-key="index" class="upgAlign" style="display: inline-block;">
					<span class="upg can rune"
						style="display: inline-block; width: 60px; min-height: 60px; font-size: xx-large; text-align: center; line-height: 60px;"
						v-bind:style="{ backgroundColor: symbol == null ? '#3a3e45' : ritualsColor }">{{ symbol == null ? '​' : '#' + symbol }}</span>
				</div>
			</div>
		</span>
		<span style="margin: 0;"><h3>{{ data.title }}</h3>{{ data.description }}</span>
	</div>`
});

const rituals = {
	xp: {
		title: "Ritual of Doctrina",
		description: "Each of these rituals exponentially increases the amount of ritual xp gained per second",
		pattern: [ [ 0, 1 ], [ 1, 0 ] ],
		effect: (amount, effectiveness) => Decimal.pow(4, amount).sub(1).times(effectiveness),
		effectDisplay: () => format(ritualEffect("xp")) + " xp/s",
		unlocked: () => true
	},
	gain: {
		title: "Ritual of Emolumentum",
		description: "Each of these rituals increases the amount of each job's primary resource is gained",
		pattern: [ [ 0, 1, 1, 0 ] ],
		effect: (amount, effectiveness) => new Decimal(amount).times(effectiveness).add(1),
		effectDisplay: () => "x" + format(ritualEffect("gain")) + " all job's primary resources",
		unlocked: () => hasMilestone("rituals", 0)
	},
	improvement: {
		title: "Ritual of Melius",
		description: "Each of these rituals increases the effectiveness of all other rituals over time, with diminishing returns",
		pattern: [ [ 0, 1, 0 ], [ 1, 2, 1 ], [ 0, 1, 0 ] ],
		effect: amount => new Decimal(amount).times(.01),
		effectDisplay: () => "+" + format(ritualEffect("improvement")) + " increased effectiveness of all other ritual effects/s",
		unlocked: () => hasMilestone("rituals", 1)
	},
	globalXp: {
		title: "Ritual of Colegium",
		description: "Each of these rituals increases the amount of each job's xp gain",
		pattern: [ [ 0, null, 0 ], [ null, null, null ], [ 0, null, 0 ] ],
		effect: (amount, effectiveness) => new Decimal(amount).times(effectiveness).add(1),
		effectDisplay: () => "x" + format(ritualEffect("globalXp")) + " all job's xp gain",
		unlocked: () => hasMilestone("rituals", 3)
	},
	speed: {
		title: "Ritual of Celeritas",
		description: "Each of these rituals increases the flow of time itself",
		pattern: [ [ 0, null, null, 0 ], [ null, 1, 1, null ], [ null, 1, 1, null ], [ 0, null, null, 0 ] ],
		effect: (amount, effectiveness) => new Decimal(amount).times(effectiveness).add(1),
		effectDisplay: () => "x" + format(ritualEffect("speed")) + " global speed multiplier",
		unlocked: () => hasMilestone("rituals", 3)
	}
};

function ritualEffect(id) {
	let level = player.tab === "rituals" || player.rituals.timeLoopActive ? player.rituals.rituals[id] || 0 : 0;
	let effect = rituals[id].effect(level, player.rituals.effectiveness.max(1).times(Decimal.pow(1.1, getJobLevel("rituals"))).log2().add(1));
	if (player.generators.ritualsActive && (player.tab === "generators" || player.generators.timeLoopActive)) {
		effect = effect.sqrt();
	}
	return effect;
}

// Note: id is the corresponding *buyable* ID
function createRuneSelector(id, rune) {
	// TODO image based on rune
	return {
		color: layers[rune]?.color || ritualsColor,
		class: {
			rune: true
		},
		style: {
			width: "60px",
			minHeight: "60px",
			background: rune ? 'url(images/' + rune + 'Rune.webp) no-repeat center / contain' : '',
			backgroundColor: layers[rune]?.color || ritualsColor,
			"--count": rune === null ? "" : () => (getBuyableAmount("rituals", id)?.toNumber() || 0) - Object.values(player.rituals.board).filter(r => r === rune).length
		},
		canClick: () => player.rituals.selectedRune !== rune,
		onClick: () => player.rituals.selectedRune = rune
	}
}

function createRuneBuyable(id, title) {
	return {
		title: title + "<br/>",
		display() {
			return `Craft another rune<br/><br/>Currently: ${formatWhole(getBuyableAmount("rituals", this.id))}<br/><br/>Cost: ${format(this.cost())} ${layers[id].resource}`;
		},
		runeType: id,
		color: layers[id].color,
		style: {
			width: '160px',
			height: '160px'
		},
		cost(x) {
			const amount = x || getBuyableAmount("rituals", this.id);
			return new Decimal(1e10).times(new Decimal(10).pow(amount));
		},
		canAfford() {
			return player[id].points.gte(this.cost());
		},
		buy() {
			player[id].points = player[id].points.sub(this.cost());
			setBuyableAmount("rituals", this.id, getBuyableAmount("rituals", this.id).add(1));
		},
		unlocked: () => tmp[id].layerShown
	};
}

function getRows() {
	let rows = 3;
	if (hasMilestone("rituals", 1)) {
		rows++;
	}
	if (hasMilestone("rituals", 4)) {
		rows++;
	}
	return rows;
}

function getCols() {
	let cols = 3;
	if (hasMilestone("rituals", 0)) {
		cols++;
	}
	if (hasMilestone("rituals", 3)) {
		cols++;
	}
	return cols;
}

function setRune([row, col]) {
	if (player.rituals.selectedRune == null || (getBuyableAmount("rituals", Object.values(layers.rituals.buyables).find(b => b.runeType === player.rituals.selectedRune).id)?.toNumber() || 0) - Object.values(player.rituals.board).filter(r => r === player.rituals.selectedRune).length > 0) {
		player.rituals.board[`${row}${col}`] = player.rituals.selectedRune;
		player.rituals.rituals = getRituals();
	}
}

function checkRitual(ritual, top, left) {
	// Store a lookup table of what runes this pattern is using
	const types = {};

	for (let r = 0; r < ritual.pattern.length; r++) {
		for (let c = 0; c < ritual.pattern[r].length; c++) {
			let patternTile = ritual.pattern[r][c];
			if (patternTile == null) {
				continue;
			}
			let tile = player.rituals.board[`${top + r}${left + c}`];
			if ((patternTile in types && types[patternTile] !== tile) ||
				(!(patternTile in types) && Object.values(types).includes(tile)) ||
				tile == null) {
				return false;
			}
			types[patternTile] = tile;
		}
	}
	return true;
}

function getRituals() {
	const rows = getRows();
	const cols = getCols();
	const ritualCounts = {};
	Object.entries(rituals).forEach(([id, ritual]) => {
		if (!ritual.unlocked()) {
			return;
		}
		let ritualCount = 0;
		for (let row = 0; row < rows && row <= rows - ritual.pattern.length; row++) {
			for (let col = 0; col < cols && col <= cols - ritual.pattern[0].length; col++) {
				// [row, col] is the top left of the ritual
				// TODO allow negative numbers to represent "not this type"
				if (checkRitual(ritual, row, col)) {
					ritualCount++;
				}
			}
		}
		if (ritualCount > 0) {
			ritualCounts[id] = ritualCount;
		}
	});
	return ritualCounts;
}

addLayer("rituals", {
	name: "rituals",
	image: "images/bright-72804.jpg",
	color: ritualsColor,
	jobName: "Perform Rituals",
	showJobDelay: 1.25,
	layerShown: () => hasMilestone("sands", 5),
	tooltip: "",
	startData() {
		return {
			unlocked: true,
			xp: new Decimal(0),
			lastLevel: new Decimal(0),
			timeLoopActive: false,
			board: {},
			selectedRune: null,
			rituals: {},
			effectiveness: new Decimal(1)
		};
	},
	tabFormat: {
		"Main": {
			content: () => player.tab !== "rituals" ? [] : [
				["sticky", [0, ["row", [["bar", "job"], ["display-text", `<span style="margin-left: 20px;">Lv. ${getJobLevel("rituals")}</span>`]]]]],
				"blank",
				["display-text", (() => {
					if (!hasMilestone("rituals", 0)) {
						return "Discover new ways to harness the arcane power at level 2";
					}
					if (!hasMilestone("rituals", 1)) {
						return "Discover new ways to harness the arcane power at level 4";
					}
					if (!hasMilestone("rituals", 3)) {
						return "Discover new ways to harness the arcane power at level 6";
					}
					if (!hasMilestone("rituals", 4)) {
						return "Discover new ways to harness the arcane power at level 8";
					}
					if (!hasMilestone("rituals", 5)) {
						return "Discover new ways to harness the arcane power at level 10";
					}
					return "";
				})()],
				"blank",
				"buyables",
				"blank",
				["sticky", ["36px", ["clickables"]]],
				"blank",
				...new Array(getRows()).fill(0).map((_,row) => ["row", new Array(getCols()).fill(0).map((_,col) => ["rune", [row, col]])]),
				"blank",
				...Object.keys(rituals).filter(id => id in player.rituals.rituals && player.rituals.rituals[id] > 0).map(id => ["display-text", `${rituals[id].title} (${player.rituals.rituals[id]}): ${rituals[id].effectDisplay()}<br/>`]),
				"blank",
				["milestones-filtered", [2, 5, 6]]
			],
			shouldNotify: () => Object.values(tmp.rituals.buyables).some(buyable => buyable.unlocked && buyable.canAfford)
		},
		"Ritual Book": {
			content: () => player.tab !== "rituals" ? [] : [
				["sticky", [0, ["row", [["bar", "job"], ["display-text", `<span style="margin-left: 20px;">Lv. ${getJobLevel("rituals")}</span>`]]]]],
				"blank",
				["display-text", "Form rituals in the grid to gain powerful effects. You can have multiples of each ritual, and runes can be a part of multiple, overlapping rituals.<br/><br/>For any ritual, replace the tiles with any rune, but each tile with the same number must have the same rune.<br/>Blank tiles can have anything in them."],
				"blank",
				"blank",
				...Object.values(rituals).filter(ritual => ritual.unlocked()).map(ritual => ["ritual", ritual])
			]
		}
	},
	update(diff) {
		if (player.tab === this.layer || player[this.layer].timeLoopActive) {
			if (player.generators.ritualsActive && (player.tab === "generators" || player.generators.timeLoopActive)) {
				diff = diff / 10;
			}

			player.rituals.effectiveness = player.rituals.effectiveness.add(ritualEffect("improvement").times(diff));

			let xpGain = ritualEffect("xp").times(diff);
			xpGain = xpGain.times(ritualEffect("globalXp"));
			player[this.layer].xp = player[this.layer].xp.add(xpGain);
			checkJobXP(this.layer);
		}
	},
	milestones: {
		0: {
			requirementDescription: "Level 2",
			done: () => player.rituals.xp.gte(10)
		},
		1: {
			requirementDescription: "Level 4",
			done: () => player.rituals.xp.gte(1e3)
		},
		2: {
			title: "You know the laws, Miss Granger.",
			requirementDescription: "Level 5",
			"effectDescription": "Unlock a new feature in study job",
			done: () => player.rituals.xp.gte(1e4)
		},
		3: {
			requirementDescription: "Level 6",
			done: () => player.rituals.xp.gte(1e5)
		},
		4: {
			requirementDescription: "Level 8",
			done: () => player.rituals.xp.gte(1e7)
		},
		5: {
			title: "You must not be seen.",
			requirementDescription: "Level 10",
			"effectDescription": "Unlock the Ritual of Ascensio",
			done: () => player.rituals.xp.gte(1e9),
			unlocked: () => hasMilestone("rituals", 2)
		},
		6: {
			title: "And you would do well, I feel, to return before this last chime.",
			requirementDescription: "Level 25",
			"effectDescription": "Unlock ???",
			done: () => player.rituals.xp.gte(1e24) && player.chapter > 2,
			unlocked: () => hasMilestone("rituals", 5) && player.chapter > 2
		}
	},
	clickables: {
		rows: 1,
		cols: 7,
		11: {
			title: "Clear All",
			style: {
				color: "white",
				minHeight: "60px"
			},
			canClick: () => Object.keys(player.rituals.board).length > 0,
			onClick: () => {
				player.rituals.board = {};
				player.rituals.rituals = getRituals();
			}
		},
		12: createRuneSelector(null, null),
		13: createRuneSelector(11, "flowers"),
		14: createRuneSelector(12, "distill"),
		15: createRuneSelector(13, "study"),
		16: createRuneSelector(14, "sands"),
		17: createRuneSelector(15, "generators")
	},
	buyables: {
		rows: 1,
		cols: 5,
		11: createRuneBuyable("flowers", "I did my waiting!"),
		12: createRuneBuyable("distill", "We enter a world that is entirely our own"),
		13: createRuneBuyable("study", "I solemnly swear that I am up to no good."),
		14: createRuneBuyable("sands", "Finally the flesh reflects the madness within."),
		15: createRuneBuyable("generators", "Mysterious thing, time")
	},
	bars: {
		job: getJobProgressBar("rituals", ritualsColor)
	}
});

// Names from https://en.wikiquote.org/wiki/Harry_Potter_and_the_Prisoner_of_Azkaban_(film)
