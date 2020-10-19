// Get color scheme from https://color.adobe.com/create/color-wheel

addLayer("u", {
    name: "updates", // This is optional, only used in a few places, If absent it just uses the layer id.
    symbol: "U", // This appears on the layer's node. Default is the id with the first letter capitalized
    position: 0, // Horizontal position within a row. By default it uses the layer id and sorts in alphabetical order
    startData() { return {
        unlocked: true,
        best: new Decimal(0),
		points: new Decimal(0),
    }},
    color: "#4BDC13",
    requires: new Decimal(5), // Can be a function that takes requirement increases into account
    base: new Decimal(5),
    resource: "updates", // Name of prestige currency
    baseResource: "hours of work", // Name of resource prestige is based on
    baseAmount() {return player.points}, // Get the current amount of baseResource
    type: "static", // normal: cost to gain currency depends on amount gained. static: cost depends on how much you already have
    exponent: 0.5, // Prestige currency exponent
    gainMult() { // Calculate the multiplier for main currency from bonuses
        mult = new Decimal(1)
        if (hasUpgrade("u", 21)) mult = mult.div(2)
        if (hasUpgrade("e", 11)) mult = mult.div(upgradeEffect("e", 11))
        return mult
    },
    gainExp() { // Calculate the exponent on main currency from bonuses
        return new Decimal(1)
    },
    canBuyMax() { return true },
    roundUpCost: true,
    row: 0, // Row the layer is in on the tree (0 is the first row)
    hotkeys: [
        {key: "u", description: "Release an update", onPress(){if (canReset(this.layer)) doReset(this.layer)}},
    ],
    layerShown(){return true},
    upgrades: {
        rows: 2,
        cols: 2,
        11: {
            title: "Convince your friend to help",
            description: "Double your productivity by convincing your friend to help with your game",
            cost: new Decimal(5),
            currencyDisplayName: "hours of work",
            currencyInternalName: "points",
            currencyLocation: ""
        },
        12: {
            title: "Create a github repo",
            description: "Increase your productivity by a massive 50% by opening the floodgates to countless open source developers",
            cost: new Decimal(1),
            unlocked() { return hasUpgrade("u", 11) }
        },
        21: {
            title: "Bug fixes count as updates, right?",
            description: "Double your update gain by counting the follow-up bug fixing patch as a separate update",
            cost: new Decimal(20),
            currencyDisplayName: "hours of work",
            currencyInternalName: "points",
            currencyLocation: "",
            unlocked() { return hasUpgrade("u", 11) }
        },
        22: {
            title: "Motivation Momentum",
            description: "Increase productivity by how many current updates have been released",
            cost: new Decimal(3),
            effect() { return player.u.points.add(1) },
            unlocked() { return hasUpgrade("u", 12) }
        }
    }
})

addLayer("e", {
    name: "exp", // This is optional, only used in a few places, If absent it just uses the layer id.
    symbol: "E", // This appears on the layer's node. Default is the id with the first letter capitalized
    position: 0, // Horizontal position within a row. By default it uses the layer id and sorts in alphabetical order
    startData() { return {
        unlocked: false,
        total: new Decimal(0),
        points: new Decimal(0),
        exp: new Decimal(0)
    }},
    branches: [ 'u' ],
    color: "#FF5642",
    requires: new Decimal(5), // Can be a function that takes requirement increases into account
    resource: "experience", // Name of prestige currency
    baseResource: "updates", // Name of resource prestige is based on
    baseAmount() {return player.u.points}, // Get the current amount of baseResource
    type: "normal", // normal: cost to gain currency depends on amount gained. static: cost depends on how much you already have
    exponent: 2, // Prestige currency exponent
    gainMult() { // Calculate the multiplier for main currency from bonuses
        mult = new Decimal(1)
        return mult
    },
    gainExp() { // Calculate the exponent on main currency from bonuses
        return new Decimal(1)
    },
    effect() { return player.e.points.sqrt().add(1) },
    resetDescription: "Start Over for ",
    effectDescription() { return `multiplying productivity by ${this.effect().toFixed(2)}. Your total experience is also delaying the productivity slow down by ${player[this.layer].total} hours.` },
    roundUpCost: true,
    row: 1, // Row the layer is in on the tree (0 is the first row)
    hotkeys: [
        {key: "e", description: "Start a new game idea", onPress(){if (canReset(this.layer)) doReset(this.layer)}},
    ],
    layerShown(){ return player.u.best.gte(3) || player[this.layer].total.gte(1) },
    upgrades: {
        rows: 2,
        cols: 3,
        11: {
            title: "Learn a new programming language",
            description: "Wow! This programming language is so much easier to write in! Total experience now effects update gain",
            cost: new Decimal(2),
            effect() { return player.e.total.log10().add(1) }
        },
        12: {
            title: "Contact publisher",
            description: "Use your experience to contact a publisher, unlocking an adjacent prestige layer",
            cost: new Decimal(10)
        },
        13: {
            title: "Contact ad company",
            description: "Use your experience to contact an ad provider, unlocking passive cash generation",
            cost: new Decimal(25),
            unlocked() { return hasMilestone("c", 0) }
        },
        21: {
            title: "Read Game Programming Patterns",
            description: "This treasure trove of a book makes me twice as productive",
            cost: new Decimal(100),
            unlocked() { return hasMilestone("c", 0) }
        },
        22: {
            title: "Subscribe to Sebastian Lague",
            description: "Just being subscribed infuses you with enough knowledge to make you twice as productive",
            cost: new Decimal(200),
            unlocked() { return hasMilestone("c", 0) }
        },
        23: {
            title: "Play Davey Wreden's games",
            description: "Davey Wreden's insights on the relationships between games and their creators and players make you once again twice as productive",
            cost: new Decimal(250),
            unlocked() { return hasMilestone("c", 0) }
        }
    }
})

