function createCard(title, description = "", onDraw = null, modifyNextCard = null) {
	return {title, description, onDraw, modifyNextCard};
}

const cardLevel = (card) => {
	return (getBuyableAmount("study", card) || new Decimal(0)).add(player.study.deep);
};

const cards = {
	nothing: createCard("His job is not to wield power but to draw attention away from it.", "Do nothing."),
	gainPoints: createCard("Don't Panic.", level => `Successfully study ${format(getResetGain("study").times(level.add(1)))} properties.`, level => addPoints("study", getResetGain("study").times(level.add(1)))),
	gainBigPoints: createCard("In his experience the Universe simply didn't work like that.", level => `Successfully study ${format(getResetGain("study").times(level.add(1)).pow(1.2))} properties. Destroy this card.`, (level, canDestroy = true) => {
		addPoints("study", getResetGain("study").times(level.add(1)).pow(1.2));
		if (canDestroy) {
			player.study.cards.gainBigPoints = player.study.cards.gainBigPoints - 1;
		}
	}),
	gainInsight: createCard("And it shall be called... the Earth.", level => level === 0 ? "Gain a key insight." : `Gain ${formatWhole(level.add(1))} key insights.`, level => {
		player.study.insights = player.study.insights.add(level).add(1);
		gainStudyXp(level.add(1).times(10));
		checkJobXP("study");
	}),
	gainBigInsight: createCard("Yes! I shall design this computer for you.", level => `Gain ${new Decimal(getCardAmount()).times(level.add(1)).sqrt().floor()} key insights.<br/>(based on number of cards in the deck)`, level => {
		const amount = new Decimal(getCardAmount()).times(level.add(1)).sqrt().floor();
		player.study.insights = player.study.insights.add(amount);
		gainStudyXp(amount.times(10));
		checkJobXP("study");
	}),
	playTwice: createCard("Oh no, not again.", level => level.eq(0) ? "Play the next card twice." : `Play the next card twice, with the effect boosted by ${level.div(4)} levels.`, null, (nextCard, level) => {
		if (nextCard in cards && cards[nextCard].onDraw) {
			cards[nextCard].onDraw(cardLevel(nextCard).add(level.div(4)));
			cards[nextCard].onDraw(cardLevel(nextCard).add(level.div(4)), false);
		}
	}),
	increasePointsGain: createCard("Have another drink, enjoy yourself.", level => `Permanently increase studied properties gain by ${formatWhole(new Decimal(25).times(Decimal.pow(1.25, level)))}%.<br/><br/>Currently: +${formatWhole(player.study.increasePointsGain.times(new Decimal(25).times(Decimal.pow(1.25, level))))}%`, () => player.study.increasePointsGain = player.study.increasePointsGain.add(1)),
	multiplyPointsGain: createCard("Reality is frequently inaccurate.", level => {
		const scale = new Decimal(1.02).add(level.add(1).sqrt().div(100));
		const effect = scale.pow(softcap(player.study.multiplyPointsGain, new Decimal(100).times(level.div(4).add(1)), .2));
		let text = `Permanently multiply studied properties gain by x${format(scale)}<br/><br/>Currently: x${format(effect)}`;
		if (player.study.multiplyPointsGain.gt(new Decimal(100).times(level.div(4).add(1)))) {
			text = text + "<br/>(softcapped)";
		}
		return text;
	}, () => player.study.multiplyPointsGain = player.study.multiplyPointsGain.add(1)),
	sellDiscount: createCard("It doesn't grow on trees you know.", level => {
		const effect = new Decimal(0.98).pow(softcap(player.study.sellDiscount, new Decimal(100).times(level.div(2).add(1)), .5));
		let text = `Permanently multiply sell cost by 0.98<br/><br/>Currently: x${format(effect)}`;
		if (player.study.sellDiscount.gt(new Decimal(100).times(level.div(2).add(1)))) {
			text = text + "<br/>(softcapped)";
		}
		return text;
	}, () => player.study.sellDiscount = player.study.sellDiscount.add(1)),
	soldOut: createCard("Out of Stock!"),
	gainXp: createCard("A billion times over ... and no one learns anything.", level => `Gain xp equal to ${level.eq(0) ? "" : `${format(level.div(4).add(1))}x times `}your number of properties.`, level => {
		gainStudyXp(player.study.points.times(level.div(4).add(1)));
		checkJobXP("study");
	}),
	increaseXpGain: createCard("There's a whole new <i>Guide</i>!", level => `Permanently increase this job's xp gain by ${formatWhole(new Decimal(10).times(Decimal.pow(1.5, level)))}%.<br/><br/>Currently: +${formatWhole(player.study.increaseXpGain.times(new Decimal(10).times(Decimal.pow(1.5, level))))}%`, () => player.study.increaseXpGain = player.study.increaseXpGain.add(1))
};

