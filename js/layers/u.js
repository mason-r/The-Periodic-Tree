addLayer("u", {
    name: "updates",
    symbol: "U",
    color: "#4BDC13",
    row: 0,
    position: 0,
    resource: "updates",
    baseResource: "hours of work",
    lore: "You've started working on this great little game idea you've had kicking around for awhile! Unfortunately, the longer you work on it the less your productivity seems to translate into hours of work :/<br/><br/>" +
          "Also, if you're familiar with other TPT mods, you should know this one works differently: layers are only reset along branches!",
    resetDescription: "Release new build for ",
    startData() { return {
        unlocked: true,
        best: new Decimal(0),
        points: new Decimal(0),
    }},
    layerShown: true,
    type: "static",
    requires: new Decimal(5),
    base: new Decimal(5),
    baseAmount() { return player.points },
    exponent: 0.5,
    gainMult() {
        mult = new Decimal(1).div(buyableEffect("f", 12))
        if (hasUpgrade("u", 21)) mult = mult.div(2)
        if (hasUpgrade("e", 11)) mult = mult.div(upgradeEffect("e", 11))
        return mult
    },
    gainExp() {
        return new Decimal(1)
    },
    roundUpCost: true,
    canBuyMax() { return true },
    doReset(resettingLayer) {
        if (resettingLayer != 'u')
            layerDataReset(this.layer, hasMilestone("s", 0) ? [ 'upgrades', 'best' ] : [ 'best' ])
    },
    hotkeys: [
        {
            key: "u",
            description: "Press U to release a new build",
            onPress() { if (canReset(this.layer)) doReset(this.layer) }
        }
    ],
    tabFormat: [
        "lore",
        "main-display",
        "prestige-button",
        "blank",
        "upgrades"
    ],
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
