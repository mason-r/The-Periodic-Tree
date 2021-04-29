Vue.component("battery", {
	props: ["layer", "data"],
	template: `
      <div style="margin: 20px" v-if="player[data].unlocked">
      <h2>{{ layers.generators.clickables[data].name || data[0].toUpperCase() + data.slice(1) }} battery</h2>
      <div>x{{ format(layers.generators.clickables[data].effect()) }}<br>{{ layers[data].resource }} gain</div>
      <br>
      <div class="battery" v-bind:style="{ borderColor: layers[data].color }">
        <svg
            v-bind:style="{ height: (player[layer].batteries[data] || new Decimal(0)).div(layers[layer].buyables[data].effect()).toNumber() * maxHeight + margin * 2 + 'px', borderColor: layers[data].color }">
          <defs>
            <filter id="glow" x="-100%" y="-100%" width="300%" height="300%">
              <feDropShadow dx="0" dy="0" stdDeviation="3"></feDropShadow>
            </filter>
          </defs>
          <path style="filter:url(#glow)" d="M10,0 L100,0"/>
        </svg>
      </div>
      <br>
      <row :layer="layer" :data="[['clickable', data], ['buyable', data]]"/>
      </div>`
});

function getBatteryCharger(id, title, name) {
	return {
		title: title + "<br/>",
		layer: "generators",
		id,
		name,
		display() {
			return `Charge battery with joules.<br/><br/>Currently: ${format(player[this.layer].batteries[this.id])}/${format(layers[this.layer].buyables[this.id].effect())}`;
		},
		onClick() {
			const chargeAmount = Decimal.min(player.generators.points.times(player.generators.allocPerc), layers[this.layer].buyables[this.id].effect().sub(player.generators.batteries[this.id]));
			if (chargeAmount.gt(0)) {
				player.generators.points = player.generators.points.sub(chargeAmount);
				player.generators.batteries[this.id] = player.generators.batteries[this.id].add(chargeAmount);
			}
		},
		effect() {
			if (!tmp[this.layer].layerShown || (player.tab !== this.layer && !player[this.layer].timeLoopActive)) {
				return new Decimal(1);
			}
			return player[this.layer].batteries[this.id].max(1).log10().add(1);
		}
	};
}

function getBatteryCapBuyable(id, title) {
	return {
		title: title + "<br/>",
		layer: "generators",
		id,
		name,
		style: {
			width: "150px",
			height: "150px"
		},
		display() {
			return `Multiply battery cap by ${formatWhole(buyableEffect(this.layer, 13))}x.<br/><br/>Currently: ${formatWhole(this.effect())}<br/><br/>Cost: ${formatWhole(this.cost())} charge`;
		},
		cost(x) {
			const amount = x || getBuyableAmount(this.layer, this.id);
			return Decimal.pow(10, amount.add(1)).times(0.9);
		},
		canAfford() {
			return player[this.layer].batteries[this.id].gte(this.cost());
		},
		buy() {
			player[this.layer].batteries[this.id] = player[this.layer].batteries[this.id].sub(this.cost());
			setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(1));
		},
		effect() {
			return Decimal.pow(buyableEffect(this.layer, 13), getBuyableAmount(this.layer, this.id).add(1));
		},
		unlocked: () => hasMilestone("generators", 1)
	};
}