const shopCards = [
	{card: "gainPoints", price: 1},
	{card: "gainInsight", price: 0},
	{card: "gainBigPoints", price: 8},
	{card: "gainBigInsight", price: 13},
	{card: "playTwice", price: 16},
	{card: "increasePointsGain", price: 6},
	{card: "multiplyPointsGain", price: 18},
	{card: "sellDiscount", price: 14},
	{card: "gainXp", price: 25},
	{card: "increaseXpGain", price: 12},
];

const baseCards = () => {
	return { nothing: 4, gainPoints: 4, gainInsight: 2 };
};

const getShop = (numCards = 3) => {
	return new Array(numCards).fill(1).map(() => shopCards[Math.floor(Math.random() * shopCards.length)]);
};

Vue.component("card", {
	props: ["layer", "data"], // data is object with card, id, className, onclick, overrideLevel, width, height, and note
	template: `<div class="upgCol">
		<div :id="data.id" class="card" :class="{ [data.className]: true }" :style="{ width: data.width || '200px', height: data.height || '300px' }" v-on:click="onclick">
			<span style="border-bottom: 1px solid white; margin: 0; max-height: calc(50% - 30px); padding-bottom: 10px;">
				<h3 v-html="title"></h3>
			</span>
			<span style="flex-basis: 0;"><span v-html="description"></span></span>
			<span style="flex-shrink: 1"></span>
			<img src="images/Time2wait.svg" alt="hourglass"/>
		</div>
		<div class="card-note" v-if="data.note != null">{{ data.note }}</div>
	</div>`,
	computed: {
		title() {
			return isFunction(cards[this.data.card].title) ? cards[this.data.card].title(overrideLevel || cardLevel(this.data.card)) : cards[this.data.card].title;
		},
		description() {
			return isFunction(cards[this.data.card].description) ? cards[this.data.card].description(this.data.overrideLevel || cardLevel(this.data.card)) : cards[this.data.card].description;
		}
	},
	methods: {
		onclick() {
			if (this.data.onclick) {
				this.data.onclick();
			}
		}
	}
});

function getCardUpgradeBuyable(id) {
	const cost = x => {
		const amount = x || getBuyableAmount("study", id);
		return new Decimal(100).pow(amount.add(1));
	};
	return {
		title: "Upgrade<br/>",
		style: {
			width: "100px",
			height: "100px",
			marginLeft: "10px"
		},
		display() {
			return `Level ${formatWhole(cardLevel(id))}<br/><br/>${format(cost())} insights`;
		},
		canAfford() {
			return player.study.insights.gte(cost());
		},
		buy() {
			player.study.insights = player.study.insights.sub(cost());
			setBuyableAmount("study", id, getBuyableAmount("study", id).add(1));
		},
		unlocked: () => id in player.study.cards && hasMilestone("study", 3)
	};
}

function getCardAmount() {
	return Object.values(player.study.cards).reduce((acc, curr) => acc + curr, 0);
}

// noinspection JSUnusedGlobalSymbols
function purchaseCard(index) {
	const {card, price} = player.study.shop[index];
	if (card && player.study.insights.gte(price) && getCardAmount() < 30) {
		player.study.insights = player.study.insights.sub(price);
		player.study.shop[index] = {card: null, price: ""};
		player.study.cards[card] = (player.study.cards[card] || 0) + 1;
	}
}

// noinspection JSUnusedGlobalSymbols
function toggleSelectCard(index) {
	if (player.study.selected === index) {
		player.study.selected = -1;
	} else {
		player.study.selected = index;
	}
}

function getDrawDuration() {
	let drawSpeed = new Decimal(10);
	drawSpeed = drawSpeed.div(new Decimal(1.1).pow(getJobLevel("study")));
	drawSpeed = drawSpeed.times(new Decimal(2).pow(player.study.deep));
	if (player.generators.studyActive && (player.tab === "generators" || player.generators.timeLoopActive)) {
		drawSpeed = drawSpeed.times(10);
	}
	return drawSpeed;
}

