Vue.component("battery", {
	props: ["layer", "data"],
	template: `<div style="margin: 20px" v-if="player[data].unlocked">
		<h2>{{ layers.generators.clickables[data].name || data[0].toUpperCase() + data.slice(1) }} battery</h2>
		<div>x{{ format(layers.generators.clickables[data].effect()) }}<br>{{ layers[data].resource }} gain</div><br>
		<div class="battery" v-bind:style="{ borderColor: layers[data].color }">
			<svg v-bind:style="{ height: (player[layer].batteries[data] || new Decimal(0)).div(layers[layer].buyables[data].effect()).toNumber() * maxHeight + margin * 2 + 'px', borderColor: layers[data].color }">
				<defs>
					<filter id="glow" x="-100%" y="-100%" width="300%" height="300%">
			      		<feDropShadow dx="0" dy="0" stdDeviation="3"></feDropShadow>
			    	</filter>
			  	</defs>
			  	<path style="filter:url(#glow)" d="M10,0 L100,0"/>
			</svg>
		</div><br>
		<row :layer="layer" :data="[['clickable', data], ['buyable', data]]" />
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
			return `Mutliply battery cap by 10x.<br/><br/>Currently: ${formatWhole(this.effect())}<br/><br/>Cost: ${formatWhole(this.cost())} charge`;
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
			return Decimal.pow(10, getBuyableAmount(this.layer, this.id).add(1));
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
			batteries: {
				generators: new Decimal(0),
				flowers: new Decimal(0),
				distill: new Decimal(0),
				study: new Decimal(0),
				sands: new Decimal(0)
			}
		};
	},
	getResetGain() {
		if (!tmp[this.layer].layerShown || (player.tab !== this.layer && !player[this.layer].timeLoopActive)) {
			return new Decimal(0);
		}
		let gain = new Decimal(0);
		if (player.generators.flowerActive && (player.tab === "flowers" || player.flowers.timeLoopActive)) {
			gain = gain.add(getJobLevel("flowers").div(50));
		}
		if (player.generators.distillActive && (player.tab === "distill" || player.distill.timeLoopActive)) {
			gain = gain.add(getJobLevel("distill").div(25));
		}
		if (player.generators.studyActive && (player.tab === "study" || player.study.timeLoopActive)) {
			gain = gain.add(getJobLevel("study").div(10));
		}
		if (player.generators.sandsActive && (player.tab === "sands" || player.sands.timeLoopActive)) {
			gain = gain.add(getJobLevel("sands").div(5));
		}
		gain = gain.times(new Decimal(1.1).pow(getJobLevel(this.layer)));
		gain = gain.times(layers.generators.clickables[this.layer].effect());
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
				["row", [["clickable", "flowersGenerator"], "blank", ["clickable", "distillGenerator"], "blank", ["clickable", "studyGenerator"], "blank", ["clickable", "sandsGenerator"]]],
				"blank",
				"blank",
				["milestones-filtered", [2, 5, 6]]
			]
		},
		"Batteries": {
			content: () => player.tab !== "generators" ? null : [
				"main-display",
				["display-text", "Each battery effects a job's output.<br/>Every power of 10 joules increases that job's gain by 1x.<br/>Batteries slowly lose charge over time.<br/>"],
				"blank",
				["row", [
					["clickable", "perc1"],
					"blank",
					["clickable", "perc10"],
					"blank",
					["clickable", "perc50"],
					"blank",
					["clickable", "perc100"]
				]],
				"blank",
				["row", [["battery", "flowers"], ["battery", "distill"]]],
				["row", [["battery", "study"], ["battery", "sands"]]],
				["row", [["battery", "generators"]]] // TODO rituals battery
			],
			unlocked: () => hasMilestone("generators", 0)
		}
	},
	update(diff) {
		if (player.tab === this.layer || player[this.layer].timeLoopActive) {
			Object.keys(player[this.layer].batteries).forEach(key => {
				player[this.layer].batteries[key] = player[this.layer].batteries[key].times(Decimal.pow(Math.E, Decimal.times(diff, -0.1))).clamp(0, layers[this.layer].buyables[key].effect());
				if (player[this.layer].batteries[key].lt(0.01)) {
					player[this.layer].batteries[key] = new Decimal(0);
				}
			});
		}
		let jobLevel = new Decimal(getJobLevel(this.layer));
		if (jobLevel.neq(player[this.layer].lastLevel) && player[this.layer].lastLevel.lte(100)) {
			doPopup("none", `Level ${formatWhole(jobLevel)}`, "Level Up!", 3, layers[this.layer].color);
			player[this.layer].lastLevel = jobLevel;
		}
	},
	onAddPoints(gain) {
		let xpGain = gain;
		player[this.layer].xp = player[this.layer].xp.add(xpGain);
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
			"effectDescription": "Unlock a new feature in ??? job",
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
	clickables: {
		flowersGenerator: {
			title: "I hate manure!<br/>",
			display: () => `Generate <b>${format(getJobLevel("flowers").div(50))}</b> joules/s if collecting job is active.<br/>(based on collecting level)<br/><br/>Flowers gain is softcapped immediately and the job runs 10x slower.<br/><br/>Currently: <b>${player.generators.flowerActive ? "ACTIVE" : "INACTIVE"}</b>`,
			class: () => ({ "gradient-border": player.generators.flowerActive }),
			style: {
				width: "200px",
				height: "200px"
			},
			onClick() {
				player.generators.flowerActive = !player.generators.flowerActive;
			}
		},
		distillGenerator: {
			title: "Wait A Minute, Doc.<br/>",
			display: () => `Generate <b>${format(getJobLevel("distill").div(25))}</b> joules/s if distilling job is active.<br/>(based on distilling level)<br/><br/>Essentia gain is softcapped immediately and the job runs 10x slower.<br/><br/>Currently: <b>${player.generators.distillActive ? "ACTIVE" : "INACTIVE"}</b>`,
			class: () => ({ "gradient-border": player.generators.distillActive }),
			style: {
				width: "200px",
				height: "200px"
			},
			onClick() {
				player.generators.distillActive = !player.generators.distillActive;
			}
		},
		studyGenerator: {
			title: "Great Scott!<br/>",
			display: () => `Generate <b>${format(getJobLevel("study").div(10))}</b> joules/s if studying job is active.<br/>(based on studying level)<br/><br/>Properties gain is softcapped immediately and the job runs 10x slower.<br/><br/>Currently: <b>${player.generators.studyActive ? "ACTIVE" : "INACTIVE"}</b>`,
			class: () => ({ "gradient-border": player.generators.studyActive }),
			style: {
				width: "200px",
				height: "200px"
			},
			onClick() {
				player.generators.studyActive = !player.generators.studyActive;
			}
		},
		sandsGenerator: {
			title: "This is heavy!<br/>",
			display: () => `Generate <b>${format(getJobLevel("sands").div(5))}</b> joules/s if experiments job is active.<br/>(based on experimenting level)<br/><br/>Potentia gain is softcapped immediately and the job runs 10x slower.<br/><br/>Currently: <b>${player.generators.sandsActive ? "ACTIVE" : "INACTIVE"}</b>`,
			class: () => ({ "gradient-border": player.generators.sandsActive }),
			style: {
				width: "200px",
				height: "200px"
			},
			onClick() {
				player.generators.sandsActive = !player.generators.sandsActive;
			}
		},
		// TODO ritual generator
		// "Nobody Calls Me Chicken."
		flowers: getBatteryCharger("flowers", "History is gonna change.", "Collecting"),
		distill: getBatteryCharger("distill", "You disintegrated Einstein!"),
		study: getBatteryCharger("study", "I figured, what the hell?"),
		sands: getBatteryCharger("sands", "Ronald Reagan? The actor? Ha!", "Experiments"),
		generators: getBatteryCharger("generators", "Good night, future boy!"),
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
		cols: 4,
		11: {
			title: "1.21 Gigawatts!?!<br/>"
		},
		12: {
			title: "88 Miles Per Hour<br/>"
		},
		13: {
			title: "Where We’re Going, We Don’t Need Roads.<br/>"
		},
		14: {
			title: "I finally invent something that works!<br/>"
		},
		flowers: getBatteryCapBuyable("flowers", "History is gonna change."),
		distill: getBatteryCapBuyable("distill", "History is gonna change."),
		study: getBatteryCapBuyable("study", "History is gonna change."),
		sands: getBatteryCapBuyable("sands", "History is gonna change."),
		generators: getBatteryCapBuyable("generators", "History is gonna change."),
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
		let coords = new Array(numPoints).fill(1).map((_,i) => {
			let first = i == 0;
			let last = i == numPoints - 1;
			let y = (height - margin * 2) / (numPoints - 1) * i + margin;
			let x = (first || last) ? width / 2 : (width - amplitude) / 2 + Math.random() * amplitude;

			return { x, y };
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
