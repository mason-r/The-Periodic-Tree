addLayer("a", {
    name: "api",
    symbol: "A",
    color: "#AADB60",
    branches: [ 'r' ],
    row: 3,
    position: 1,
    resource: "endpoints",
    baseResource: "refactors",
    infoboxes: {
        lore: {
            title: "api",
            body: "All this refactoring has given you a new sense of perspective on how all these different game engines tend to work, and you have an idea for a new Application Programming Interface (API) that could simplify everything enormously, making almost everything easier to implement. The more refactoring experience you have, the more API end points you think you can design.<br/><br/>" +
                  "Designing your API means spending your endpoints on adding or improving the various bonuses available to you."
        }
    },
    resetDescription: "Design ",
    startData() { return {
        unlocked: false,
        points: new Decimal(0),
        unused: new Decimal(0)
    }},
    layerShown() { return false && (player[this.layer].unlocked || player.r.total.gte(8)) },
    type: "static",
    requires: new Decimal(10),
    base: new Decimal(1.2),
    baseAmount() { return player.r.points },
    exponent: 1.1,
    gainMult() {
        mult = new Decimal(1)
        return mult
    },
    gainExp() {
        return new Decimal(1)
    },
    roundUpCost: true,
    onPrestige(gain) {
        player[this.layer].unused = player[this.layer].unused.add(gain)
    },
    hotkeys: [
        {
            key: "a",
            description: "Press A to design API endpoints",
            onPress() { if (canReset(this.layer)) doReset(this.layer) }
        }
    ],
    tabFormat: [
        ["infobox", "lore"],
        ["display-text", () => `You have <h2 style="color: ${tmp.a.color}; text-shadow: ${tmp.a.color} 0px 0px 10px">${formatWhole(player.a.unused)}</h2> endpoints`],
        ["display-text", () => `You have earned a total of ${player.a.points} endpoints.`],
        "blank",
        "prestige-button",
        "blank",
        "buyables",
        "blank",
        "milestones"
    ],
    buyables: {
        rows: 1,
        cols: 4,
        11: {
            cost(x) { return new Decimal(1).mul(x || getBuyableAmount(this.layer, this.id)) },
            display() { return "Blah" },
            canAfford() { return player[this.layer].points.gte(this.cost()) },
            buy() {
                player[this.layer].points = player[this.layer].points.sub(this.cost())
                setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(1))
            }
        },
    },
    milestones: {
        0: {
            requirementDescription: "1 total API endpoints",
            effectDescription: "Retain the first, second, fourth, and eigth refactors milestones",
            done() { return player[this.layer].points.gte(1) }
        },
        1: {
            requirementDescription: "5 total API endpoints",
            effectDescription: "Buying refactors will buy as many as you can afford",
            done() { return player[this.layer].points.gte(5) }
        },
        2: {
            requirementDescription: "10 total API endpoints",
            effectDescription: "Retain all refactors milestones",
            done() { return player[this.layer].points.gte(10) }
        },
        3: {
            requirementDescription: "25 total API endpoints",
            effectDescription: "Row 4 resets don't reset refactorings",
            done() { return player[this.layer].points.gte(25) }
        }
    }
})