function getRefreshDraws() {
	let refreshDraws = new Decimal(12);
	return refreshDraws;
}

function gainStudyXp(xpGain) {
	if (hasUpgrade("generators", 13)) {
		xpGain = xpGain.times(layers.generators.clickables.study.effect());
	}
	xpGain = xpGain.times(player.study.increaseXpGain.times(new Decimal(.1).times(Decimal.pow(1.5, cardLevel("increaseXpGain")))).add(1));
	xpGain = xpGain.times(ritualEffect("globalXp"));
	player.study.xp = player.study.xp.add(xpGain);
	checkJobXP("study");
}

function drawNextCard() {
	player.study.drawProgress = 0;
	let random = Math.random() * Object.values(player.study.cards).reduce((acc, curr) => acc + curr);
	const ownedCards = Object.keys(player.study.cards);
	let newCard = null;
	for (let i = 0; i < ownedCards.length; i++) {
		if (random < player.study.cards[ownedCards[i]]) {
			newCard = ownedCards[i];
			break;
		}
		random -= player.study.cards[ownedCards[i]];
	}
	if (newCard) {
		if (player.study.lastCard && player.study.lastCard in cards && cards[player.study.lastCard].modifyNextCard) {
			cards[player.study.lastCard].modifyNextCard(newCard, cardLevel(newCard));
		} else if (cards[newCard].onDraw) {
			cards[newCard].onDraw(cardLevel(newCard));
		}
		player.study.lastCard = newCard;
		const card = document.getElementById("mainCard");
		if (card != null) {
			card.classList.remove("flipCard");
			void card.offsetWidth;
			card.classList.add("flipCard");
		}

		if (hasMilestone("study", 0)) {
			player.study.refreshProgress++;
		}
		if (player.study.refreshProgress >= getRefreshDraws()) {
			player.study.refreshProgress = 0;
			player.study.shop = getShop();
			for (let card of document.getElementsByClassName("shopCard")) {
				if (card != null) {
					card.classList.remove("flipCard");
					void card.offsetWidth;
					card.classList.add("flipCard");
				}
			}
			if (player.study.notifs) {
				doPopup("none", "Shop restocked", "Check it out!", 1, layers.study.color);
			}
		}
	}
}

