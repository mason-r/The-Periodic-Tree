addLayer("c", {
    name: "cash",
    symbol: "C",
    color: "#F5A833",
    branches: [ 'u' ],
    row: 1,
    position: 1,
    resource: "cash",
    baseResource: "updates",
    resetDescription: "Sell game to publisher for ",
    startData() { return {
        unlocked: false,
        total: new Decimal(0),
        points: new Decimal(0)
    }},
    layerShown() { return player[this.layer].unlocked || hasUpgrade("e", 12) },
    type: "normal",
    requires: new Decimal(10),
    baseAmount() { return player.u.points },
    exponent: 1.5,
    gainMult() {
        mult = new Decimal(100).mul(buyableEffect("f", 12))
        return mult
    },
    gainExp() {
        return new Decimal(1)
    },
    roundUpCost: true,
    doReset(resettingLayer) {
        if (['s', 'f'].includes(resettingLayer)) {
            const shouldKeepUpgrades = {
                11: hasMilestone("f", 0),
                12: hasMilestone("f", 1),
                13: hasMilestone("f", 2),
                14: hasMilestone("f", 3),
                21: hasMilestone("f", 4),
                22: hasMilestone("f", 5),
                23: hasMilestone("f", 6),
                24: hasMilestone("f", 7),
                111: hasMilestone("s", 3),
                112: hasMilestone("s", 3),
                113: hasMilestone("s", 3),
                114: hasMilestone("s", 3)
            }
            const upgradesToKeep = []
            for (let upgrade of player[this.layer].upgrades) {
                if (shouldKeepUpgrades[upgrade]) {
                    upgradesToKeep.push(upgrade)
                }
            }
            layerDataReset(this.layer, [ "milestones" ])
            player[this.layer].upgrades = upgradesToKeep
        }
    },
    hotkeys: [
        {
            key: "c",
            description: "Press C to sell your game to a publisher",
            onPress() { if (canReset(this.layer)) doReset(this.layer) }
        }
    ],
    tabFormat: [
        "main-display",
        ["display-text", function() {
                return hasUpgrade("e", 13) && tmp.c.resetGain.times ? `(${format(tmp.c.resetGain.times(layers.c.revenue(1)))}/sec)` : ""
            },
            { "marginTop": "-1em", "display": "block" }
        ],
        "blank",
        "prestige-button",
        "blank",
        () => hasUpgrade("e", 13) ? ["display-text", "Equipment", { "font-size": "32px" }] : [],
        () => hasUpgrade("e", 13) ? "blank" : [],
        "buyables",
        "blank",
        "upgrades",
        () => hasUpgrade("e", 13) ? ["display-text", "Revenue", { "font-size": "32px" }] : [],
        () => hasUpgrade("e", 13) ? "blank" : [],
        () => hasUpgrade("e", 13) ? ["row", [["upgrade", 111], ["upgrade", 112], ["upgrade", 113], ["upgrade", 114]]] : []
    ],
    update(diff) {
        generatePoints("c", this.revenue(diff))
    },
    shouldNotify() {
        return canAffordPurchase("c", layers[this.layer].buyables[11], layers[this.layer].buyables[11].cost())
    },
    upgrades: {
        rows: 2,
        cols: 4,
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
        13: {
            title: "Buy ambient sound machine",
            description: "Purchase an overpriced machine to do a website's job, allowing you to double your productivity",
            cost: new Decimal(800)
        },
        14: {
            title: "Buy Keurig",
            description: "Purchase an overhyped coffee machine, allowing you to double your productivity",
            cost: new Decimal(1200)
        },
        21: {
            title: "Buy incense burner",
            description: "Purchase an overpriced incense burner, allowing you to double your productivity",
            cost: new Decimal(2500)
        },
        22: {
            title: "Buy mechanical keyboard",
            description: "Purchase an overpriced keyboard, allowing you to double your productivity at the expense of your coworkers'",
            cost: new Decimal(4000)
        },
        23: {
            title: "Buy massaging chair",
            description: "Purchase an overpriced chair, allowing you to double your productivity",
            cost: new Decimal(10000)
        },
        24: {
            title: "Buy sensory deprivation egg",
            description: "Purchase an isolation tank, allowing you to double your productivity",
            cost: new Decimal(100000)
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
    buyables: {
        rows: 1,
        cols: 1,
        11: {
            title: "Upgrade hardware",
            cost() { return new Decimal(100).mul(new Decimal(2).pow(getBuyableAmount("c", 11))).round() },
            display() { return `Each upgrade additively raises your base productivity to the +.25 power.<br/><br/>Currently: ^${format(this.effect())}<br/><br/>Next upgrade cost: ${format(this.cost())} cash` },
            canAfford() { return player[this.layer].points.gte(this.cost()) },
            effect() { return new Decimal(0.25).add(buyableEffect("s", 22)).mul(getBuyableAmount("c", 11)).add(1) },
            buy() {
                player[this.layer].points = player[this.layer].points.sub(this.cost())
                setBuyableAmount("c", 11, getBuyableAmount("c", 11).add(1))
            }
        }
    },
    revenue(diff) {
        let cpm = 0
        if (hasUpgrade("c",111)) cpm += 1
        if (hasUpgrade("c",112)) cpm += 2
        if (hasUpgrade("c",113)) cpm += 2
        if (hasUpgrade("c",114)) cpm += 5
        return diff * cpm / 1000
    }
})
