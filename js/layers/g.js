addLayer("g", {
    name: "good will",
    symbol: "G",
    color: goodwillColor,
    branches: [ 'f' ],
    row: 3,
    position: 5,
    resource: "good will",
    baseResource: "fame",
    infoboxes: {
        lore: {
            title: "good will",
            body: `Your massive amounts of <span style="color: ${fameColor}">fans</span> and <span style="color: ${fameColor}">fame</span> have gotten your games an amount of <span style="color: ${goodwillColor}">good will</span>. Players are more likely to become <span style="color: ${fameColor}">fans</span>, and trust your games will be good for consumers and fun to boot...<br/><br/>` +
                  `<i>However</i>, this also means there's lots to gain by cashing in that <span style="color: ${goodwillColor}">good will</span>. Buying these upgrades will have powerful effects, but <span style="color: ${goodwillColor}">good will</span> is permanently harder to gain the more you've earned.`
        }
    },
    resetDescription: "Get acknowledged as trustworthy by your fans for ",
    startData() { return {
        unlocked: false,
        points: new Decimal(0),
        unused: new Decimal(0)
    }},
    layerShown() { return false && (player[this.layer].unlocked || player.f.best.gte(6)) },
    type: "static",
    requires: new Decimal(8),
    base: new Decimal(1.5),
    baseAmount() { return player.f.points },
    exponent: 1.25,
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
    effect() {
        return player.g.unused.add(1).pow(2)
    },
    effectDescription() {
        return `which multiplies your fame and fan effects by x${formatWhole(this.effect())}.`
    },
    tooltip() { return `${formatWhole(player.g.unused)} goodwill` },
    hotkeys: [
        {
            key: "g",
            description: "Press G to get acknowledged as trustworthy by your fans",
            onPress() { if (canReset(this.layer)) doReset(this.layer) }
        }
    ],
    tabFormat: [
        ["infobox", "lore"],
        ["display-text", () => `You have <h2 style="color: ${tmp.g.color}; text-shadow: ${tmp.g.color} 0px 0px 10px">${formatWhole(player.g.unused)}</h2> good will, ${layers.g.effectDescription()}`],
        ["display-text", () => `You have earned a total of ${player.g.points} good will.`],
        "blank",
        "prestige-button",
        "blank",
        ["display-text", () => `<button onClick="layers.g.respec()" class="longUpg ${player.g.unlocked ? 'can' : 'locked'}">Respec<br>(Causes good will reset)</button>`],
        "blank",
        "upgrades",
        "milestones"
    ],
    upgrades: {
        rows: 2,
        cols: 3,
        11: {
            title: "Surprise Mechanics",
            description: "Unlock a series of powerful revenue upgrades",
            cost: new Decimal(1),
            currencyDisplayName: "goodwill",
            currencyInternalName: "unused",
            currencyLocation: () => player.g
        },
        12: {
            title: "Trojans and Worms",
            description: "Unlock a series of powerful fame upgrades",
            cost: new Decimal(1),
            currencyDisplayName: "goodwill",
            currencyInternalName: "unused",
            currencyLocation: () => player.g
        },
        13: {
            title: "Let them make their own content",
            description: "Unlock a series of powerful update upgrades",
            cost: new Decimal(1),
            currencyDisplayName: "goodwill",
            currencyInternalName: "unused",
            currencyLocation: () => player.g
        },
        21: {
            title: "Trick fans into refactoring for you",
            description: "Use free labor to multiply refactors gain based on your fame",
            cost: new Decimal(2),
            currencyDisplayName: "goodwill",
            currencyInternalName: "unused",
            currencyLocation: () => player.g,
            effect() { return player.f.points.pow(2).add(1) }
        },
        22: {
            title: "Hack into college databases",
            description: "Manipulate your GPA to multiply enrollment gain based on your refactors",
            cost: new Decimal(2),
            currencyDisplayName: "goodwill",
            currencyInternalName: "unused",
            currencyLocation: () => player.g,
            effect() { return player.r.points.pow(2).add(1) }
        },
        23: {
            title: "Run for Student Government",
            description: "Take advantage of your local colleges to spread the word about your games and multiply fame gain based on enrollments",
            cost: new Decimal(2),
            currencyDisplayName: "goodwill",
            currencyInternalName: "unused",
            currencyLocation: () => player.g,
            effect() { return player.s.points.pow(2).add(1) }
        }
    },
    milestones: {
        0: {
            requirementDescription: "1 total good will",
            effectDescription: "Start row 4 resets with 1000 fans",
            done() { return player[this.layer].points.gte(1) }
        },
        1: {
            requirementDescription: "2 total good will",
            effectDescription: "Start row 4 resets with 1 of each social media account",
            done() { return player[this.layer].points.gte(2) }
        },
        2: {
            requirementDescription: "3 total good will",
            effectDescription: "Retain fame milestones",
            done() { return player[this.layer].points.gte(3) }
        }
    },
    respec() {
        player.g.upgrades = []
        player.g.unused = player.g.points
        doReset('g', true)
    }
})