addLayer("generators", {
	name: "generators",
	resource: "joules",
	image: "images/PIXNIO-1742428-5028x2828.jpg",
	color: electricColor,
	jobName: "Run Generators",
	showJobDelay: 1,
	layerShown: () => hasMilestone("study", 5),
	startData() {
		return {
			unlocked: true,
			points: new Decimal(0),
			xp: new Decimal(0),
			lastLevel: new Decimal(0),
			timeLoopActive: false,
			allocPerc: new Decimal(1),
			flowersActive: false,
			distillActive: false,
			studyActive: false,
			sandsActive: false,
			ritualsActive: false,
			flowersDuration: 0,
			distillDuration: 0,
			studyDuration: 0,
			sandsDuration: 0,
			ritualsDuration: 0,
			batteries: {
				generators: new Decimal(0),
				flowers: new Decimal(0),
				distill: new Decimal(0),
				study: new Decimal(0),
				sands: new Decimal(0),
				rituals: new Decimal(0)
			}
		};
	},
	shouldNotify() {
		return Object.values(tmp[this.layer].buyables).some(buyable => buyable.unlocked && buyable.canAfford);
	},
	getResetGain() {
		if (!tmp[this.layer].layerShown || (player.tab !== this.layer && !player[this.layer].timeLoopActive)) {
			return new Decimal(0);
		}
		let gain = new Decimal(0);
		if (player.generators.flowersActive && (player.tab === "flowers" || player.flowers.timeLoopActive)) {
			gain = gain.add(layers.generators.clickables.flowersGenerator.effect());
		}
		if (player.generators.distillActive && (player.tab === "distill" || player.distill.timeLoopActive)) {
			gain = gain.add(layers.generators.clickables.distillGenerator.effect());
		}
		if (player.generators.studyActive && (player.tab === "study" || player.study.timeLoopActive)) {
			gain = gain.add(layers.generators.clickables.studyGenerator.effect());
		}
		if (player.generators.sandsActive && (player.tab === "sands" || player.sands.timeLoopActive)) {
			gain = gain.add(layers.generators.clickables.sandsGenerator.effect());
		}
		if (player.generators.ritualsActive && (player.tab === "rituals" || player.rituals.timeLoopActive)) {
			gain = gain.add(layers.generators.clickables.ritualsGenerator.effect());
		}
		gain = gain.times(buyableEffect(this.layer, 11));
		gain = gain.times(new Decimal(1.1).pow(getJobLevel(this.layer)));
		gain = gain.times(layers.generators.clickables[this.layer].effect());
		if (hasUpgrade(this.layer, 11)) {
			gain = gain.times(upgradeEffect(this.layer, 11));
		}
		return gain;
	},
	passiveGeneration: new Decimal(1),
	tabFormat: {
		"Main": {
			content: () => player.tab !== "generators" ? null : [
				"main-display",
				["display-text", `You are collecting <span style="color: ${electricColor}; text-shadow: ${electricColor} 0 0 10px">${format(tmp.generators.getResetGain)}</span> joules per second`],
				"blank",
				["display-text", (() => {
					if (!hasMilestone("generators", 0)) {
						return "Discover new ways to harness the electric power at level 2";
					}
					if (!hasMilestone("generators", 1)) {
						return "Discover new ways to harness the electric power at level 4";
					}
					if (!hasMilestone("generators", 3)) {
						return "Discover new ways to harness the electric power at level 6";
					}
					if (!hasMilestone("generators", 4)) {
						return "Discover new ways to harness the electric power at level 8";
					}
					if (!hasMilestone("generators", 5)) {
						return "Discover new ways to harness the electric power at level 10";
					}
					return "";
				})()],
				"blank",
				"blank",
				["row", [["clickable", "flowersGenerator"], ["clickable", "distillGenerator"], ["clickable", "studyGenerator"], ["clickable", "sandsGenerator"], ["clickable", "ritualsGenerator"]]],
				"blank",
				"blank",
				"upgrades",
				"buyables",
				"blank",
				["milestones-filtered", [2, 5, 6]]
			]
		},
		"Batteries": {
			content: () => player.tab !== "generators" ? null : [
				"main-display",
				["display-text", "Each battery effects a job's output.<br/>Every power of 10 joules increases that job's gain by 1x.<br/>Batteries slowly lose charge over time.<br/>"],
				"blank",
				["sticky", ["80px", ["row", [
					["clickable", "perc1"],
					"blank",
					["clickable", "perc10"],
					"blank",
					["clickable", "perc50"],
					"blank",
					["clickable", "perc100"]
				]]]],
				"blank",
				["row", [["battery", "flowers"], ["battery", "distill"]]],
				["row", [["battery", "study"], ["battery", "sands"]]],
				["row", [["battery", "generators"], ["battery", "rituals"]]]
			],
			unlocked: () => hasMilestone("generators", 0)
		}
	},
	update(diff) {
		if (player.tab === this.layer || player[this.layer].timeLoopActive) {
			Object.keys(player[this.layer].batteries).forEach(key => {
				player[this.layer].batteries[key] = player[this.layer].batteries[key].times(Decimal.pow(Math.E, Decimal.times(diff, buyableEffect(this.layer, 12)))).clamp(0, layers[this.layer].buyables[key].effect());
				if (player[this.layer].batteries[key].lt(0.01)) {
					player[this.layer].batteries[key] = new Decimal(0);
				}
				if (player[this.layer][`${key}Active`]) {
					player[this.layer][`${key}Duration`] += diff;
				}
			});
		}
	},
	onAddPoints(gain) {
		let xpGain = gain;
		if (hasUpgrade("generators", 13)) {
			xpGain = xpGain.times(layers.generators.clickables[this.layer].effect());
		}
		player[this.layer].xp = player[this.layer].xp.add(xpGain);
		checkJobXP(this.layer);
	},
	milestones: {
		0: {
			requirementDescription: "Level 2",
			done: () => player.generators.xp.gte(10)
		},
		1: {
			requirementDescription: "Level 4",
			done: () => player.generators.xp.gte(1e3)
		},
		2: {
			title: "Silence Earthling!",
			requirementDescription: "Level 5",
			"effectDescription": "Unlock a new feature in experiments job",
			done: () => player.generators.xp.gte(1e4)
		},
		3: {
			requirementDescription: "Level 6",
			done: () => player.generators.xp.gte(1e5)
		},
		4: {
			requirementDescription: "Level 8",
			done: () => player.generators.xp.gte(1e7)
		},
		5: {
			title: "My name is Darth Vader.",
			requirementDescription: "Level 10",
			"effectDescription": "Unlock candypop feature in collecting job",
			done: () => player.generators.xp.gte(1e9),
			unlocked: () => hasMilestone("generators", 2)
		},
		6: {
			title: "I am an extraterrestrial",
			requirementDescription: "Level 25",
			"effectDescription": "Unlock ???",
			done: () => player.generators.xp.gte(1e24) && player.chapter > 2,
			unlocked: () => player.chapter > 3
		}
	},
	upgrades: {
		rows: 1,
		cols: 3,
		11: {
			title: "Well, good luck.<br>",
			description: "Multiply joules gain by 2 raised to the number of active generators<br>",
			cost: new Decimal(1e4),
			effect: () => Decimal.pow(2, ["flower", "distill", "study", "sands"].filter(g => player.generators[`${g}Active`]).length),
			unlocked: () => hasMilestone("generators", 3),
			effectDisplay() {
				return `x${formatWhole(this.effect())}`;
			}
		},
		12: {
			title: "For both our sakes.<br>",
			description: "Increase generator's output by 1% for each second since it was activated<br>",
			cost: new Decimal(1e5),
			unlocked: () => hasMilestone("generators", 3)
		},
		13: {
			title: "See you in the future.<br>",
			description: "Apply batteries' effects to their job's xp as well<br>",
			cost: new Decimal(1e6),
			unlocked: () => hasMilestone("generators", 3)
		}
	},
	clickables: {
		flowersGenerator: {
			title: "I hate manure!<br/>",
			display() {
				return `Generate <b>${format(this.effect())}</b> joules/s if collecting job is active.<br/>(based on collecting level)<br/><br/>Flowers gain is softcapped immediately and the job runs 10x slower.<br/><br/>Currently: <b>${player.generators.flowersActive ? "ACTIVE" : "INACTIVE"}</b>`;
			},
			class: () => ({"gradient-border": player.generators.flowersActive}),
			style: {
				width: "200px",
				height: "200px"
			},
			onClick() {
				player.generators.flowersActive = !player.generators.flowersActive;
			},
			effect() {
				let effect = getJobLevel("flowers").div(16);
				if (hasUpgrade("generators", 12)) {
					effect = effect.times(Decimal.times(0.01, player.generators.flowersDuration).add(1));
				}
				return effect;
			}
		},
		distillGenerator: {
			title: "Wait A Minute, Doc.<br/>",
			display() {
				return `Generate <b>${format(this.effect())}</b> joules/s if distilling job is active.<br/>(based on distilling level)<br/><br/>Essentia gain is softcapped immediately and the job runs 10x slower.<br/><br/>Currently: <b>${player.generators.distillActive ? "ACTIVE" : "INACTIVE"}</b>`;
			},
			class: () => ({"gradient-border": player.generators.distillActive}),
			style: {
				width: "200px",
				height: "200px"
			},
			onClick() {
				player.generators.distillActive = !player.generators.distillActive;
			},
			effect() {
				let effect = getJobLevel("distill").div(8);
				if (hasUpgrade("generators", 12)) {
					effect = effect.times(Decimal.times(0.01, player.generators.distillDuration).add(1));
				}
				return effect;
			}
		},
		studyGenerator: {
			title: "Great Scott!<br/>",
			display() {
				return `Generate <b>${format(this.effect())}</b> joules/s if studying job is active.<br/>(based on studying level)<br/><br/>Properties gain is softcapped immediately and the job runs 10x slower.<br/><br/>Currently: <b>${player.generators.studyActive ? "ACTIVE" : "INACTIVE"}</b>`;
			},
			class: () => ({"gradient-border": player.generators.studyActive}),
			style: {
				width: "200px",
				height: "200px"
			},
			onClick() {
				player.generators.studyActive = !player.generators.studyActive;
			},
			effect() {
				let effect = getJobLevel("study").div(4);
				if (hasUpgrade("generators", 12)) {
					effect = effect.times(Decimal.times(0.01, player.generators.studyDuration).add(1));
				}
				return effect;
			}
		},
		sandsGenerator: {
			title: "This is heavy!<br/>",
			display() {
				return `Generate <b>${format(this.effect())}</b> joules/s if experiments job is active.<br/>(based on experimenting level)<br/><br/>Potentia gain is softcapped immediately and the job runs 10x slower.<br/><br/>Currently: <b>${player.generators.sandsActive ? "ACTIVE" : "INACTIVE"}</b>`;
			},
			class: () => ({"gradient-border": player.generators.sandsActive}),
			style: {
				width: "200px",
				height: "200px"
			},
			onClick() {
				player.generators.sandsActive = !player.generators.sandsActive;
			},
			effect() {
				let effect = getJobLevel("sands").div(2);
				if (hasUpgrade("generators", 12)) {
					effect = effect.times(Decimal.times(0.01, player.generators.sandsDuration).add(1));
				}
				return effect;
			}
		},
		ritualsGenerator: {
			title: "Nobody Calls Me Chicken.<br/>",
			display() {
				return `Generate <b>${format(this.effect())}</b> joules/s if rituals job is active.<br/>(based on rituals level)<br/><br/>All ritual effects are softcapped immediately and the job runs 10x slower.<br/><br/>Currently: <b>${player.generators.ritualsActive ? "ACTIVE" : "INACTIVE"}</b>`;
			},
			class: () => ({"gradient-border": player.generators.ritualsActive}),
			style: {
				width: "200px",
				height: "200px"
			},
			onClick() {
				player.generators.ritualsActive = !player.generators.ritualsActive;
			},
			effect() {
				let effect = getJobLevel("rituals");
				if (hasUpgrade("generators", 12)) {
					effect = effect.times(Decimal.times(0.01, player.generators.ritualsDuration).add(1));
				}
				return effect;
			}
		},
		flowers: getBatteryCharger("flowers", "History is gonna change.", "Collecting"),
		distill: getBatteryCharger("distill", "You disintegrated Einstein!"),
		study: getBatteryCharger("study", "I figured, what the hell?"),
		sands: getBatteryCharger("sands", "Ronald Reagan? The actor? Ha!", "Experiments"),
		generators: getBatteryCharger("generators", "Good night, future boy!"),
		rituals: getBatteryCharger("rituals", "Your future is whatever you make it"),
		// TODO ritual charger,
		"perc1": {
			title: "1%",
			style: {
				width: "60px",
				height: "60px"
			},
			canClick: () => player.generators.allocPerc.neq(0.01),
			onClick: () => {
				player.generators.allocPerc = new Decimal(0.01);
			}
		},
		"perc10": {
			title: "10%",
			style: {
				width: "60px",
				height: "60px"
			},
			canClick: () => player.generators.allocPerc.neq(0.1),
			onClick: () => {
				player.generators.allocPerc = new Decimal(0.1);
			}
		},
		"perc50": {
			title: "50%",
			style: {
				width: "60px",
				height: "60px"
			},
			canClick: () => player.generators.allocPerc.neq(0.5),
			onClick: () => {
				player.generators.allocPerc = new Decimal(0.5);
			}
		},
		"perc100": {
			title: "100%",
			style: {
				width: "60px",
				height: "60px"
			},
			canClick: () => player.generators.allocPerc.neq(1),
			onClick: () => {
				player.generators.allocPerc = new Decimal(1);
			}
		}
	},
	buyables: {
		rows: 1,
		cols: 3,
		11: {
			title: "1.21 Gigawatts!?!<br/>",
			display() {
				return `Improve generator efficiency by 10%<br/><br/>Currently: x${format(this.effect())}<br/><br/>Cost: ${format(this.cost())} joules`;
			},
			cost(x) {
				const amount = x || getBuyableAmount(this.layer, this.id);
				return new Decimal(1e6).times(new Decimal(5).pow(amount));
			},
			effect() {
				return new Decimal(1.1).pow(getBuyableAmount(this.layer, this.id));
			},
			canAfford() {
				return player[this.layer].points.gte(this.cost());
			},
			buy() {
				player[this.layer].points = player[this.layer].points.sub(this.cost());
				setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(1));
			},
			unlocked: () => hasMilestone("generators", 4)
		},
		12: {
			title: "88 Miles Per Hour<br/>",
			display() {
				return `Decrease battery discharge by 10%/sec<br/><br/>Currently: ${format(this.effect().times(100))}%/sec<br/><br/>Cost: ${format(this.cost())} joules`;
			},
			cost(x) {
				const amount = x || getBuyableAmount(this.layer, this.id);
				return new Decimal(1e7).times(new Decimal(10).pow(amount));
			},
			effect() {
				return new Decimal(-.1).div(Decimal.pow(1.1, getBuyableAmount(this.layer, this.id)));
			},
			canAfford() {
				return player[this.layer].points.gte(this.cost());
			},
			buy() {
				player[this.layer].points = player[this.layer].points.sub(this.cost());
				setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(1));
			},
			unlocked: () => hasMilestone("generators", 4)
		},
		13: {
			title: "Where We’re Going, We Don’t Need Roads.<br/>",
			display() {
				return `Add 1 to the amount each battery cap upgrade multiples the cap by<br/><br/>Currently: x${formatWhole(this.effect())}<br/><br/>Cost: ${format(this.cost())} joules`;
			},
			cost(x) {
				const amount = x || getBuyableAmount(this.layer, this.id);
				return new Decimal(1e8).times(new Decimal(8).pow(amount));
			},
			effect() {
				return Decimal.add(10, getBuyableAmount(this.layer, this.id));
			},
			canAfford() {
				return player[this.layer].points.gte(this.cost());
			},
			buy() {
				player[this.layer].points = player[this.layer].points.sub(this.cost());
				setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(1));
			},
			unlocked: () => hasMilestone("generators", 4)
		},
		flowers: getBatteryCapBuyable("flowers", "It's \"leave\", you idiot!"),
		distill: getBatteryCapBuyable("distill", "A hundred years ago?"),
		study: getBatteryCapBuyable("study", "I'm back <i>from</i> the future."),
		sands: getBatteryCapBuyable("sands", "Alright, boys, buckle up."),
		generators: getBatteryCapBuyable("generators", "Unless you've got power!"),
		rituals: getBatteryCapBuyable("rituals", "?")
	},
	bars: {
		job: getJobProgressBar("generators", electricColor)
	}
});

