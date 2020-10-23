addLayer("s", {
    name: "school", // This is optional, only used in a few places, If absent it just uses the layer id.
    symbol: "S", // This appears on the layer's node. Default is the id with the first letter capitalized
    position: 2, // Horizontal position within a row. By default it uses the layer id and sorts in alphabetical order
    startData() { return {
        unlocked: false,
        total: new Decimal(0),
        points: new Decimal(0),
        classes: new Decimal(0),
        time: new Decimal(0),
        "auto-update": false,
        "auto-upgradehardware": false,
        "auto-experience": false,
        "auto-cash": false
    }},
    branches: [ 'e', 'c' ],
    color: "#917567",
    requires: new Decimal(1e6), // Can be a function that takes requirement increases into account
    base: new Decimal(8),
    resource: "enrollments", // Name of prestige currency
    baseResource: "experience", // Name of resource prestige is based on
    baseAmount() {return player.e.points}, // Get the current amount of baseResource
    type: "static", // normal: cost to gain currency depends on amount gained. static: cost depends on how much you already have
    exponent: 1.2, // Prestige currency exponent
    gainMult() { // Calculate the multiplier for main currency from bonuses
        mult = new Decimal(1)
        return mult
    },
    gainExp() { // Calculate the exponent on main currency from bonuses
        return new Decimal(1)
    },
    resetDescription: "Apply to another college for ",
    effect() {
        return new Decimal(1).add(new Decimal(0.05).mul(player.s.points))
    },
    effectDescription() {
        return `which raise your class effects to the ^${format(this.effect())} power.`
    },
    roundUpCost: true,
    row: 2, // Row the layer is in on the tree (0 is the first row)
    hotkeys: [
        {key: "s", description: "Apply for college", onPress(){if (canReset(this.layer)) doReset(this.layer)}},
    ],
    layerShown() { return player[this.layer].unlocked || (player.r.total.gte(1) && player.f.best.gte(1)) },
    milestones: {
        0: {
            requirementDescription: "1 class taken",
            effectDescription: "Retain all Update upgrades",
            done() { return player[this.layer].classes.gte(1) }
        },
        1: {
            requirementDescription: "2 classes taken",
            effectDescription: "Automatically reset Update layer",
            done() { return player[this.layer].classes.gte(2) },
            toggles: [["s", "auto-update"]]
        },
        2: {
            requirementDescription: "3 classes taken",
            effectDescription: "Automatically buy Upgrade Hardware every second",
            done() { return player[this.layer].classes.gte(3) },
            toggles: [["s", "auto-upgradehardware"]],
            unlocked() { return player[this.layer].classes.gte(1) }
        },
        3: {
            requirementDescription: "4 classes taken",
            effectDescription: "Retain Cash Revenue upgrades",
            done() { return player[this.layer].classes.gte(4) },
            unlocked() { return player[this.layer].classes.gte(2) }
        },
        4: {
            requirementDescription: "5 classes taken",
            effectDescription: "Automatically reset Experience and Cash layers every second<br/>(Recommended to only do 1 at a time)",
            done() { return player[this.layer].classes.gte(5) },
            toggles: [["s", "auto-experience"], ["s", "auto-cash"]],
            unlocked() { return player[this.layer].classes.gte(3) }
        }
    },
    buyables: {
        rows: 2,
        cols: 2,
        11: {
            title: "CS 1337 Computer Science",
            cost() { return getBuyableAmount("s", 11).add(6).pow10() },
            display() { return `Each class additively raises the effectiveness of experience on productivity to the power of +.025<br/><br/>Currently: ^${format(this.effect())}<br/><br/>Next upgrade cost: ${format(this.cost())} cash` },
            canAfford() { return player.c.points.gte(this.cost()) && player.s.total.gte(1) },
            effect() { return getBuyableAmount("s", 11).pow(layers.s.effect()).mul(0.025).add(1) },
            buy() {
                player.c.points = player.c.points.sub(this.cost())
                setBuyableAmount("s", 11, getBuyableAmount("s", 11).add(1))
                player[this.layer].classes = player[this.layer].classes.add(1)
            }
        },
        12: {
            title: "CS 2305 Discrete Math",
            cost() { return getBuyableAmount("s", 12).mul(2).add(8).pow10() },
            display() { return `Each class additively lowers the productivity slowdown modifier to the power of -.05<br/><br/>Currently: ^${format(this.effect())}<br/><br/>Next upgrade cost: ${format(this.cost())} cash` },
            canAfford() { return player.c.points.gte(this.cost()) },
            effect() { return getBuyableAmount("s", 12).pow(layers.s.effect()).mul(-0.05).add(1) },
            buy() {
                player.c.points = player.c.points.sub(this.cost())
                setBuyableAmount("s", 12, getBuyableAmount("s", 12).add(1))
                player[this.layer].classes = player[this.layer].classes.add(1)
            }
        },
        21: {
            title: "CS 3354 Software Engineering",
            cost() { return getBuyableAmount("s", 21).mul(3).add(9).pow10() },
            display() { return `Each class divides this layer's automation milestones interval by 1.5<br/><br/>Currently: /${format(this.effect())}<br/><br/>Next upgrade cost: ${format(this.cost())} cash` },
            canAfford() { return player.c.points.gte(this.cost()) },
            effect() { return new Decimal(1.5).pow(getBuyableAmount("s", 21).pow(layers.s.effect())) },
            buy() {
                player.c.points = player.c.points.sub(this.cost())
                setBuyableAmount("s", 21, getBuyableAmount("s", 21).add(1))
                player[this.layer].classes = player[this.layer].classes.add(1)
            }
        },
        22: {
            title: "CS 4352 Human Computer Interactions",
            cost() { return getBuyableAmount("s", 22).mul(4).add(10).pow10() },
            display() { return `Each class increases the effect of upgrading hardware by +.05<br/><br/>Currently: +${format(this.effect())}<br/><br/>Next upgrade cost: ${format(this.cost())} cash` },
            canAfford() { return player.c.points.gte(this.cost()) },
            effect() { return getBuyableAmount("s", 22).pow(layers.s.effect()).mul(0.05) },
            buy() {
                player.c.points = player.c.points.sub(this.cost())
                setBuyableAmount("s", 22, getBuyableAmount("s", 22).add(1))
                player[this.layer].classes = player[this.layer].classes.add(1)
            }
        }
    },
    tabFormat: [
        "main-display",
        "blank",
        "prestige-button",
        "blank",
        "buyables",
        "blank",
        ["display-text", function() { return `You've taken a total of ${format(player.s.classes)} classes` }],
        "milestones"
    ],
    update(diff) {
        if (hasMilestone("s", 1) && player.s["auto-update"] && canReset("u")) {
            doReset("u")
        }
        player.s.time = player.s.time.add(diff)
        if (player.s.time.gte(new Decimal(1).div(buyableEffect("s", 21)))) {
            player.s.time = new Decimal(0)
            if (hasMilestone("s", 2) && player.s["auto-upgradehardware"] && canAffordPurchase("c", layers.c.buyables[11], layers.c.buyables[11].cost())) {
                buyBuyable("c", 11)
            }
            if (hasMilestone("s", 4)) {
                if (player.s["auto-experience"] && canReset("e")) {
                    doReset("e")
                }
                if (player.s["auto-cash"] && canReset("c")) {
                    doReset("c")
                }
            }
        }
    },
    shouldNotify() {
        if (!player.s.unlocked) return false
        return canAffordPurchase("c", layers[this.layer].buyables[11], layers[this.layer].buyables[11].cost()) ||
               canAffordPurchase("c", layers[this.layer].buyables[12], layers[this.layer].buyables[12].cost()) ||
               canAffordPurchase("c", layers[this.layer].buyables[21], layers[this.layer].buyables[21].cost()) ||
               canAffordPurchase("c", layers[this.layer].buyables[22], layers[this.layer].buyables[22].cost())
    }
})