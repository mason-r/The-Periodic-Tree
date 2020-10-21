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
        mult = new Decimal(1).div(buyableEffect("f", 12))
        if (hasUpgrade("u", 21)) mult = mult.div(2)
        if (hasUpgrade("e", 11)) mult = mult.div(upgradeEffect("e", 11))
        return mult
    },
    gainExp() { // Calculate the exponent on main currency from bonuses
        return new Decimal(1)
    },
    canBuyMax() { return true },
    doReset(resettingLayer) { if (resettingLayer != 'u') layerDataReset(this.layer, [ 'best' ]) },
    resetDescription: "Release new build for ",
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
        mult = new Decimal(1).mul(buyableEffect("f", 13))
        return mult
    },
    gainExp() { // Calculate the exponent on main currency from bonuses
        return new Decimal(1)
    },
    effect() { return player.e.points.sqrt().add(1) },
    doReset(resettingLayer) {
        if (['r'].includes(resettingLayer)) {
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
            layerDataReset(this.layer, [ "unlocked", "milestones" ])
            player[this.layer].upgrades = upgradesToKeep
        }
    },
    resetDescription: "Start Over for ",
    effectDescription() { return `multiplying base productivity by ${this.effect().toFixed(2)}. Your total experience is also delaying the productivity slow down by ${player[this.layer].total.times(player.r.points.add(1))} hours.` },
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
            effect() { return player.e.total.times(player.r.points.add(1)).clampMin(1).log10().add(1) }
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
        mult = new Decimal(100).mul(buyableEffect("f", 12))
        return mult
    },
    gainExp() { // Calculate the exponent on main currency from bonuses
        return new Decimal(1)
    },
    doReset(resettingLayer) {
        if (['f'].includes(resettingLayer)) {
            const shouldKeepUpgrades = {
                11: hasMilestone("f", 0),
                12: hasMilestone("f", 1),
                13: hasMilestone("f", 2),
                14: hasMilestone("f", 3),
                21: hasMilestone("f", 4),
                22: hasMilestone("f", 5),
                23: hasMilestone("f", 6),
                24: hasMilestone("f", 7)
            }
            const upgradesToKeep = []
            for (let upgrade of player[this.layer].upgrades) {
                if (shouldKeepUpgrades[upgrade]) {
                    upgradesToKeep.push(upgrade)
                }
            }
            layerDataReset(this.layer, [ "unlocked", "milestones" ])
            player[this.layer].upgrades = upgradesToKeep
        }
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
        rows: 1,
        cols: 1,
        11: {
            title: "Upgrade hardware",
            cost() { return new Decimal(100).mul(new Decimal(2).pow(getBuyableAmount("c", 11))).round() },
            display() { return `Each upgrade raises your base productivity to the ^1.1 power.<br/>Next upgrade cost: ${this.cost()} cash` },
            canAfford() { return player[this.layer].points.gte(this.cost()) },
            effect() { return new Decimal(1.1).pow(getBuyableAmount("c", 11)) },
            buy() {
                player[this.layer].points = player[this.layer].points.sub(this.cost())
                setBuyableAmount("c", 11, getBuyableAmount("c", 11).add(1))
            }
        }
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
        points: new Decimal(0),
        renameVariablesHoursWorked: new Decimal(0),
        encapsulateFieldHoursWorked: new Decimal(0),
        optimizeFormulasHoursWorked: new Decimal(0),
        rollLibraryHoursWorked: new Decimal(0)
    }},
    branches: [ 'e' ],
    color: "#4CABF5",
    requires: new Decimal(500), // Can be a function that takes requirement increases into account
    base: new Decimal(2.5),
    resource: "refactors", // Name of prestige currency
    baseResource: "experience", // Name of resource prestige is based on
    baseAmount() {return player.e.points}, // Get the current amount of baseResource
    type: "static", // normal: cost to gain currency depends on amount gained. static: cost depends on how much you already have
    exponent: 1.25, // Prestige currency exponent
    gainMult() { // Calculate the multiplier for main currency from bonuses
        mult = new Decimal(1)
        return mult
    },
    gainExp() { // Calculate the exponent on main currency from bonuses
        return new Decimal(1)
    },
    resetDescription: "Use all your experience to re-design your game framework for ",
    effectDescription() { return `multiplying all bonuses based on total experience by ${player[this.layer].points.add(1).toFixed(2)}.` },
    roundUpCost: true,
    row: 2, // Row the layer is in on the tree (0 is the first row)
    hotkeys: [
        {key: "r", description: "Re-design your game framework", onPress(){if (canReset(this.layer)) doReset(this.layer)}},
    ],
    layerShown(){ return player.u.best.gte(50) || player[this.layer].total.gte(1) },
    milestones: {
        0: {
            requirementDescription: "1 refactor",
            effectDescription: "Unlock first refactoring, and retain the second and third Experience upgrades",
            done() { return player[this.layer].total.gte(1) }
        },
        1: {
            requirementDescription: "2 refactors",
            effectDescription: "Unlock second refactoring",
            done() { return player[this.layer].total.gte(2) }
        },
        2: {
            requirementDescription: "3 refactors",
            effectDescription: "Retain the first Experience upgrade",
            done() { return player[this.layer].total.gte(3) },
            unlocked() { return player[this.layer].total.gte(1) }
        },
        3: {
            requirementDescription: "4 refactors",
            effectDescription: "Unlock third refactoring",
            done() { return player[this.layer].total.gte(4) },
            unlocked() { return player[this.layer].total.gte(2) }
        },
        4: {
            requirementDescription: "5 refactors",
            effectDescription: "Retain the fourth Experience upgrade",
            done() { return player[this.layer].total.gte(5) },
            unlocked() { return player[this.layer].total.gte(3) }
        },
        5: {
            requirementDescription: "6 refactors",
            effectDescription: "Retain the fifth Experience upgrade",
            done() { return player[this.layer].total.gte(6) },
            unlocked() { return player[this.layer].total.gte(4) }
        },
        6: {
            requirementDescription: "7 refactors",
            effectDescription: "Retain the sixth Experience upgrade",
            done() { return player[this.layer].total.gte(7) },
            unlocked() { return player[this.layer].total.gte(5) }
        },
        7: {
            requirementDescription: "8 refactors",
            effectDescription: "Unlock fourth refactoring",
            done() { return player[this.layer].total.gte(8) },
            unlocked() { return player[this.layer].total.gte(6) }
        }
    },
    clickables: {
        rows: 1,
        cols: 4,
        11: {
            title: "Rename variables",
            display: function() {
                return `Take time to rename your variables more sensibly, making your productivity slow down even stronger but you gain a boost to productivity based on hours of work produced with this active.\n\nCurrently: ${clickableEffect("r", 11).toFixed(2)}x`
            },
            effect: function() {
                if (player.r.renameVariablesHoursWorked.lessThan(1)) return new Decimal(1)
                return player.r.renameVariablesHoursWorked.log(10).pow(2).add(1)
            },
            unlocked() { return hasMilestone("r", 0) },
            canClick: function() { return !getClickableState("r", 12) && !getClickableState("r", 13) && !getClickableState("r", 14) },
            onClick: function() {
                setClickableState("r", 11, !getClickableState("r", 11))
            },
            style: {
                "height": "160px",
                "width": "200px"
            }
        },
        12: {
            title: "Encapsulate fields",
            display: function() {
                return `Take time to comply with arbitrary programming practices, making your productivity slow down even more strongly but you gain another boost to productivity based on hours of work produced with this active.\n\nCurrently: ${clickableEffect("r", 12).toFixed(2)}x`
            },
            effect: function() {
                if (player.r.encapsulateFieldHoursWorked.lessThan(1)) return new Decimal(1)
                return player.r.encapsulateFieldHoursWorked.log(10).pow(2).add(1)
            },
            unlocked() { return hasMilestone("r", 1) },
            canClick: function() { return !getClickableState("r", 11) && !getClickableState("r", 13) && !getClickableState("r", 14) },
            onClick: function() {
                setClickableState("r", 12, !getClickableState("r", 12))
            },
            style: {
                "height": "160px",
                "width": "200px"
            }
        },
        13: {
            title: "Optimize formulas",
            display: function() {
                return `Take time to figure out how to get that darn bottleneck to O(1), making your productivity slow down like really strongly but you gain yet another boost to productivity based on hours of work produced with this active.\n\nCurrently: ${clickableEffect("r", 13).toFixed(2)}x`
            },
            effect: function() {
                if (player.r.optimizeFormulasHoursWorked.lessThan(1)) return new Decimal(1)
                return player.r.optimizeFormulasHoursWorked.log(10).pow(2).add(1)
            },
            unlocked() { return hasMilestone("r", 3) },
            canClick: function() { return !getClickableState("r", 11) && !getClickableState("r", 12) && !getClickableState("r", 14) },
            onClick: function() {
                setClickableState("r", 13, !getClickableState("r", 13))
            },
            style: {
                "height": "160px",
                "width": "200px"
            }
        },
        14: {
            title: "Roll your own library",
            display: function() {
                return `Take time to replace that slow library with your own, making your productivity slow down stronger than you've yet experienced but you gain, surprising no one, another boost to productivity based on hours of work produced with this active.\n\nCurrently: ${clickableEffect("r", 14).toFixed(2)}x`
            },
            effect: function() {
                if (player.r.rollLibraryHoursWorked.lessThan(1)) return new Decimal(1)
                return player.r.rollLibraryHoursWorked.log(10).pow(2).add(1)
            },
            unlocked() { return hasMilestone("r", 7) },
            canClick: function() { return !getClickableState("r", 11) && !getClickableState("r", 12) && !getClickableState("r", 13) },
            onClick: function() {
                setClickableState("r", 14, !getClickableState("r", 14))
            },
            style: {
                "height": "160px",
                "width": "200px"
            }
        }
    },
    update(diff) {
        if (getClickableState("r", 11))
            player.r.renameVariablesHoursWorked = player.r.renameVariablesHoursWorked.add(tmp.pointGen.mul(diff))
        else if (getClickableState("r", 12))
            player.r.encapsulateFieldHoursWorked = player.r.encapsulateFieldHoursWorked.add(tmp.pointGen.mul(diff))
        else if (getClickableState("r", 13))
            player.r.optimizeFormulasHoursWorked = player.r.optimizeFormulasHoursWorked.add(tmp.pointGen.mul(diff))
        else if (getClickableState("r", 14))
            player.r.rollLibraryHoursWorked = player.r.rollLibraryHoursWorked.add(tmp.pointGen.mul(diff))
    }
})

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
            if (getBuyableAmount("f", 14).gte(1)) text += `<br/>Multiplies upgrade gain by ${format(upgMult)}x due to github`
            return text
        }],
        "blank",
        "prestige-button",
        "blank",
        "milestones",
        "buyables"
    ],
    roundUpCost: true,
    row: 2, // Row the layer is in on the tree (0 is the first row)
    hotkeys: [
        {key: "f", description: "Elevate your social status", onPress(){if (canReset(this.layer)) doReset(this.layer)}},
    ],
    layerShown(){ return player.u.best.gte(50) || player[this.layer].best.gte(1) },
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
            effect() { return new Decimal(1.1).pow(getBuyableAmount("f", 11).sub(1)).mul(player[this.layer].fans.clampMin(10).log10().sqrt()).add(1) },
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
            effect() { return new Decimal(1.1).pow(getBuyableAmount("f", 12).sub(1)).mul(player[this.layer].fans.clampMin(10).log2().sqrt()).add(1) },
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
            effect() { return new Decimal(1.1).pow(getBuyableAmount("f", 13).sub(1)).mul(player[this.layer].fans.clampMin(10).log2().pow(0.25)).add(1) },
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
            effect() { return new Decimal(1.1).pow(getBuyableAmount("f", 14).sub(1)).mul(player[this.layer].fans.clampMin(10).log10().pow(0.25)).add(1) },
            buy() {
                player[this.layer].points = player[this.layer].points.sub(this.cost())
                setBuyableAmount("f", 14, getBuyableAmount("f", 14).add(1))
            }
        }
    }
})
