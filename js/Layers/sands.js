Vue.component("sand", {
	props: ["layer", "data"],
	template: `
      <div class="chipping-container">
      <div v-for="i in 100" class="chipping">
        <div class="chipping-fill instant"
             v-bind:style="{ height: percentChipped.sub((i - 1) * 100).clamp(0, 100).div(10).floor().times(10).toNumber() + '%' }"></div>
        <div class="chipping-fill instant"
             v-bind:style="{ float: 'left', height: '10%', width: percentChipped.sub((i - 1) * 100).clamp(0, 100).sub(percentChipped.sub((i - 1) * 100).clamp(0, 100).div(10).floor().times(10)).times(10).toNumber() + '%' }"></div>
      </div>
      </div>
	`,
	computed: {
		percentChipped: () => new Decimal(1).sub(player.sands.shrunkAmount.div(nextStoneCost())).times(10000)
	}
});

/*
Cannot use this class because the animations don't reset properly, and seem to be calcualting the duration or delays incorrectly.
For now it seems easier to just keep it as a display-text. I don't think it's actually that non-performant.

Vue.component("hourglass", {
	props: ["layer", "data"],
	template: `<div>
		<div>{{ formatWhole(totalGrains.sub(grainsFallen)) }}</div>
		<div v-bind:style="userStyle">
			<div class="hourglass"></div>
		</div>
		<div>{{ formatWhole(grainsFallen) }}</div>
	</div>`,
	computed: {
		userStyle: () => {
			const flipping = player.sands.flipping;
			const finished = player.sands.grainsFallen.eq(getTotalGrains());
			const fallSpeed = new Decimal(4).div(player.devSpeed || 1).div(getFallSpeed());
			const fallMult = getFallMult();
			return {
				"--fill-duration": (flipping || finished ? 1 : getTotalGrains().div(fallMult).ceil().times(fallSpeed).toNumber() + 0.05) + "s",
				"--fill-delay": "-" + (flipping || finished ? .999 : player.sands.grainsFallen.div(fallMult).floor().times(fallSpeed).toNumber()) + "s",
				"--fill-state": flipping || finished ? "paused" : "running",
				"--flip-duration": new Decimal(5).div(player.devSpeed || 1).div(getFlipSpeed()).toNumber() + 0.05 + "s",
				"--flip-state": flipping ? "running" : "paused"
			};
		},
		totalGrains: getTotalGrains,
		grainsFallen: () => player.sands.grainsFallen
	}
});
*/

function nextStoneCost() {
	return new Decimal(10).times(new Decimal(1.05).pow(player.sands.stonesChipped));
}

function getFallSpeed() {
	let fallSpeed = new Decimal(1);
	fallSpeed = fallSpeed.times(new Decimal(1.1).pow(getJobLevel("sands")));
	fallSpeed = fallSpeed.times(buyableEffect("sands", 12));
	if (player.sands.chipping && hasUpgrade("sands", 15)) {
		if (hasUpgrade("sands", 13)) {
			fallSpeed = fallSpeed.times(upgradeEffect("sands", 13).add(1));
		} else {
			fallSpeed = fallSpeed.times(2);
		}
	}
	if (player.generators.sandsActive && (player.tab === "generators" || player.generators.timeLoopActive)) {
		fallSpeed = fallSpeed.div(10);
	}
	return fallSpeed;
}

function getFlipSpeed() {
	let flipSpeed = new Decimal(1);
	flipSpeed = flipSpeed.times(new Decimal(1.1).pow(getJobLevel("sands")));
	flipSpeed = flipSpeed.times(buyableEffect("sands", 22));
	if (player.generators.sandsActive && (player.tab === "generators" || player.generators.timeLoopActive)) {
		flipSpeed = flipSpeed.div(10);
	}
	return flipSpeed;
}

function getTotalGrains() {
	let grains = new Decimal(player.sands.stonesChipped);
	grains = grains.times(buyableEffect("sands", 14));
	grains = grains.times(buyableEffect("sands", 24));
	grains = grains.sub(player.sands.spentGrains);
	return grains.max(0);
}

