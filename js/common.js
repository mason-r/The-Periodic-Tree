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

function getJobLevel(job, useModifier = true) {
	if (job === "") return new Decimal(0);
	const modifier = useModifier ? player.levelModifiers[job] : new Decimal(0);
	if (player[job].xp.eq(0)) {
		return modifier;
	}
	return softcap(player[job].xp.clampMin(1).log10().floor().add(1), new Decimal(25)).add(modifier).floor();
}

function checkJobXP(job) {
	let jobLevel = getJobLevel(job, false);
	if (jobLevel.neq(player[job].lastLevel)) {
		doPopup("none", `Level ${jobLevel}`, "Level Up!", 3, layers[job].color);
		player[job].lastLevel = jobLevel;
	}
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
			let previousLevelRequirement = level.lt(25) ? level.sub(1).pow10() :
				level.div(new Decimal(25).sqrt()).pow(2).floor();
			let nextLevelRequirement = level.lt(25) ? level.pow10() :
				level.add(1).div(new Decimal(25).sqrt()).pow(2).floor();
			let currentXp = level.lt(25) ? player[job].xp.clampMin() : player[job].xp.log10();
			let progress = currentXp.sub(previousLevelRequirement).div(nextLevelRequirement.sub(previousLevelRequirement));
			return progress;
		},
		fillStyle: { backgroundColor: color || layers[job].color },
		borderStyle: { borderColor: color || layers[job].color }
	};
}
