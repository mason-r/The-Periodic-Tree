Vue.component("candypop", {
	props: ["layer", "data"],
	template: `<div class="candypop-container" v-if="tmp[data].layerShown">
		<clickable :layer="layer" :data="data" />
		<div class="candypop" v-bind:style="{ background: layers[data].color }"></div>
		<span style="font-size: 36px; margin: 10px">〉〉</span>
		<h3 style="flex: 1">{{ formatWhole(freeLevels) }} free <span v-bind:style="{ color: layers[data].color }">{{ layers[layer].clickables["select" + data.slice(0, 1).toUpperCase() + data.slice(1)].title }}</span> levels</h3>
	</div>`,
	computed: {
		freeLevels() {
			return player.levelModifiers[this.data];
		}
	}
});

addLayer("flowers", {
	name: "flowers",
	resource: "flowers",
	image: "images/white-orchid-1974498_1920.jpg",
	color: flowersColor,
	jobName: "Collecting flowers",
	showJobDelay: 0,
	layerShown: true,
	startData() {
		return {
			unlocked: true,
			points: new Decimal(1),
			xp: new Decimal(1),
			lastLevel: new Decimal(1),
			realTime: 0,
			timeLoopActive: false,
			sacrificeType: ""
		};
	},
	shouldNotify() {
		return Object.values(tmp[this.layer].buyables).some(buyable => buyable.unlocked && buyable.canAfford);
	},
	getResetGain() {
		if (!tmp[this.layer].layerShown || (player.tab !== this.layer && !player[this.layer].timeLoopActive)) {
			return new Decimal(0);
		}
		if (player.chapter === 1 && hasMilestone("flowers", "4")) {
			return new Decimal(0);
		}
		let gain = new Decimal(1);
		gain = gain.times(new Decimal(1.1).pow(getJobLevel(this.layer)));
		if (hasUpgrade("flowers", 11)) {
			gain = gain.times(upgradeEffect("flowers", 11));
		}
		if (hasUpgrade("flowers", 12)) {
			gain = gain.times(upgradeEffect("flowers", 12));
		}
		if (hasUpgrade("flowers", 14)) {
			gain = gain.times(upgradeEffect("flowers", 14));
		}
		gain = gain.times(buyableEffect("flowers", 11));
		gain = gain.times(layers.generators.clickables[this.layer].effect());
		gain = gain.pow(buyableEffect("flowers", 13));
		if (player.generators.flowerActive && (player.tab === "generators" || player.generators.timeLoopActive)) {
			gain = gain.sqrt().div(10);
		}
		return gain;
	},
	passiveGeneration: new Decimal(1),
	tabFormat: {
		"Main": {
			content: () => player.tab !== "flowers" ? null :[
				"main-display",
				["display-text", `You are collecting <span style="color: ${flowersColor}; text-shadow: ${flowersColor} 0 0 10px">${format(tmp.flowers.getResetGain)}</span> flowers per second`],
				"blank",
				["display-text", (() => {
					if (player.flowers.xp.lte(1e3)) {
						return "There's a very large field of flowers";
					}
					if (player.flowers.xp.lte(1e5)) {
						return "A small patch is missing from the field of flowers";
					}
					if (player.flowers.xp.lte(1e7)) {
						return "A medium patch is missing from the field of flowers";
					}
					if (player.flowers.xp.lte(4e8)) {
						return "A large patch is missing from the field of flowers";
					}
					if (player.flowers.xp.lte(9e8)) {
						return "The field of flowers looks about half way picked";
					}
					if (player.flowers.xp.lte(1e9)) {
						return "There are very few flowers left";
					}
					if (player.flowers.xp.gte(1e9) && player.chapter === 1) {
						return "The field is barren";
					}
					return "";
				})()],
				"blank",
				["display-text", (() => {
					if (!hasMilestone("flowers", 0)) {
						return "Discover new ways to harness the flower's power at level 2";
					}
					if (!hasMilestone("flowers", 1)) {
						return "Discover new ways to harness the flower's power at level 4";
					}
					if (!hasMilestone("flowers", 2)) {
						return "Discover new ways to harness the flower's power at level 6";
					}
					if (!hasMilestone("flowers", 3)) {
						return "Discover new ways to harness the flower's power at level 8";
					}
					if (!hasMilestone("flowers", 4)) {
						return "Discover new ways to harness the flower's power at level 10";
					}
					return "";
				})()],
				player.chapter === 1 && hasMilestone("flowers", "4") ? ["upgrade", "nextChapter"] : null,
				"blank",
				"buyables",
				"blank",
				"upgrades",
				"blank",
				["milestones-filtered", [4, 5]]
			]
		},
		"Candypop": {
			content: () => player.tab !== "flowers" ? null : [
				["sticky", [0, ["column", [
					["display-text", "Choose input job:"],
					["row", [
						["clickable", "selectFlowers"],
						["clickable", "selectDistill"],
						["clickable", "selectStudy"],
						["clickable", "selectSands"],
						["clickable", "selectGenerators"]
					]]
				]]]],
				"blank",
				["display-text", "Note: Free levels do <b>NOT</b> affect xp requirements."],
				"blank",
				["candypop", "flowers"],
				["candypop", "distill"],
				["candypop", "study"],
				["candypop", "sands"],
				["candypop", "generators"]
				// TODO rituals
			],
			unlocked: () => hasMilestone("generators", 5)
		}
	},
	update(diff) {
		if (player.tab === this.layer || player[this.layer].timeLoopActive) {
			if (player.generators.flowerActive && (player.tab === "generators" || player.generators.timeLoopActive)) {
				diff = diff / 10;
			}
			player[this.layer].realTime += diff;
		}
	},
	onAddPoints(gain) {
		let xpGain = gain;
		if (hasUpgrade(this.layer, 13)) {
			xpGain = xpGain.times(upgradeEffect(this.layer, 13));
		}
		xpGain = xpGain.times(buyableEffect("flowers", 12));
		if (hasUpgrade("generators", 13)) {
			xpGain = xpGain.times(layers.generators.clickables[this.layer].effect());
		}
		player[this.layer].xp = player[this.layer].xp.add(xpGain);
		checkJobXP(this.layer);
	},
	milestones: {
		0: {
			requirementDescription: "Level 2",
			done: () => player.flowers.xp.gte(10)
		},
		1: {
			requirementDescription: "Level 4",
			done: () => player.flowers.xp.gte(1e3)
		},
		2: {
			requirementDescription: "Level 6",
			done: () => player.flowers.xp.gte(1e5)
		},
		3: {
			requirementDescription: "Level 8",
			done: () => player.flowers.xp.gte(1e7)
		},
		4: {
			title: "The story was so fantastic and incredible,",
			requirementDescription: "Level 10",
			"effectDescription": "Unlock distill flowers job",
			done: () => player.flowers.xp.gte(1e9),
			unlocked: () => player.chapter > 1
		},
		5: {
			title: "the telling so credible and sober",
			requirementDescription: "Level 25",
			"effectDescription": "Unlock ???",
			done: () => player.flowers.xp.gte(1e24) && player.chapter > 2,
			unlocked: () => player.chapter > 2
		}
	},
	buyables: {
		rows: 1,
		cols: 3,
		11: {
			title: "I tried to look at the thing in a scientific spirit<br/>",
			display() {
				return `Each casting of this spell increases its cost, and makes collecting flowers 50% faster.<br/><br/>Currently: x${format(this.effect())}<br/><br/>Cost: ${format(this.cost())} flowers`;
			},
			cost(x) {
				const amount = x || getBuyableAmount(this.layer, this.id);
				if (amount.gte(10)) {
					// goes up 10x instead of 3x after 10 levels
					return new Decimal(1000).times(new Decimal(3).pow(10)).times(Decimal.pow(10, amount.sub(10)));
				}
				return new Decimal(1000).times(new Decimal(3).pow(amount));
			},
			effect() {
				return new Decimal(1.5).pow(getBuyableAmount(this.layer, this.id));
			},
			canAfford() {
				return player[this.layer].points.gte(this.cost());
			},
			buy() {
				player[this.layer].points = player[this.layer].points.sub(this.cost());
				setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(1));
			},
			unlocked: () => hasMilestone("flowers", 1)
		},
		12: {
			title: "Why should I trouble myself?<br/>",
			display() {
				return `Each casting of this spell increases its cost, and doubles experience gain.<br/><br/>Currently: x${format(this.effect())}<br/><br/>Cost: ${format(this.cost())} flowers`;
			},
			cost(x) {
				return new Decimal(10000).times(new Decimal(4).pow(x || getBuyableAmount(this.layer, this.id)));
			},
			effect() {
				return new Decimal(2).pow(getBuyableAmount(this.layer, this.id));
			},
			canAfford() {
				return player[this.layer].points.gte(this.cost());
			},
			buy() {
				player[this.layer].points = player[this.layer].points.sub(this.cost());
				setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(1));
			},
			unlocked: () => hasMilestone("flowers", 2)
		},
		13: {
			title: "And there was Weena dancing at my side!<br/>",
			display() {
				return `Each casting of this spell increases its cost, and raises flower collection rate to an additive +.05 power (softcapped immediately).<br/><br/>Currently: ^${format(this.effect())}<br/><br/>Cost: ${format(this.cost())} flowers`;
			},
			cost(x) {
				const amount = x || getBuyableAmount(this.layer, this.id);
				return new Decimal(250000).times(amount.sub(10).max(0).add(10).pow(amount));
			},
			effect() {
				return new Decimal(.05).times(getBuyableAmount(this.layer, this.id).pow(.6)).add(1);
			},
			canAfford() {
				return player[this.layer].points.gte(this.cost());
			},
			buy() {
				player[this.layer].points = player[this.layer].points.sub(this.cost());
				setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(1));
			},
			unlocked: () => hasMilestone("flowers", 3)
		}
	},
	upgrades: {
		rows: 1,
		cols: 4,
		nextChapter: {
			title: "And those that carry us forward, are dreams.<br/>",
			description: "Close the time loop.",
			unlocked: true,
			onPurchase() {
				showTab("none");
				player.chapter = 2;
				player.timeSlots = new Decimal(1);
			}
		},
		11: {
			title: "A chain of beautiful flowers<br>",
			description: "Increase collection speed based on how many flowers you have<br>",
			cost: new Decimal(10),
			effect: () => player.flowers.points.clampMin(1).pow(0.1).add(1),
			unlocked: () => hasMilestone("flowers", 0),
			effectDisplay() {
				return `x${format(this.effect())}`;
			}
		},
		12: {
			title: "A big garland of flowers<br>",
			description: "Increase collection speed based on your collecting flowers level",
			cost: new Decimal(100),
			effect: () => new Decimal(getJobLevel("flowers")).pow(2).div(10).add(1),
			unlocked: () => hasMilestone("flowers", 0),
			effectDisplay() {
				return `x${format(this.effect())}`;
			}
		},
		13: {
			title: "Weena's Gift<br>",
			description: "Increase experience gain based on real time spent collecting flowers",
			cost: new Decimal(250),
			effect: () => new Decimal(player.flowers.realTime).div(100).add(1),
			unlocked: () => hasMilestone("flowers", 0),
			effectDisplay() {
				return `x${format(this.effect())}`;
			}
		},
		14: {
			title: "White Sphinx<br>",
			description: "Increase flower collection based on the number of upgrades bought",
			cost: new Decimal(500),
			effect: () => Decimal.pow(1.5, player.flowers.upgrades.length),
			unlocked: () => hasMilestone("flowers", 0),
			effectDisplay() {
				return `x${format(this.effect())}`;
			}
		}
	},
	clickables: {
		selectFlowers: {
			title: "Collecting",
			color: flowersColor,
			style: { height: "50px" },
			canClick: () => player.flowers.sacrificeType !== "flowers",
			onClick: () => player.flowers.sacrificeType = "flowers",
			unlocked: () => player.flowers.layerShown
		},
		selectDistill: {
			title: "Distilling",
			color: distillColor,
			style: { height: "50px" },
			canClick: () => player.flowers.sacrificeType !== "distill",
			onClick: () => player.flowers.sacrificeType = "distill",
			unlocked: () => player.distill.layerShown
		},
		selectStudy: {
			title: "Studying",
			color: studyColor,
			style: { height: "50px" },
			canClick: () => player.flowers.sacrificeType !== "study",
			onClick: () => player.flowers.sacrificeType = "study",
			unlocked: () => player.study.layerShown
		},
		selectSands: {
			title: "Experimenting",
			color: sandsColor,
			style: { height: "50px" },
			canClick: () => player.flowers.sacrificeType !== "sands",
			onClick: () => player.flowers.sacrificeType = "sands",
			unlocked: () => player.sands.layerShown
		},
		selectGenerators: {
			title: "Generating",
			color: electricColor,
			style: { height: "50px" },
			canClick: () => player.flowers.sacrificeType !== "generators",
			onClick: () => player.flowers.sacrificeType = "generators",
			unlocked: () => player.generators.layerShown
		},
		flowers: {
			title: "Subjugation of nature<br/>",
			color: "#dc3545",
			display: "Throw three levels into the vanilla candypop",
			canClick: () => player.flowers.sacrificeType !== "flowers" && getJobLevel(player.flowers.sacrificeType).gte(13),
			onClick: () => {
				player.levelModifiers[player.flowers.sacrificeType] = player.levelModifiers[player.flowers.sacrificeType].sub(3);
				player.levelModifiers.flowers = player.levelModifiers.flowers.add(1);
				player.study.deep = player.study.deep.min(getJobLevel("study"));
			}
		},
		distill: {
			title: "Languor and decay<br/>",
			color: "#dc3545",
			display: "Throw three levels into the mint candypop",
			canClick: () => player.flowers.sacrificeType !== "distill" && getJobLevel(player.flowers.sacrificeType).gte(13),
			onClick: () => {
				player.levelModifiers[player.flowers.sacrificeType] = player.levelModifiers[player.flowers.sacrificeType].sub(3);
				player.levelModifiers.distill = player.levelModifiers.distill.add(1);
				player.study.deep = player.study.deep.min(getJobLevel("study"));
			}
		},
		study: {
			title: "Pain and necessity<br/>",
			color: "#dc3545",
			display: "Throw three levels into the chocolate candypop",
			canClick: () => player.flowers.sacrificeType !== "study" && getJobLevel(player.flowers.sacrificeType).gte(13),
			onClick: () => {
				player.levelModifiers[player.flowers.sacrificeType] = player.levelModifiers[player.flowers.sacrificeType].sub(3);
				player.levelModifiers.study = player.levelModifiers.study.add(1);
				player.study.deep = player.study.deep.min(getJobLevel("study"));
			}
		},
		sands: {
			title: "Abominable desolation<br/>",
			color: "#dc3545",
			display: "Throw three levels into the caramel candypop",
			canClick: () => player.flowers.sacrificeType !== "sands" && getJobLevel(player.flowers.sacrificeType).gte(13),
			onClick: () => {
				player.levelModifiers[player.flowers.sacrificeType] = player.levelModifiers[player.flowers.sacrificeType].sub(3);
				player.levelModifiers.sands = player.levelModifiers.sands.add(1);
				player.study.deep = player.study.deep.min(getJobLevel("study"));
			}
		},
		generators: {
			title: "Futility of all ambition<br/>",
			color: "#dc3545",
			display: "Throw three levels into the damson candypop",
			canClick: () => player.flowers.sacrificeType !== "generators" && getJobLevel(player.flowers.sacrificeType).gte(13),
			onClick: () => {
				player.levelModifiers[player.flowers.sacrificeType] = player.levelModifiers[player.flowers.sacrificeType].sub(3);
				player.levelModifiers.generators = player.levelModifiers.generators.add(1);
				player.study.deep = player.study.deep.min(getJobLevel("study"));
			}
		}
		// rituals = blackcurrant?
	},
	bars: {
		job: getJobProgressBar("flowers", flowersColor)
	}
});

// Names to use
// - https://www.shmoop.com/study-guides/literature/time-machine-hg-wells/quotes
//
// - delicate flowers
// - waste garden
//
// - common sense of the morning
//
// - Time is only a kind of Space
