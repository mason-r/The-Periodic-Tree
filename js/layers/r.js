addLayer("r", {
    name: "refactors",
    symbol: "R",
    color: "#4CABF5",
    branches: [ 'e' ],
    row: 2,
    position: 1,
    resource: "refactors",
    baseResource: "experience",
    lore: "After working on a game for so long, you start to realize some initial design decisions haven't really scaled well over so many countless updates.<br/><br/>" +
          "You do, however, have some ideas on how you would've structured it to better support the features you've since added, and will continue to add. All you have to do is rewrite a couple parts of it.<br/><br/>" +
          "You'll take a minor setback with your experience on a changing codebase, but it'll pay off dividends in the long run!<br/><br/>" +
          "This layer also unlocks \"Refactorings\": Enabling these actively refactors your codebase, increasing your productivity based on the hours worked. However, the productivity slow down will be much quicker due to the grueling work.",
    resetDescription: "Use all your experience to re-design your game framework for ",
    startData() { return {
        unlocked: false,
        total: new Decimal(0),
        points: new Decimal(0),
        renameVariablesHoursWorked: new Decimal(0),
        encapsulateFieldHoursWorked: new Decimal(0),
        optimizeFormulasHoursWorked: new Decimal(0),
        rollLibraryHoursWorked: new Decimal(0)
    }},
    layerShown() { return player[this.layer].unlocked || player.u.best.gte(30) },
    type: "static",
    requires: new Decimal(500),
    base: new Decimal(2.5),
    baseAmount() { return player.e.points },
    exponent: 1.25,
    gainMult() {
        mult = new Decimal(1)
        return mult
    },
    gainExp() {
        return new Decimal(1)
    },
    roundUpCost: true,
    effect() { return player[this.layer].points.pow(player[this.layer].points).add(1) },
    effectDescription() {
        return `multiplying all bonuses based on total experience by ${format(this.effect())}x.`
    },
    hotkeys: [
        {
            key: "r",
            description: "Press R to re-design your game framework",
            onPress() { if (canReset(this.layer)) doReset(this.layer) }
        }
    ],
    tabFormat: [
        "lore",
        "main-display",
        "blank",
        "prestige-button",
        "blank",
        "clickables",
        "blank",
        ["display-text", () => `You've performed a total of ${player.r.total} refactors`],
        "milestones"
    ],
    update(diff) {
        if (getClickableState("r", 11))
            player.r.renameVariablesHoursWorked = player.r.renameVariablesHoursWorked.add(tmp.pointGen.mul(diff))
        else if (getClickableState("r", 12))
            player.r.encapsulateFieldHoursWorked = player.r.encapsulateFieldHoursWorked.add(tmp.pointGen.mul(diff))
        else if (getClickableState("r", 13))
            player.r.optimizeFormulasHoursWorked = player.r.optimizeFormulasHoursWorked.add(tmp.pointGen.mul(diff))
        else if (getClickableState("r", 14))
            player.r.rollLibraryHoursWorked = player.r.rollLibraryHoursWorked.add(tmp.pointGen.mul(diff))
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
    }
})
