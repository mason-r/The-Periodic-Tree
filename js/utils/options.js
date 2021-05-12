let styleCooldown = 0;

// ************ Options ************
function toggleOpt(name) {
	if (name === "oldStyle" && styleCooldown > 0)
		return;

	player[name] = !player[name];
	if (name === "hqTree")
		changeTreeQuality();
	if (name === "oldStyle")
		updateStyle();
}

function updateStyle() {
	styleCooldown = 1;
	let css = document.getElementById("styleStuff");
	css.href = player.oldStyle ? "oldStyle.css" : "style.css";
	needCanvasUpdate = true;
}
function changeTreeQuality() {
	const on = player.hqTree;
	document.body.style.setProperty('--hqProperty1', on ? "2px solid" : "4px solid");
	document.body.style.setProperty('--hqProperty2a', on ? "-4px -4px 4px rgba(0, 0, 0, 0.25) inset" : "-4px -4px 4px rgba(0, 0, 0, 0) inset");
	document.body.style.setProperty('--hqProperty2b', on ? "0px 0px 20px var(--background)" : "");
	document.body.style.setProperty('--hqProperty3', on ? "2px 2px 4px rgba(0, 0, 0, 0.25)" : "none");
}
function toggleAuto(toggle) {
	player[toggle[0]][toggle[1]] = !player[toggle[0]][toggle[1]];
}

const MS_DISPLAYS = ["ALL", "LAST, AUTO, INCOMPLETE", "AUTOMATION, INCOMPLETE", "INCOMPLETE", "NONE"];

const MS_SETTINGS = ["always", "last", "automation", "incomplete", "never"];

function adjustMSDisp() {
	player.msDisplay = MS_SETTINGS[(MS_SETTINGS.indexOf(player.msDisplay) + 1) % 5];
}
function milestoneShown(layer, id) {
	let complete = player[layer].milestones.includes(id);
	let auto = layers[layer].milestones[id].toggles;

	switch (player.msDisplay) {
		case "always":
			return true;
		case "last":
			return (auto) || !complete || player[layer].lastMilestone === id;
		case "automation":
			return (auto) || !complete;
		case "incomplete":
			return !complete;
		case "never":
			return false;
	}
	return false;
}