addLayer("study", {
	name: "study",
	resource: "properties studied",
	image: "images/orchid_sketch.jpg",
	color: studyColor,
	jobName: "Study flowers",
	showJobDelay: 0.5,
	layerShown: () => hasMilestone("distill", 2),
	startData() {
		return {
			unlocked: true,
			points: new Decimal(0),
			insights: new Decimal(0),
			total: new Decimal(0),
			xp: new Decimal(0),
			lastLevel: new Decimal(0),
			timeLoopActive: false,
			drawProgress: 0,
			refreshProgress: 0,
			cards: baseCards(),
			lastCard: null,
			shop: getShop(),
			notifs: true,
			increasePointsGain: new Decimal(0),
			multiplyPointsGain: new Decimal(0),
			increaseXpGain: new Decimal(0),
			sellDiscount: new Decimal(0),
			cardsSold: new Decimal(0),
			selected: -1,
			deep: new Decimal(0)
		};
	},
	getResetGain() {
		if (!tmp[this.layer].layerShown || (player.tab !== this.layer && !player[this.layer].timeLoopActive)) {
			return new Decimal(0);
		}
		let gain = new Decimal(10);
		gain = gain.times(player.study.increasePointsGain.times(new Decimal(.25).times(Decimal.pow(1.25, cardLevel("increasePointsGain")))).add(1));
		gain = gain.times(new Decimal(1.02).pow(softcap(player.study.multiplyPointsGain, new Decimal(100).times(cardLevel("multiplyPointsGain").div(4).add(1)), .2)));
		gain = gain.times(layers.generators.clickables[this.layer].effect());
		gain = gain.times(ritualEffect("gain"));
		if (player.generators.studyActive && (player.tab === "generators" || player.generators.timeLoopActive)) {
			gain = gain.sqrt();
		}
		return gain;
	},
	tabFormat: {
		"Main": {
			content: () => {
				if (player.tab !== "study") {
					return null;
				}
				const drawDuration = getDrawDuration();
				return [
					["sticky", [0, ["row", [["bar", "job"], ["display-text", `<span style="margin-left: 20px;">Lv. ${getJobLevel("study")}</span>`]]]]],
					"blank",
					["sticky", ["36px", ["display-text", `<span>You have <h2 style="color: ${studyColor}; text-shadow: ${studyColor} 0 0 10px">${formatWhole(player.study.points)}</h2> properties studied,<br/>and <h2 style="color: darkcyan; text-shadow: darkcyan 0 0 10px">${formatWhole(player.study.insights)}</h2> key insights</span>`]]],
					"blank",
					["display-text", (() => {
						if (!hasMilestone("study", 0)) {
							return "Discover new ways to harness the power of the cards at level 2";
						}
						if (!hasMilestone("study", 1)) {
							return "Discover new ways to harness the power of the cards at level 4";
						}
						if (!hasMilestone("study", 3)) {
							return "Discover new ways to harness the power of the cards at level 6";
						}
						if (!hasMilestone("study", 4)) {
							return "Discover new ways to harness the power of the cards at level 8";
						}
						return "";
					})()],
					"blank",
					["display-text", `Next card will auto-draw in ${new Decimal(drawDuration - player.study.drawProgress).clampMax(drawDuration - 0.01).toFixed(2)} seconds<br/>`],
					["display-text", drawDuration / 10 > player.study.drawProgress ? `You can manually draw next card in ${new Decimal(drawDuration / 10 - player.study.drawProgress).clampMax(drawDuration / 10 - 0.01).toFixed(2)} seconds` : `You can manually draw the next card NOW`],
					"blank",
					["card", { card: player.study.lastCard, id: "mainCard", className: "flipCard" }],
					"blank",
					["clickable", "manual"],
					"blank",
					["milestones-filtered", [2, 5, 6]]
				];
			}
		},
		"Deck": {
			content: () => player.tab !== "study" ? null : [
				["sticky", [0, ["row", [["bar", "job"], ["display-text", `<span style="margin-left: 20px;">Lv. ${getJobLevel("study")}</span>`]]]]],
				"blank",
				["clickable", "reset"],
				"blank",
				["row", Object.entries(player.study.cards).map(([card, amount]) => ["card", { card, note: amount }])]
			]
		},
		"Buy Cards": {
			content: () => player.tab !== "study" ? null : [
				["sticky", [0, ["row", [["bar", "job"], ["display-text", `<span style="margin-left: 20px;">Lv. ${getJobLevel("study")}</span>`]]]]],
				"blank",
				["sticky", ["36px", ["display-text", `<span>You have <h2 style="color: darkcyan; text-shadow: darkcyan 0 0 10px">${formatWhole(player.study.insights)}</h2> key insights</span>`]]],
				"blank",
				["row", [
					["display-text", "Shop Refresh Notifications"],
					"blank",
					["toggle", ["study", "notifs"]]
				]],
				"blank",
				["display-text", `Cards refresh in ${getRefreshDraws() - player.study.refreshProgress} draws`],
				"blank",
				["display-text", `Your deck has ${getCardAmount()} out of the 30 card limit.`],
				"blank",
				["row", player.study.shop.map(({card, price}, i) =>
					["column", [
						card == null ? ["card", { card: "soldOut" }] : ["card", { card, className: "shopCard flipCard", onclick: () => purchaseCard(i) }],
						["display-text", `<div class='card-note'>${card in player.study.cards ? player.study.cards[card] : card == null ? '' : 'New!'}</div>`],
						"blank",
						["display-text", `<h2 style="color: darkcyan; text-shadow: darkcyan 0 0 10px">${card == null ? "​" /*zero width space*/ : formatWhole(price)}</h2>`]
					], {
						margin: "auto 10px 20px",
						cursor: "pointer",
						opacity: card != null && player.study.insights.gte(price) ? 1 : 0.5
					}]), {width: "100%"}]
			],
			unlocked: () => hasMilestone("study", 0)
		},
		"Destroy Cards": {
			content: () => player.tab !== "study" ? null : [
				["sticky", [0, ["row", [["bar", "job"], ["display-text", `<span style="margin-left: 20px;">Lv. ${getJobLevel("study")}</span>`]]]]],
				"blank",
				["sticky", ["36px", ["display-text", `<span>You have <h2 style="color: ${studyColor}; text-shadow: ${studyColor} 0 0 10px">${formatWhole(player.study.points)}</h2> properties studied`]]],
				"blank",
				["sticky", ["86px", ["clickable", "sell"]]],
				"blank",
				["row", Object.entries(player.study.cards).map(([card, amount]) => ["card", { card, note: amount, className: player.study.selected === card ? "selectedCard cursor" : "cursor", onclick: () => toggleSelectCard(card) }]), {width: "100%"}]
			],
			unlocked: () => hasMilestone("study", 1)
		},
		"Upgrade Cards": {
			content: () => player.tab !== "study" ? null : [
				["sticky", [0, ["row", [["bar", "job"], ["display-text", `<span style="margin-left: 20px;">Lv. ${getJobLevel("study")}</span>`]]]]],
				"blank",
				["sticky", ["36px", ["display-text", `<span>You have <h2 style="color: darkcyan; text-shadow: darkcyan 0 0 10px">${formatWhole(player.study.insights)}</h2> key insights`]]],
				"blank",
				hasMilestone("study", 4) ? ["column", [
					["display-text", `Deep Thought is currently giving <span style="text-shadow: white 0 0 10px">${formatWhole(player.study.deep)}</span> bonus levels to every card,<br/>but makes each draw take <span style="text-shadow: white 0 0 10px">${formatWhole(new Decimal(2).pow(player.study.deep))}x</span> longer due to processing time.<br/><br/>You cannot add more bonus levels than your level at this job.`],
					"blank",
					["row", [
						["clickable", "deep0"],
						"blank",
						["clickable", "deep-"],
						"blank",
						["clickable", "deep+"],
						"blank",
						["clickable", "deepMax"]
					]],
					"blank"
				]] : null,
				["column", Object.keys(player.study.cards).filter(card => card in layers.study.buyables).map(card => ["row", [
					["card", { card }],
					["display-text", "〉〉", {fontSize: "36px", margin: "10px"}],
					["card", { card, overrideLevel: cardLevel(card).add(1) }],
					["buyable", card]
				]])]
			],
			unlocked: () => hasMilestone("study", 3),
			shouldNotify: () => Object.values(tmp.study.buyables).some(buyable => buyable.unlocked && buyable.canAfford)
		}
	},
	update(diff) {
		if (player.tab === this.layer || player[this.layer].timeLoopActive) {
			if (player.generators.studyActive && (player.tab === "generators" || player.generators.timeLoopActive)) {
				diff = diff / 10;
			}
			player[this.layer].drawProgress += diff;
			// TODO draws/sec
			if (player[this.layer].drawProgress > getDrawDuration()) {
				drawNextCard();
			}
		}
	},
	onAddPoints(gain) {
		gainStudyXp(gain);
	},
	milestones: {
		0: {
			requirementDescription: "Level 2",
			done: () => player.study.xp.gte(10)
		},
		1: {
			requirementDescription: "Level 4",
			done: () => player.study.xp.gte(1e3)
		},
		2: {
			title: "And all dared to brave unknown terrors, to do mighty deeds,",
			requirementDescription: "Level 5",
			"effectDescription": "Unlock a time loop",
			done: () => player.study.xp.gte(1e4),
			onComplete: () => {
				player.timeSlots = player.timeSlots.add(1);
			}
		},
		3: {
			requirementDescription: "Level 6",
			done: () => player.study.xp.gte(1e5)
		},
		4: {
			requirementDescription: "Level 8",
			done: () => player.study.xp.gte(1e7)
		},
		5: {
			title: "to boldly split infinitives that no man had split before—",
			requirementDescription: "Level 10",
			"effectDescription": "Unlock generators job",
			done: () => player.study.xp.gte(1e9),
			unlocked: () => hasMilestone("study", 2)
		},
		6: {
			title: "and thus was the Empire forged.",
			requirementDescription: "Level 25",
			"effectDescription": "Unlock ???",
			done: () => player.study.xp.gte(1e24) && player.chapter > 2,
			unlocked: () => hasMilestone("study", 5) && player.chapter > 2
		}
	},
	clickables: {
		manual: {
			title: "Think before you pluck. Irresponsible plucking costs lives.",
			display: "Draw next card",
			canClick: () => getDrawDuration() / 10 < player.study.drawProgress,
			onClick: drawNextCard
		},
		reset: {
			title: "RESET DECK",
			style: {
				background: "#dc3545"
			},
			display: "Reset your deck to the basic starter deck. Resets destroyed cards and played cards counts. Does not reset the rest of this job.",
			canClick: true,
			onClick: () => {
				if (confirm("Are you sure you want to reset your deck to the starter deck?")) {
					player.study.cards = baseCards();
					player.study.cardsSold = new Decimal(0);
					player.study.lastCard = null;
					player.study.increasePointsGain = new Decimal(0);
					player.study.multiplyPointsGain = new Decimal(0);
					player.study.increaseXpGain = new Decimal(0);
					player.study.sellDiscount = new Decimal(0);
				}
			}
		},
		sell: {
			title: "They obstinately persisted in their absence.<br/>",
			style: {
				width: "200px",
				height: "200px"
			},
			display() {
				return `Remove a card from your deck. Cost multiplies by 10 for each card manually destroyed.<br/><br/>Cost: ${formatWhole(this.cost())} properties studied`;
			},
			cost(x) {
				let cost = new Decimal(500).times(new Decimal(10).pow(player[this.layer].cardsSold));
				cost = cost.times(new Decimal(0.98).pow(softcap(player.study.sellDiscount, new Decimal(100).times(cardLevel("multiplyPointsGain").div(4).add(1)), .5)));
				return cost;
			},
			canClick() {
				if (!(player.study.selected in player.study.cards)) {
					return false;
				}
				if (player.study.cards[player.study.selected] <= 0) {
					return false;
				}
				return player[this.layer].points.gte(this.cost());
			},
			onClick() {
				player[this.layer].points = player[this.layer].points.sub(this.cost());
				player[this.layer].cardsSold = player[this.layer].cardsSold.add(1);
				player[this.layer].cards[player[this.layer].selected] = (player[this.layer].cards[player[this.layer].selected] || 0) - 1;
				if (player[this.layer].cards[player[this.layer].selected] <= 0) {
					delete player[this.layer].cards[player[this.layer].selected];
					player[this.layer].selected = -1;
				}
			},
			unlocked: () => hasMilestone("study", 1),
			layer: "study"
		},
		"deep0": {
			title: "0",
			style: {
				width: "60px",
				minHeight: "60px"
			},
			canClick: () => player.study.deep.neq(0),
			onClick: () => {
				player.study.deep = new Decimal(0);
			}
		},
		"deep-": {
			title: "- 1",
			style: {
				width: "60px",
				minHeight: "60px"
			},
			canClick: () => player.study.deep.gt(0),
			onClick: () => {
				player.study.deep = player.study.deep.sub(1);
			}
		},
		"deep+": {
			title: "+ 1",
			style: {
				width: "60px",
				minHeight: "60px"
			},
			canClick: () => player.study.deep.lt(getJobLevel("study")),
			onClick: () => {
				player.study.deep = player.study.deep.add(1);
			}
		},
		"deepMax": {
			title: () => formatWhole(getJobLevel("study")),
			style: {
				width: "60px",
				minHeight: "60px"
			},
			canClick: () => player.study.deep.neq(getJobLevel("study")),
			onClick: () => {
				player.study.deep = getJobLevel("study");
			}
		}
	},
	buyables: {
		gainPoints: getCardUpgradeBuyable("gainPoints"),
		gainBigPoints: getCardUpgradeBuyable("gainBigPoints"),
		gainInsight: getCardUpgradeBuyable("gainInsight"),
		gainBigInsight: getCardUpgradeBuyable("gainBigInsight"),
		playTwice: getCardUpgradeBuyable("playTwice"),
		increasePointsGain: getCardUpgradeBuyable("increasePointsGain"),
		multiplyPointsGain: getCardUpgradeBuyable("multiplyPointsGain"),
		sellDiscount: getCardUpgradeBuyable("sellDiscount"),
		gainXp: getCardUpgradeBuyable("gainXp"),
		increaseXpGain: getCardUpgradeBuyable("increaseXpGain"),
	},
	bars: {
		job: getJobProgressBar("study", studyColor)
	}
});

// Names references:
// https://www.shmoop.com/study-guides/literature/hitchhikers-guide-to-the-galaxy/quotes
// https://en.wikiquote.org/wiki/The_Hitchhiker's_Guide_to_the_Galaxy
