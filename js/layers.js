addLayer("p", {
        name: "prestige", // This is optional, only used in a few places, If absent it just uses the layer id.
        symbol: "P", // This appears on the layer's node. Default is the id with the first letter capitalized
        position: 0, // Horizontal position within a row. By default it uses the layer id and sorts in alphabetical order
        startData() { return {
            unlocked: true,
			points: new Decimal(0),
        }},
        color: "#31aeb0",
        requires: new Decimal(10), // Can be a function that takes requirement increases into account
        resource: "prestige points", // Name of prestige currency
        baseResource: "points", // Name of resource prestige is based on
        baseAmount() {return player.points}, // Get the current amount of baseResource
        type: "normal", // normal: cost to gain currency depends on amount gained. static: cost depends on how much you already have
        exponent: 0.5, // Prestige currency exponent
        gainMult() { // Calculate the multiplier for main currency from bonuses
            mult = new Decimal(1)
			if (hasAchievement("a", 13)) mult = mult.times(1.1);
            return mult
        },
        gainExp() { // Calculate the exponent on main currency from bonuses
            return new Decimal(1)
        },
        row: 0, // Row the layer is in on the tree (0 is the first row)
        hotkeys: [
            {key: "p", description: "Reset for prestige points", onPress(){if (canReset(this.layer)) doReset(this.layer)}},
        ],
        layerShown(){return true},
		startData() { return {
			unlocked: false,
			points: new Decimal(0),
			best: new Decimal(0),
			total: new Decimal(0),
		}},
		upgrades: {
			rows: 1,
			cols: 3,
			11: {
				title: "Begin",
				description: "Generate 1 Point every second.",
				cost: new Decimal(1),
			},
			12: {
				title: "Prestige Boost",
				description: "Prestige Points boost Point generation.",
				cost: new Decimal(1),
				effect() {
					let eff = player.p.points.plus(2).pow(0.5);
					return eff;
				},
				unlocked() { return hasUpgrade("p", 11) },
				effectDisplay() { return format(this.effect())+"x" },
			},
			13: {
				title: "Self-Synergy",
				description: "Points boost their own generation.",
				cost: new Decimal(5),
				effect() { 
					let eff = player.points.plus(1).log10().pow(0.75).plus(1);
					return eff;
				},
				unlocked() { return hasUpgrade("p", 12) },
				effectDisplay() { return format(this.effect())+"x" },
			},
		},
})

addLayer("a", {
        startData() { return {
            unlocked: true,
        }},
        color: "yellow",
        row: "side",
        layerShown() {return true}, 
        tooltip() { // Optional, tooltip displays when the layer is locked
            return ("Achievements")
        },
        achievements: {
            rows: 1,
            cols: 3,
            11: {
                name: "All that progress is gone!",
                done() { return player.p.points.gt(0) },
                tooltip: "Perform a Prestige reset.",
            },
			12: {
				name: "Point Hog",
				done() { return player.points.gte(25) },
				tooltip: "Reach 25 Points.",
			},
			13: {
				name: "Prestige all the Way",
				done() { return player.p.upgrades.length>=3 },
				tooltip: "Purchase 3 Prestige Upgrades. Reward: Gain 10% more Prestige Points.",
			},
        },
        midsection: [
            "achievements",
        ]
    }, 
)