// animate electricity svg
const numberOfPoints = 20;
const lineWidth = 4;
const amplitude = 30;
const margin = 10;
const maxHeight = 200 - margin * 2;
const width = 100;

let animateElectricity = () => {
	const containers = document.querySelectorAll(".battery > svg");
	for (let i = 0; i < containers.length; i++) {
		const container = containers[i];
		const height = parseInt(getComputedStyle(container).getPropertyValue("height").slice(0, -2));

		if (height === margin * 2) {
			continue;
		}

		if (Math.random() < .5) {
			continue;
		}

		const numPoints = Math.max(3, Math.floor(numberOfPoints * height / maxHeight));
		let coords = new Array(numPoints).fill(1).map((_, i) => {
			let first = i === 0;
			let last = i === numPoints - 1;
			let y = (height - margin * 2) / (numPoints - 1) * i + margin;
			let x = (first || last) ? width / 2 : (width - amplitude) / 2 + Math.random() * amplitude;

			return {x, y};
		});

		// Draw path
		let path = container.querySelector("path");
		path.setAttribute("d", "M" + coords.map(coord => coord.x + "," + coord.y).join(" L"));

		// Style path
		let deviation = Math.random() * (5 - 2) + 2;
		path.style.opacity = deviation / 5 + 0.2;
		path.style.strokeWidth = lineWidth;

		// Style glow
		let glow = container.querySelector("#glow feDropShadow");
		glow.setAttribute("stdDeviation", deviation);
	}

	requestAnimationFrame(animateElectricity);
};

requestAnimationFrame(animateElectricity);
