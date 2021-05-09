/* eslint-disable no-unused-vars */
// https://color.adobe.com/create/color-wheel

// Colors
const backgroundColor = "#2a323d";
const flowersColor = "#F1EBD9";
const distillColor = "#8AFFC1";
const studyColor = "#654321";
const sandsColor = "#C2B280";
const electricColor = "#89C6FF";
const ritualsColor = "#1e1e1e";

const levelSoftcapPower = 0.7643; // chosen so that e308 = level 100

function getJobLevel(job, useModifier = true) {
	if (job === "") return new Decimal(0);
	const modifier = useModifier ? player.levelModifiers[job] : new Decimal(0);
	if (player[job].xp.eq(0)) {
		return modifier;
	}
	let baseLevel = player[job].xp.clampMin(1).log10().add(1);
	if (baseLevel.gt(25)) {
		baseLevel = baseLevel.sub(25).pow(levelSoftcapPower).add(25);
	}
	return baseLevel.floor().add(modifier);
}

function checkJobXP(job) {
	let jobLevel = getJobLevel(job, false);
	if (jobLevel.neq(player[job].lastLevel)) {
		doPopup("none", `Level ${jobLevel}`, "Level Up!", 3, layers[job].color);
		player[job].lastLevel = jobLevel;
	}
}

function getXPRequirement(level) {
	if (level.gt(25)) {
		level = level.sub(25).pow(1 / levelSoftcapPower).add(25);
	}
	return level.sub(1).pow10();
}

function getJobProgressBar(job, color) {
	return {
		direction: RIGHT,
		width: 400,
		height: 20,
		progress: () => {
			let level = getJobLevel(job, false);
			if (level.eq(0)) {
				return 0;
			}
			let previousLevelRequirement = getXPRequirement(level);
			let nextLevelRequirement = getXPRequirement(level.add(1));

			let progress;
			if (level.lt(25)) { // Show linear
				progress = player[job].xp.sub(previousLevelRequirement).div(nextLevelRequirement.sub(previousLevelRequirement));
			} else { // Show logarithmic
				progress = player[job].xp.log10().sub(previousLevelRequirement.log10()).div(nextLevelRequirement.log10().sub(previousLevelRequirement.log10()));
			}
			return progress;
		},
		fillStyle: { backgroundColor: color || layers[job].color },
		borderStyle: { borderColor: color || layers[job].color }
	};
}
