let modInfo = {
	name: "The Game Dev Tree",
	id: "gamedevtree",
	pointsName: "hours of work",
	discordName: "The Paper Pilot Community Server",
	discordLink: "https://discord.gg/WzejVAx",
	changelogLink: "https://github.com/Acamaeda/The-Modding-Tree/blob/master/changelog.md",
    offlineLimit: 5,  // In hours
    initialStartPoints: new Decimal (0) // Used for hard resets and new players
}

// Set your version in num and name
let VERSION = {
	num: "0.1.1",
	name: "Cash Influx [rebalanced]",
}

// If you add new functions anywhere inside of a layer, and those functions have an effect when called, add them here.
// (The ones here are examples, all official functions are already taken care of)
var doNotCallTheseFunctionsEveryTick = ["blowUpEverything"]

function getStartPoints(){
    return new Decimal(modInfo.initialStartPoints)
}

// Determines if it should show points/sec
function canGenPoints(){
	return true
}

// Calculate points/sec!
function getPointGen() {
	if(!canGenPoints())
		return new Decimal(0)

	let gain = layers.e.effect()
	if (hasUpgrade("u", 11)) gain = gain.mul(2)
	if (hasUpgrade("u", 12)) gain = gain.mul(1.5)
	if (hasUpgrade("u", 22)) gain = gain.mul(upgradeEffect("u", 22))
	if (hasUpgrade("c", 11)) gain = gain.mul(2)
	if (hasUpgrade("c", 12)) gain = gain.mul(2)
	if (hasUpgrade("e", 21)) gain = gain.mul(2)
	if (hasUpgrade("e", 22)) gain = gain.mul(2)
	if (hasUpgrade("e", 23)) gain = gain.mul(2)

	gain = gain.pow(buyableEffect("c", 11))
	gain = gain.divide(player.points.sub(player.e.total).clampMin(1).sqrt())
	gain = gain.divide(player.points.sub(player.e.total).clampMin(0).sqrt().clampMin(10).log10())
	return gain
}

// You can add non-layer related variables that should to into "player" and be saved here, along with default values
function addedPlayerData() { return {
	hideIntro: false
}}

// Display extra things at the top of the page
var displayThings = [
	() => player.hideIntro ? "" : "<br/>",
	() => player.hideIntro ? "" : "You've started working on this great little game idea you've had kicking around for awhile!",
	() => player.hideIntro ? "" : "Unfortunately, the longer you work on it the harder it becomes to keep working on :/",
	() => player.hideIntro ? "" : "<br/>",
	() => player.hideIntro ? "" : "Also, if you're familiar with other TPT mods, you should know this one works differently: layers are only reset along branches!",
	() => player.hideIntro ? "" : "(Now that you've read me, you can hide this text in settings)"
]

// Determines when the game "ends"
function isEndgame() {
	return player.points.gte(new Decimal("e280000000"))
}



// Less important things beyond this point!

// You can change this if you have things that can be messed up by long tick lengths
function maxTickLength() {
	return(3600000) // Default is 1 hour which is just arbitrarily large
}