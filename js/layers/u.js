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
        mult = new Decimal(1).div(buyableEffect("f", 12))
        if (hasUpgrade("u", 21)) mult = mult.div(2)
        if (hasUpgrade("e", 11)) mult = mult.div(upgradeEffect("e", 11))
        return mult
    },
    gainExp() { // Calculate the exponent on main currency from bonuses
        return new Decimal(1)
    },
    canBuyMax() { return true },
    doReset(resettingLayer) { if (resettingLayer != 'u') layerDataReset(this.layer, hasMilestone("s", 0) ? [ 'upgrades', 'best' ] : [ 'best' ]) },
    resetDescription: "Release new build for ",
    roundUpCost: true,
    row: 0, // Row the layer is in on the tree (0 is the first row)
    hotkeys: [
        {key: "u", description: "Release an update", onPress(){if (canReset(this.layer)) doReset(this.layer)}},
    ],
    layerShown() { return true },
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