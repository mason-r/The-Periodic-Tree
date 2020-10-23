addLayer("f", {
    name: "fame", // This is optional, only used in a few places, If absent it just uses the layer id.
    symbol: "F", // This appears on the layer's node. Default is the id with the first letter capitalized
    position: 3, // Horizontal position within a row. By default it uses the layer id and sorts in alphabetical order
    startData() { return {
        unlocked: false,
        best: new Decimal(0),
        points: new Decimal(0),
        fans: new Decimal(1)
    }},
    branches: [ 'c' ],
    color: "#F564E7",
    requires: new Decimal(2500), // Can be a function that takes requirement increases into account
    base: new Decimal(4),
    resource: "fame", // Name of prestige currency
    baseResource: "cash", // Name of resource prestige is based on
    baseAmount() {return player.c.points}, // Get the current amount of baseResource
    type: "static", // normal: cost to gain currency depends on amount gained. static: cost depends on how much you already have
    exponent: 1.25, // Prestige currency exponent
    gainMult() { // Calculate the multiplier for main currency from bonuses
        mult = new Decimal(1)
        return mult
    },
    gainExp() { // Calculate the exponent on main currency from bonuses
        return new Decimal(1)
    },
    canBuyMax() { return true },
    resetDescription: "Elevate your social status by ",
    effect() {
        return {
            doubleFrequency: new Decimal(60).div(player[this.layer].points).clampMin(1).log2().div(buyableEffect("f", 11).add(1)),
            productivityMult: player[this.layer].fans.clampMin(10).log10(),
            fanMult: buyableEffect("f", 11),
            cashMult: buyableEffect("f", 12),
            expMult: buyableEffect("f", 13),
            upgMult: buyableEffect("f", 14)
        }
    },
    effectDescription() {
        return player[this.layer].points.lessThan(1) ? "" : `which double your amount of fans every ${format(this.effect().doubleFrequency)} seconds.`
    },
    tabFormat: [
        "main-display",
        ["display-text", function() {
            const { productivityMult, fanMult, cashMult, expMult, upgMult } = layers.f.effect()
            let text = `<br/>You currently have ${format(player.f.fans.floor())} fans, which currently:`
            text += `<br/>Multiplies productivity by ${format(productivityMult)}x`
            if (getBuyableAmount("f", 11).gte(1)) text += `<br/>Multiplies fan gain by ${format(fanMult)}x due to discord`
            if (getBuyableAmount("f", 12).gte(1)) text += `<br/>Multiplies cash gain by ${format(cashMult)}x due to patreon`
            if (getBuyableAmount("f", 13).gte(1)) text += `<br/>Multiplies experience gain by ${format(expMult)}x due to twitch`
            if (getBuyableAmount("f", 14).gte(1)) text += `<br/>Multiplies update gain by ${format(upgMult)}x due to github`
            return text
        }],
        "blank",
        "prestige-button",
        "blank",
        "buyables",
        "blank",
        "milestones"
    ],
    roundUpCost: true,
    row: 2, // Row the layer is in on the tree (0 is the first row)
    hotkeys: [
        {key: "f", description: "Elevate your social status", onPress(){if (canReset(this.layer)) doReset(this.layer)}},
    ],
    layerShown() { return player[this.layer].unlocked || player.u.best.gte(30) },
    update(diff) {
        if (player[this.layer].points.gte(1)) {
            player[this.layer].fans = player[this.layer].fans.mul(new Decimal(2).pow(new Decimal(diff).div(this.effect().doubleFrequency)))
        }
    },
    milestones: {
        0: {
            requirementDescription: "1 fame",
            effectDescription: "Retain the first equipment upgrade",
            done() { return player[this.layer].best.gte(1) }
        },
        1: {
            requirementDescription: "2 fame",
            effectDescription: "Retain the second equipment upgrade",
            done() { return player[this.layer].best.gte(2) }
        },
        2: {
            requirementDescription: "3 fame",
            effectDescription: "Retain the third equipment upgrade",
            done() { return player[this.layer].best.gte(3) },
            unlocked() { return player[this.layer].best.gte(1) }
        },
        3: {
            requirementDescription: "4 fame",
            effectDescription: "Retain the fourth equipment upgrade",
            done() { return player[this.layer].best.gte(4) },
            unlocked() { return player[this.layer].best.gte(2) }
        },
        4: {
            requirementDescription: "5 fame",
            effectDescription: "Retain the fifth equipment upgrade",
            done() { return player[this.layer].best.gte(5) },
            unlocked() { return player[this.layer].best.gte(3) }
        },
        5: {
            requirementDescription: "6 fame",
            effectDescription: "Retain the sixth equipment upgrade",
            done() { return player[this.layer].best.gte(6) },
            unlocked() { return player[this.layer].best.gte(4) }
        },
        6: {
            requirementDescription: "7 fame",
            effectDescription: "Retain the seventh equipment upgrade",
            done() { return player[this.layer].best.gte(7) },
            unlocked() { return player[this.layer].best.gte(5) }
        },
        7: {
            requirementDescription: "8 fame",
            effectDescription: "Retain the eigth equipment upgrade",
            done() { return player[this.layer].best.gte(8) },
            unlocked() { return player[this.layer].best.gte(6) }
        }
    },
    buyables: {
        rows: 1,
        cols: 4,
        11: {
            title: "Discord",
            cost() { return getBuyableAmount("f", 11).add(1) },
            display() { return getBuyableAmount("f", 11).gte(1) ? `Each upgrade raises your discord effect on fan gain to the ^1.1 power.<br/><br/>Next upgrade cost: ${this.cost()} fame` : `Create a discord, boosting your fan gain the more fans you have<br/><br/>Unlock cost: ${this.cost()} fame` },
            canAfford() { return player[this.layer].points.gte(this.cost()) },
            effect() {
                if (getBuyableAmount("f", 11).lte(0)) return new Decimal(1)
                return new Decimal(1.1).pow(getBuyableAmount("f", 11).sub(1)).mul(player[this.layer].fans.clampMin(10).log10().pow(0.3)).add(1)
            },
            buy() {
                player[this.layer].points = player[this.layer].points.sub(this.cost())
                setBuyableAmount("f", 11, getBuyableAmount("f", 11).add(1))
            }
        },
        12: {
            title: "Patreon",
            cost() { return getBuyableAmount("f", 12).add(1).mul(2) },
            display() { return getBuyableAmount("f", 12).gte(1) ? `Each upgrade raises your patreon effect on cash gain to the ^1.1 power.<br/><br/>Next upgrade cost: ${this.cost()} fame` : `Create a patreon, boosting your cash gain the more fans you have<br/><br/>Unlock cost: ${this.cost()} fame` },
            canAfford() { return player[this.layer].points.gte(this.cost()) },
            effect() {
                if (getBuyableAmount("f", 12).lte(0)) return new Decimal(1)
                return new Decimal(1.1).pow(getBuyableAmount("f", 12).sub(1)).mul(player[this.layer].fans.clampMin(10).log2().sqrt()).add(1)
            },
            buy() {
                player[this.layer].points = player[this.layer].points.sub(this.cost())
                setBuyableAmount("f", 12, getBuyableAmount("f", 12).add(1))
            }
        },
        13: {
            title: "Twitch",
            cost() { return getBuyableAmount("f", 13).add(1).mul(2) },
            display() { return getBuyableAmount("f", 13).gte(1) ? `Each upgrade raises your twitch effect on experience gain to the ^1.1 power.<br/><br/>Next upgrade cost: ${this.cost()} fame` : `Create a twitch where you stream development and get instant feedback, boosting your experience gain the more fans you have<br/><br/>Unlock cost: ${this.cost()} fame` },
            canAfford() { return player[this.layer].points.gte(this.cost()) },
            effect() {
                if (getBuyableAmount("f", 11).lte(0)) return new Decimal(1)
                return new Decimal(1.1).pow(getBuyableAmount("f", 13).sub(1)).mul(player[this.layer].fans.clampMin(10).log2().pow(0.25)).add(1)
            },
            buy() {
                player[this.layer].points = player[this.layer].points.sub(this.cost())
                setBuyableAmount("f", 13, getBuyableAmount("f", 13).add(1))
            }
        },
        14: {
            title: "Github",
            cost() { return getBuyableAmount("f", 14).add(1).mul(3) },
            display() { return getBuyableAmount("f", 14).gte(1) ? `Each upgrade raises your github effect on update gain to the ^1.1 power.<br/><br/>Next upgrade cost: ${this.cost()} fame` : `Add a link in the game to the github repo, boosting your update gain the more fans you have<br/><br/>Unlock cost: ${this.cost()} fame` },
            canAfford() { return player[this.layer].points.gte(this.cost()) },
            effect() {
                if (getBuyableAmount("f", 11).lte(0)) return new Decimal(1)
                return new Decimal(1.1).pow(getBuyableAmount("f", 14).sub(1)).mul(player[this.layer].fans.clampMin(10).log10().pow(0.25)).add(1)
            },
            buy() {
                player[this.layer].points = player[this.layer].points.sub(this.cost())
                setBuyableAmount("f", 14, getBuyableAmount("f", 14).add(1))
            }
        }
    }
})