addLayer("c", {
    name: "cash", // This is optional, only used in a few places, If absent it just uses the layer id.
    symbol: "C", // This appears on the layer's node. Default is the id with the first letter capitalized
    position: 1, // Horizontal position within a row. By default it uses the layer id and sorts in alphabetical order
    startData() { return {
        unlocked: false,
        total: new Decimal(0),
        points: new Decimal(0)
    }},
    branches: [ 'u' ],
    color: "#F5A833",
    requires: new Decimal(10), // Can be a function that takes requirement increases into account
    resource: "cash", // Name of prestige currency
    baseResource: "updates", // Name of resource prestige is based on
    baseAmount() {return player.u.points}, // Get the current amount of baseResource
    type: "normal", // normal: cost to gain currency depends on amount gained. static: cost depends on how much you already have
    exponent: 1.5, // Prestige currency exponent
    gainMult() { // Calculate the multiplier for main currency from bonuses
        mult = new Decimal(100)
        return mult
    },
    gainExp() { // Calculate the exponent on main currency from bonuses
        return new Decimal(1)
    },
    resetDescription: "Sell game to publisher for ",
    roundUpCost: true,
    row: 1, // Row the layer is in on the tree (0 is the first row)
    hotkeys: [
        {key: "c", description: "Sell your game", onPress(){if (canReset(this.layer)) doReset(this.layer)}},
    ],
    layerShown(){ return hasUpgrade("e", 12) || player[this.layer].total.gte(1) },
    milestones: {
        0: {
            requirementDescription: "1 total cash",
            effectDescription: "Unlock new experience upgrades",
            done() { return player[this.layer].total.gte(1) }
        }
    },
    buyables: {
        // TODO buyable to upgrade hardware, starting at 100 and doubling each time
        rows: 1,
        cols: 1,
        11: {
            title: "Upgrade hardware",
            cost() { return new Decimal(100).mul(new Decimal(2).pow(getBuyableAmount("c", 11))).round() },
            display() { return `Each upgrade raises your productivity by 1.05.<br/>Next upgrade cost: ${this.cost()} cash` },
            canAfford() { return player[this.layer].points.gte(this.cost()) },
            effect() { return new Decimal(1.05).pow(getBuyableAmount("c", 11)) },
            buy() {
                player[this.layer].points = player[this.layer].points.sub(this.cost())
                setBuyableAmount("c", 11, getBuyableAmount("c", 11).add(1))
            }
        }
    },
    upgrades: {
        rows: 1,
        cols: 2,
        11: {
            title: "Buy premium text editor",
            description: "Purchase a text editor, allowing you to double your productivity",
            cost: new Decimal(80)
        },
        12: {
            title: "Buy premium git client",
            description: "Purchase a git client, allowing you to double your productivity",
            cost: new Decimal(100)
        },
        // 1XX represents revenue upgrades
        // since they appear in a different tab they can have whatever id I want to give them,
        // because I'll be manually including them in a grid. Making them 1XX means they won't show up
        // in the normal grid of upgrades unless it gets 11 rows
        111: {
            title: "Add a banner ad",
            description: "Yum, a delicious $1 cpm, which equates to automatically earning .1% of cash gain per second",
            currencyDisplayName: "updates",
            currencyInternalName: "points",
            currencyLocation() { return player.u },
            cost: new Decimal(10),
            unlocked() { return hasUpgrade("e", 13) }
        },
        112: {
            title: "Add an interactive banner ad",
            description: "By adding interactivity to the banner ad you can earn an additional .2% of cash gain per second",
            currencyDisplayName: "updates",
            currencyInternalName: "points",
            currencyLocation() { return player.u },
            cost: new Decimal(20),
            unlocked() { return hasUpgrade("c", 111) }
        },
        113: {
            title: "Add pre-game ad",
            description: "Making players watch an ad before playing your game puts another .2% of cash gain per second directly in your pocket",
            currencyDisplayName: "updates",
            currencyInternalName: "points",
            currencyLocation() { return player.u },
            cost: new Decimal(30),
            unlocked() { return hasUpgrade("c", 112) }
        },
        114: {
            title: "Add an interstitial ad",
            description: "Placing ads between levels further engages the players and compensates you accordingly, earning an additional .5% of cash gain per second",
            currencyDisplayName: "updates",
            currencyInternalName: "points",
            currencyLocation() { return player.u },
            cost: new Decimal(40),
            unlocked() { return hasUpgrade("c", 113) }
        }
    },
    microtabs: {
        sections: {
            equipment: {
                content: [
                    "milestones",
                    "blank",
                    "buyables",
                    "blank",
                    "upgrades"
                ]
            },
            revenue: {
                content: [
                    ["row", [["upgrade", 111], ["upgrade", 112], ["upgrade", 113], ["upgrade", 114]]]
                ],
                unlocked() { return hasUpgrade("e", 13) }
            }
        }
    },
    tabFormat: [
        "main-display",
        ["display-text", function() { return hasUpgrade("e", 13) && tmp.c.resetGain.times ? `(${tmp.c.resetGain.times(layers.c.revenue(1)).toFixed(2)}/sec)` : "" }],
        "blank",
        "prestige-button",
        "blank",
        ["microtabs", "sections"]
    ],
    revenue(diff) {
        let cpm = 0
        if (hasUpgrade("c",111)) cpm += 1
        if (hasUpgrade("c",112)) cpm += 2
        if (hasUpgrade("c",113)) cpm += 2
        if (hasUpgrade("c",114)) cpm += 5
        return diff * cpm / 1000
    },
    update(diff) {
        generatePoints("c", this.revenue(diff))
    },
    shouldNotify() {
        return canAffordPurchase("c", layers[this.layer].buyables[11], layers[this.layer].buyables[11].cost())
    }
})

