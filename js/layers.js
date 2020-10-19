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
    exponent: 1.5, // Prestige currency exponent
    gainMult() { // Calculate the multiplier for main currency from bonuses
        mult = new Decimal(1)
        return mult
    },
    gainExp() { // Calculate the exponent on main currency from bonuses
        return new Decimal(1)
    },
    resetDescription: "Start Over for ",
    effectDescription() { return `multiplying productivity by ${player[this.layer].points.add(1)}. Your total experience is also delaying the productivity slow down by ${player[this.layer].total} hours.` },
    roundUpCost: true,
    row: 1, // Row the layer is in on the tree (0 is the first row)
    hotkeys: [
        {key: "e", description: "Start a new game idea", onPress(){if (canReset(this.layer)) doReset(this.layer)}},
    ],
    layerShown(){ return player.u.best.gte(3) || player[this.layer].total.gte(1) },
    upgrades: {
        rows: 1,
        cols: 2,
        11: {
            title: "Contact publisher",
            description: "Use your experience to contact a publisher, unlocking an adjacent prestige layer",
            cost: new Decimal(10)
        },
        12: {
            title: "Contact ad company",
            description: "Use your experience to contact an ad provider, unlocking passive cash generation (NOT YET IMPLEMENTED)",
            cost: new Decimal(25),
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
    layerShown(){ return hasUpgrade("e", 11) || player[this.layer].total.gte(1) },
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
        }
    }
    // TODO ad revenue tab
})
