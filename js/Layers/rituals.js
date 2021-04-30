// Note: id is the corresponding *buyable* ID
function createRuneSelector(id, rune) {
	// TODO image based on rune
	return {
		color: layers[rune]?.color,
		style: {
			width: "60px",
			minHeight: "60px",
			"--count": () => (getBuyableAmount("rituals", id)?.toNumber() || 0) - Object.values(player.rituals.board).filter(r => r === rune).length
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
			selectedRune: null
		};
	},
	tabFormat: () => player.tab !== "rituals" ? [] : [
		["sticky", [0, ["row", [["bar", "job"], ["display-text", `<span style="margin-left: 20px;">Lv. ${getJobLevel("rituals")}</span>`]]]]],
		"blank",
		"buyables",
		"blank",
		["sticky", ["36px", ["clickables"]]],
		"blank",
		["milestones-filtered", [2, 5, 6]]
	],
	update(diff) {
		if (player.tab === this.layer || player[this.layer].timeLoopActive) {
			if (player.generators.ritualsActive && (player.tab === "generators" || player.generators.timeLoopActive)) {
				diff = diff / 10;
			}
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
			"effectDescription": "Unlock the Ritual of Ascent",
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
		11: {
			title: "Clear All",
			style: {
				color: "white",
				minHeight: "60px"
			},
			canClick: () => Object.keys(player.rituals.board).length > 0,
			onClick: () => player.rituals.board = {}
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