addLayer("r", {
    name: "refactors", // This is optional, only used in a few places, If absent it just uses the layer id.
    symbol: "R", // This appears on the layer's node. Default is the id with the first letter capitalized
    position: 1, // Horizontal position within a row. By default it uses the layer id and sorts in alphabetical order
    startData() { return {
        unlocked: false,
        total: new Decimal(0),
        points: new Decimal(0)
    }},
    branches: [ 'e' ],
    color: "#4CABF5",
    requires: new Decimal(500), // Can be a function that takes requirement increases into account
    base: new Decimal(500),
    resource: "refactors", // Name of prestige currency
    baseResource: "experience", // Name of resource prestige is based on
    baseAmount() {return player.e.points}, // Get the current amount of baseResource
    type: "static", // normal: cost to gain currency depends on amount gained. static: cost depends on how much you already have
    exponent: .25, // Prestige currency exponent
    gainMult() { // Calculate the multiplier for main currency from bonuses
        mult = new Decimal(1)
        return mult
    },
    gainExp() { // Calculate the exponent on main currency from bonuses
        return new Decimal(1)
    },
    canBuyMax() { return true },
    resetDescription: "Use all your experience to re-design your game framework for ",
    roundUpCost: true,
    row: 2, // Row the layer is in on the tree (0 is the first row)
    hotkeys: [
        {key: "r", description: "Re-design your game framework", onPress(){if (canReset(this.layer)) doReset(this.layer)}},
    ],
    layerShown(){ return false /*player.u.best.gte(50) || player[this.layer].total.gte(1)*/ }
})
