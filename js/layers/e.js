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
        mult = new Decimal(1).mul(buyableEffect("f", 13))
        return mult
    },
    gainExp() { // Calculate the exponent on main currency from bonuses
        return new Decimal(1)
    },
    effect() { return player.e.points.pow(buyableEffect("s", 11)).sqrt().add(1) },
    doReset(resettingLayer) {
        if (['r', 's'].includes(resettingLayer)) {
            const shouldKeepUpgrades = {
                11: hasMilestone("r", 2),
                12: hasMilestone("r", 0),
                13: hasMilestone("r", 0),
                21: hasMilestone("r", 4),
                22: hasMilestone("r", 5),
                23: hasMilestone("r", 6)
            }
            const upgradesToKeep = []
            for (let upgrade of player[this.layer].upgrades) {
                if (shouldKeepUpgrades[upgrade]) {
                    upgradesToKeep.push(upgrade)
                }
            }
            layerDataReset(this.layer)
            player[this.layer].upgrades = upgradesToKeep
        }
    },
    resetDescription: "Start Over for ",
    effectDescription() { return `multiplying base productivity by ${format(this.effect())}. Your total experience is also delaying the productivity slow down by ${format(player[this.layer].total.times(layers.r.effect()))} hours.` },
    roundUpCost: true,
    row: 1, // Row the layer is in on the tree (0 is the first row)
    hotkeys: [
        {key: "e", description: "Start a new game idea", onPress(){if (canReset(this.layer)) doReset(this.layer)}},
    ],
    layerShown(){ return player[this.layer].unlocked || player.u.best.gte(3) },
    upgrades: {
        rows: 2,
        cols: 3,
        11: {
            title: "Learn a new programming language",
            description: "Wow! This programming language is so much easier to write in! Total experience now effects update gain",
            cost: new Decimal(2),
            effect() { return player.e.total.times(layers.r.effect()).clampMin(1).log10().add(1) }
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