function getFallMult() {
	let fallAmount = new Decimal(1);
	fallAmount = fallAmount.times(buyableEffect("sands", 13));
	return fallAmount;
}

function getPotentiaMult() {
	let gain = new Decimal(1);
	gain = gain.times(buyableEffect("sands", 23));
	if (hasUpgrade("sands", 14)) {
		gain = gain.times(upgradeEffect("sands", 14));
	}
	if (player.sands.chipping && hasUpgrade("sands", 25)) {
		if (hasUpgrade("sands", 13)) {
			gain = gain.times(upgradeEffect("sands", 13).add(1));
		} else {
			gain = gain.times(2);
		}
	}
	gain = gain.times(layers.generators.clickables.sands.effect());
	if (player.sands.selectedLens === "potentia") {
		gain = gain.times(buyableEffect("sands", "glass"));
	}
	gain = gain.times(ritualEffect("gain"));
	if (player.generators.sandsActive && (player.tab === "generators" || player.generators.timeLoopActive)) {
		gain = gain.sqrt();
	}
	return gain;
}

addLayer("sands", {
	name: "sands",
	resource: "potentia",
	image: "images/pexels-photo-1095601.jpeg",
	color: sandsColor,
	jobName: "Experiments with time",
	showJobDelay: 0.75,
	layerShown: () => hasMilestone("study", 5),
	startData() {
		return {
			unlocked: true,
			points: new Decimal(0),
			xp: new Decimal(0),
			lastLevel: new Decimal(0),
			timeLoopActive: false,
			grainsFallen: new Decimal(0),
			shrunkAmount: new Decimal(0),
			chipping: false,
			flipping: false,
			stonesChipped: new Decimal(0),
			fallTime: new Decimal(0),
			flipTime: new Decimal(0),
			lensLevel: new Decimal(0),
			selectedLens: "chip",
			spentGrains: new Decimal(0)
		};
	},
	tabFormat: {
		"Main": {
			content: () => {
				new Decimal(1).sub(player.sands.shrunkAmount.div(nextStoneCost())).times(10000);
				return player.tab !== "sands" ? null : [
					"main-display",
					"blank",
					["display-text", (() => {
						if (!hasMilestone("sands", 0)) {
							return "Discover new ways to experiment at level 2";
						}
						if (!hasMilestone("sands", 1)) {
							return "Discover new ways to experiment at level 4";
						}
						if (!hasMilestone("sands", 3)) {
							return "Discover new ways to experiment at level 6";
						}
						if (!hasMilestone("sands", 4)) {
							return "Discover new ways to experiment at level 8";
						}
						return "";
					})()],
					"blank",
					["sticky", ["80px", ["column", [
						["display-text", formatWhole(getTotalGrains().sub(player.sands.grainsFallen))],
						["display-text", `<div style="
								--fill-duration: ${player.sands.flipping || player.sands.grainsFallen.eq(getTotalGrains()) ? 1 : getTotalGrains().div(getFallMult()).ceil().times(4).div(player.devSpeed || 1).div(getFallSpeed()).toNumber() + 0.05}s;
								--fill-delay: -${player.sands.flipping || player.sands.grainsFallen.eq(getTotalGrains()) ? .999 : player.sands.grainsFallen.div(getFallMult()).floor().times(4).div(player.devSpeed || 1).div(getFallSpeed()).toNumber()}s;
								--fill-state: ${player.sands.grainsFallen.eq(getTotalGrains()) || player.sands.flipping ? "paused" : "running"};
								--flip-duration: ${new Decimal(5).div(player.devSpeed || 1).div(getFlipSpeed()).toNumber() + 0.05}s;
								--flip-state: ${player.sands.flipping ? "running" : "paused"};
							"><div class="hourglass"></div></div>`],
						["display-text", formatWhole(player.sands.grainsFallen)]
					]]]],
					"blank",
					["clickable", "flip"],
					"blank",
					"blank",
					["display-text", `Zoom Level: 1 / ${format(nextStoneCost().div(10))}x`],
					"blank",
					"sand",
					"blank",
					["clickable", "chip"],
					"blank",
					"blank",
					["milestones-filtered", [2, 5, 6]]
				];
			}
		},
		"Upgrades": {
			content: () => player.tab !== "sands" ? null : [
				"main-display",
				"blank",
				["display-text", (() => {
					if (!hasMilestone("sands", 0)) {
						return "Discover new ways to experiment at level 2";
					}
					if (!hasMilestone("sands", 1)) {
						return "Discover new ways to experiment at level 4";
					}
					if (!hasMilestone("sands", 3)) {
						return "Discover new ways to experiment at level 6";
					}
					if (!hasMilestone("sands", 4)) {
						return "Discover new ways to experiment at level 8";
					}
					return "";
				})()],
				"blank",
				["sticky", ["80px", ["column", [
					["display-text", formatWhole(getTotalGrains().sub(player.sands.grainsFallen))],
					["display-text", `<div style="
							--fill-duration: ${player.sands.flipping || player.sands.grainsFallen.eq(getTotalGrains()) ? 1 : getTotalGrains().div(getFallMult()).ceil().times(4).div(player.devSpeed || 1).div(getFallSpeed()).toNumber() + 0.05}s;
							--fill-delay: -${player.sands.flipping || player.sands.grainsFallen.eq(getTotalGrains()) ? .999 : player.sands.grainsFallen.div(getFallMult()).floor().times(4).div(player.devSpeed || 1).div(getFallSpeed()).toNumber()}s;
							--fill-state: ${player.sands.grainsFallen.eq(getTotalGrains()) || player.sands.flipping ? "paused" : "running"};
							--flip-duration: ${new Decimal(5).div(player.devSpeed || 1).div(getFlipSpeed()).toNumber() + 0.05}s;
							--flip-state: ${player.sands.flipping ? "running" : "paused"};
						"><div class="hourglass"></div></div>`],
					["display-text", formatWhole(player.sands.grainsFallen)]
				]]]],
				"blank",
				["clickable", "flip"],
				"blank",
				"blank",
				"buyables",
				"blank",
				"upgrades"
			],
			unlocked: () => hasMilestone("sands", 0),
			shouldNotify: () => Object.values(tmp.sands.upgrades).some(upgrade => upgrade.unlocked && upgrade.canAfford) || Object.values(tmp.sands.buyables).some(buyable => buyable.id !== "glass" && buyable.unlocked && buyable.canAfford)
		},
		"Glass": {
			content: () => player.tab !== "sands" ? null : [
				"main-display",
				"blank",
				["buyable", "glass"],
				"blank",
				["row", [
					["clickable", "redLens"],
					"blank",
					["clickable", "greenLens"],
					"blank",
					["clickable", "blueLens"]
				]]
			],
			unlocked: () => hasMilestone("generators", 2),
			shouldNotify: () => tmp.sands.buyables.glass.unlocked && tmp.sands.buyables.glass.canAfford
		}
	},
	update(diff) {
		if (player.tab === this.layer || player[this.layer].timeLoopActive) {
			let shrinkGain = new Decimal(0);
			if (hasUpgrade("sands", 11)) {
				shrinkGain = shrinkGain.add(.1);
			}
			if (hasUpgrade("sands", 12)) {
				shrinkGain = shrinkGain.add(.2);
			}
			if (hasUpgrade("sands", 21)) {
				shrinkGain = shrinkGain.add(.3);
			}
			if (hasUpgrade("sands", 22)) {
				shrinkGain = shrinkGain.add(.4);
			}
			if (player[this.layer].chipping) {
				if (hasUpgrade("sands", 13)) {
					shrinkGain = shrinkGain.add(upgradeEffect("sands", 13));
				} else {
					shrinkGain = shrinkGain.add(1);
				}
			}
			if (shrinkGain.gt(0)) {
				shrinkGain = shrinkGain.times(diff);
				shrinkGain = shrinkGain.times(new Decimal(1.1).pow(getJobLevel(this.layer)));
				shrinkGain = shrinkGain.times(buyableEffect("sands", 11));
				shrinkGain = shrinkGain.times(buyableEffect("sands", 21));
				if (player.sands.selectedLens === "chip") {
					shrinkGain = shrinkGain.times(buyableEffect("sands", "glass"));
				}
				if (player.generators.sandsActive && (player.tab === "generators" || player.generators.timeLoopActive)) {
					shrinkGain = shrinkGain.div(10);
				}
				player[this.layer].shrunkAmount = player[this.layer].shrunkAmount.add(shrinkGain);
			}

			// https://gameanalytics.com/blog/idle-game-mathematics/
			// b = 100
			// r = 1.1
			let grainsGain = player[this.layer].shrunkAmount.times(new Decimal(1.1).sub(1)).div(nextStoneCost()).add(1).log(1.1).floor();
			if (grainsGain.gt(0)) {
				player[this.layer].shrunkAmount = player[this.layer].shrunkAmount.sub(nextStoneCost().times(new Decimal(1.1).pow(grainsGain).sub(1)).div(new Decimal(1.1).sub(1)));
				player[this.layer].stonesChipped = player[this.layer].stonesChipped.add(grainsGain);
			}

			if (player[this.layer].flipping) {
				player[this.layer].fallTime = new Decimal(0);
				player[this.layer].flipTime = player[this.layer].flipTime.add(getFlipSpeed().times(diff));
				const flipDuration = new Decimal(5);
				if (player[this.layer].flipTime.gt(flipDuration)) {
					player[this.layer].flipping = false;
					player[this.layer].flipTime = new Decimal(0);
					player[this.layer].grainsFallen = new Decimal(0);
				}
			} else {
				player[this.layer].flipTime = new Decimal(0);
				if (player[this.layer].grainsFallen.lt(getTotalGrains())) {
					player[this.layer].fallTime = player[this.layer].fallTime.add(getFallSpeed().times(diff));
					const fallDuration = new Decimal(4);
					const fallenGrains = player[this.layer].fallTime.div(fallDuration).floor().times(getFallMult()).clampMax(getTotalGrains().sub(player[this.layer].grainsFallen));
					if (fallenGrains.gt(0)) {
						addPoints(this.layer, fallenGrains.times(getPotentiaMult()));
						player[this.layer].grainsFallen = player[this.layer].grainsFallen.add(fallenGrains);
						if (fallenGrains.eq(getTotalGrains())) {
							player[this.layer].fallTime = new Decimal(0);
						} else {
							player[this.layer].fallTime = player[this.layer].fallTime.sub(fallenGrains.div(getFallMult()).times(fallDuration));
						}
					}
				} else {
					player[this.layer].fallTime = new Decimal(0);
				}
			}
		}
	},
	onAddPoints(gain) {
		let xpGain = gain;
		if (hasUpgrade("generators", 13)) {
			xpGain = xpGain.times(layers.generators.clickables[this.layer].effect());
		}
		if (player.sands.selectedLens === "xp") {
			xpGain = xpGain.times(Decimal.pow(buyableEffect("sands", "glass"), 2));
		}
		xpGain = xpGain.times(ritualEffect("globalXp"));
		player[this.layer].xp = player[this.layer].xp.add(xpGain);
		checkJobXP(this.layer);
	},
	milestones: {
		0: {
			requirementDescription: "Level 2",
			done: () => player.sands.xp.gte(10)
		},
		1: {
			requirementDescription: "Level 4",
			done: () => player.sands.xp.gte(1e3)
		},
		2: {
			title: "I don't even know what I'm doing.",
			requirementDescription: "Level 5",
			"effectDescription": "Unlock a new time slot",
			done: () => player.sands.xp.gte(1e4),
			onComplete: () => {
				player.timeSlots = player.timeSlots.add(1);
			}
		},
		3: {
			requirementDescription: "Level 6",
			done: () => player.sands.xp.gte(1e5)
		},
		4: {
			requirementDescription: "Level 8",
			done: () => player.sands.xp.gte(1e7)
		},
		5: {
			title: "I mean, this stuff is way too advanced for me.",
			requirementDescription: "Level 10",
			"effectDescription": "Unlock rituals job",
			done: () => player.sands.xp.gte(1e9),
			unlocked: () => hasMilestone("sands", 2)
		},
		6: {
			title: "And what if I can't fix this? What are we gonna do?",
			requirementDescription: "Level 25",
			"effectDescription": "Unlock ???",
			done: () => player.sands.xp.gte(1e24) && player.chapter > 2,
			unlocked: () => hasMilestone("sands", 5) && player.chapter > 2
		}
	},
	clickables: {
		chip: {
			title: "Keep Moving Forward<br/>",
			display: "Hover over this to chip away at the stone until its the size of a grain of sand.",
			touchstart: () => {
				player.sands.chipping = true;
			},
			touchend: () => {
				player.sands.chipping = false;
			}
		},
		flip: {
			title: "But he doesn't give up!<br/>",
			display: "Flip the hourglass",
			canClick: () => player.sands.grainsFallen.gt(0) && !player.sands.flipping,
			onClick: () => {
				player.sands.flipping = true;
			}
		},
		redLens: {
			title: "Red Lens<br/>",
			display() {
				return `Focus on chipping speed to improve it by x${formatWhole(layers.sands.buyables.glass.effect())}`;
			},
			style: {
				borderColor: "red"
			},
			canClick: () => player.sands.selectedLens !== "chip",
			onClick: () => player.sands.selectedLens = "chip"
		},
		greenLens: {
			title: "Green Lens<br/>",
			display() {
				return `Focus on potentia gain to improve it by x${formatWhole(layers.sands.buyables.glass.effect())}`;
			},
			style: {
				borderColor: "green"
			},
			canClick: () => player.sands.selectedLens !== "potentia",
			onClick: () => player.sands.selectedLens = "potentia"
		},
		blueLens: {
			title: "Blue Lens<br/>",
			display() {
				return `Focus on xp gain to improve it by x${formatWhole(Decimal.pow(layers.sands.buyables.glass.effect(), 2))}`;
			},
			style: {
				borderColor: "blue"
			},
			canClick: () => player.sands.selectedLens !== "xp",
			onClick: () => player.sands.selectedLens = "xp"
		}
	},
	buyables: {
		rows: 2,
		cols: 4,
		glass: {
			title: "His insurance won't pay for contacts.<br/>",
			layer: "sands",
			id: "glass",
			display() {
				return `Melt sand into glass. Doubles the effectiveness of lenses. Requires 110% of the cost to buy.<br/><br/>Currently: ${formatWhole(this.effect())}<br/><br/>Cost: ${format(this.cost())} grains of sand`;
			},
			cost(x) {
				const amount = x || getBuyableAmount(this.layer, this.id);
				return new Decimal(1e6).times(Decimal.pow(10, amount));
			},
			effect() {
				return Decimal.pow(2, getBuyableAmount(this.layer, this.id).add(1));
			},
			canAfford() {
				return getTotalGrains().gte(this.cost().times(1.1));
			},
			buy() {
				setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(1));
				player.sands.spentGrains = new Decimal("1".repeat(getBuyableAmount("sands", "glass").toNumber()) + "000000");
			},
			unlocked: true
		},
		11: {
			title: "It's my dad's motto.<br/>",
			display() {
				return `Additively increases chipping speed by 25%<br/><br/>Currently: x${format(this.effect())}<br/><br/>Cost: ${format(this.cost())} potentia`;
			},
			cost(x) {
				const amount = x || getBuyableAmount(this.layer, this.id);
				return new Decimal(10).times(new Decimal(2).pow(amount));
			},
			effect() {
				return new Decimal(.25).times(getBuyableAmount(this.layer, this.id)).add(1);
			},
			canAfford() {
				return player[this.layer].points.gte(this.cost());
			},
			buy() {
				player[this.layer].points = player[this.layer].points.sub(this.cost());
				setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(1));
			},
			unlocked: () => hasMilestone("sands", 0)
		},
		12: {
			title: "That's strange. She usually takes the Harley.<br/>",
			display() {
				return `Additively increases how quickly grains of sand fall by 100%<br/><br/>Currently: x${format(this.effect())}<br/><br/>Cost: ${format(this.cost())} potentia`;
			},
			cost(x) {
				const amount = x || getBuyableAmount(this.layer, this.id);
				return new Decimal(2).pow(Decimal.add(amount, 3));
			},
			effect() {
				return new Decimal(1).times(getBuyableAmount(this.layer, this.id)).add(1);
			},
			canAfford() {
				return player[this.layer].points.gte(this.cost());
			},
			buy() {
				player[this.layer].points = player[this.layer].points.sub(this.cost());
				setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(1));
			},
			unlocked: () => hasMilestone("sands", 0)
		},
		13: {
			title: "You're smart, you fix it!<br/>",
			display() {
				return `Additively increases how many grains of sand can fall through the hourglass at once by 1<br/><br/>Currently: x${format(this.effect())}<br/><br/>Cost: ${format(this.cost())} potentia`;
			},
			cost(x) {
				const amount = x || getBuyableAmount(this.layer, this.id);
				return new Decimal(1.5).times(new Decimal(4).pow(Decimal.add(amount, 2)));
			},
			effect() {
				return getBuyableAmount(this.layer, this.id).add(1);
			},
			canAfford() {
				return player[this.layer].points.gte(this.cost());
			},
			buy() {
				player[this.layer].points = player[this.layer].points.sub(this.cost());
				setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(1));
			},
			unlocked: () => hasMilestone("sands", 0)
		},
		14: {
			title: "You want to know what I think about this?<br/>",
			display() {
				return `Additively and retroactively increases how many grains of sand you gather from each completely chipped stone by 1<br/><br/>Currently: x${format(this.effect())}<br/><br/>Cost: ${format(this.cost())} potentia`;
			},
			cost(x) {
				const amount = x || getBuyableAmount(this.layer, this.id);
				return new Decimal(25).times(new Decimal(6).pow(amount));
			},
			effect() {
				return getBuyableAmount(this.layer, this.id).add(1);
			},
			canAfford() {
				return player[this.layer].points.gte(this.cost());
			},
			buy() {
				player[this.layer].points = player[this.layer].points.sub(this.cost());
				setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(1));
			},
			unlocked: () => hasMilestone("sands", 0)
		},
		21: {
			title: "I'm ignoring you for time reasons.<br/>",
			display() {
				return `Multiplicatively increases chipping speed by 50%<br/><br/>Currently: x${format(this.effect())}<br/><br/>Cost: ${format(this.cost())} potentia`;
			},
			cost(x) {
				const amount = x || getBuyableAmount(this.layer, this.id);
				return new Decimal(2).times(new Decimal(5).pow(Decimal.add(amount, 1)));
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
			unlocked: () => hasMilestone("sands", 3)
		},
		22: {
			title: "From failure, you learn; from success not so much.<br/>",
			display() {
				return `Multiplicatively increases how quickly the hourglass flips by 20%<br/><br/>Currently: x${format(this.effect())}<br/><br/>Cost: ${format(this.cost())} potentia`;
			},
			cost(x) {
				const amount = x || getBuyableAmount(this.layer, this.id);
				return new Decimal(3).times(new Decimal(2).pow(Decimal.add(amount, 1)));
			},
			effect() {
				return new Decimal(1.2).pow(getBuyableAmount(this.layer, this.id));
			},
			canAfford() {
				return player[this.layer].points.gte(this.cost());
			},
			buy() {
				player[this.layer].points = player[this.layer].points.sub(this.cost());
				setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(1));
			},
			unlocked: () => hasMilestone("sands", 3)
		},
		23: {
			title: "To...the future!<br/>",
			display() {
				return `Additively increases how much potentia you collect from each grain that falls by 1<br/><br/>Currently: x${format(this.effect())}<br/><br/>Cost: ${format(this.cost())} potentia`;
			},
			cost(x) {
				const amount = x || getBuyableAmount(this.layer, this.id);
				return new Decimal(50).times(new Decimal(2).pow(amount));
			},
			effect() {
				return getBuyableAmount(this.layer, this.id).add(1);
			},
			canAfford() {
				return player[this.layer].points.gte(this.cost());
			},
			buy() {
				player[this.layer].points = player[this.layer].points.sub(this.cost());
				setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(1));
			},
			unlocked: () => hasMilestone("sands", 3)
		},
		24: {
			title: "Or, what's left of it.<br/>",
			display() {
				return `Multiplicatively and retroactively increases how many grains of sand you gather 2x<br/><br/>Currently: x${format(this.effect())}<br/><br/>Cost: ${format(this.cost())} potentia`;
			},
			cost(x) {
				const amount = x || getBuyableAmount(this.layer, this.id);
				if (hasUpgrade("sands", 24)) {
					return new Decimal(75).times(new Decimal(8).pow(amount));
				}
				return new Decimal(75).times(new Decimal(10).pow(amount));
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
			unlocked: () => hasMilestone("sands", 3)
		}
	},
	upgrades: {
		rows: 2,
		cols: 5,
		11: {
			title: "I have a big head,<br>",
			description: "Automatically chip the stone at +10% efficiency",
			cost: new Decimal(200),
			unlocked: () => hasMilestone("sands", 1)
		},
		12: {
			title: "and little arms!<br>",
			description: "Automatically chip the stone at +20% efficiency",
			cost: new Decimal(400),
			unlocked: () => hasMilestone("sands", 1)
		},
		13: {
			title: "I'm not sure how well<br>",
			description: "Multiply <b>\"Keep Moving Forward\"</b>'s effect by this job's level<br/>",
			cost: new Decimal(800),
			unlocked: () => hasMilestone("sands", 1),
			effect: () => getJobLevel("sands"),
			effectDisplay() {
				return `x${format(this.effect())}`;
			}
		},
		14: {
			title: "this plan was thought through.<br>",
			description: "Potentia gain is increased based on total number of grains<br/>",
			cost: new Decimal(1600),
			unlocked: () => hasMilestone("sands", 1),
			effect: () => getTotalGrains().pow(.25).add(1),
			effectDisplay() {
				return `x${format(this.effect())}`;
			}
		},
		15: {
			title: "Master?<br>",
			description: "<b>\"Keep Moving Forward\"</b> also speeds up grains falling through the hourglass<br/>",
			cost: new Decimal(6400),
			unlocked: () => hasMilestone("sands", 1)
		},
		21: {
			title: "I'll take two!<br>",
			description: "Automatically chip the stone at +30% efficiency",
			cost: new Decimal(1e6),
			unlocked: () => hasMilestone("sands", 4)
		},
		22: {
			title: "Bake them cookies, Lucille!<br>",
			description: "Automatically chip the stone at +40% efficiency",
			cost: new Decimal(2e6),
			unlocked: () => hasMilestone("sands", 4)
		},
		23: {
			title: "You are now under my control<br>",
			description: "Flip speed affects fall speed at 5% efficiency<br/>",
			cost: new Decimal(5e6),
			unlocked: () => hasMilestone("sands", 4),
			effect: () => getFlipSpeed().sub(1).div(20).add(1),
			effectDisplay() {
				return `x${format(this.effect())}`;
			}
		},
		24: {
			title: "Stop laughing<br>",
			description: "Reduce the cost scaling of <b>\"Or, what's left of it.\"</b><br/>",
			cost: new Decimal(2.5e7),
			unlocked: () => hasMilestone("sands", 4)
		},
		25: {
			title: "Excellent<br>",
			description: "<b>\"Keep Moving Forward\"</b> also increases potentia gain<br/>",
			cost: new Decimal(1e8),
			unlocked: () => hasMilestone("sands", 4)
		}
	},
	bars: {
		job: getJobProgressBar("sands", sandsColor)
	}
});
