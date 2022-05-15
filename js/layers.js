addLayer("q", {
    name: "quarks", // This is optional, only used in a few places, If absent it just uses the layer id.
    symbol: "Q", // This appears on the layer's node. Default is the id with the first letter capitalized
    position: 0, // Horizontal position within a row. By default it uses the layer id and sorts in alphabetical order
    startData() { return {
        unlocked: true,
        points: new Decimal(0),
    }},
    color: "#BBBBBB",
    requires: new Decimal(10), // Can be a function that takes requirement increases into account
    resource: "quarks", // Name of prestige currency
    baseResource: "particles", // Name of resource prestige is based on
    baseAmount() {return player.points}, // Get the current amount of baseResource
    type: "normal", // normal: cost to gain currency depends on amount gained. static: cost depends on how much you already have
    exponent: 0.5, // Prestige currency exponent
    gainMult() { // Calculate the multiplier for main currency from bonuses
        mult = new Decimal(1)
        return mult
    },
    gainExp() { // Calculate the exponent on main currency from bonuses
        return new Decimal(1)
    },
    row: 0, // Row the layer is in on the tree (0 is the first row)
    hotkeys: [
        {key: "q", description: "Q: Reset for quarks", onPress(){if (canReset(this.layer)) doReset(this.layer)}},
    ],
    layerShown(){return true},
    upgrades: {
        11: {
            name: "Faster Particles",
            description: 'Triple particle gain.',
            cost: new Decimal(2),
        },
        12: {
            name: 'THe J',
            description: 'Wifjfijij',
            cost: new Decimal(2),
            effect() {
                return player[this.layer].points.add(1).pow(0.5)
            },
            effectDisplay() {return format(upgradeEffect(this.layer, this.id)) + 'x'},
        },
    },
})
