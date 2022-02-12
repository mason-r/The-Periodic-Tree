if (gameInfo.githackBranch && window.location.hostname === "rawcdn.githack.com") {
	// Parse the current user and repo from the URL
	const parts = window.location.pathname.split('/');
	const user = parts[1];
	const repo = parts[2];

	// Find latest commit on specified branch
	fetch(`https://api.github.com/repos/${user}/${repo}/commits/${gameInfo.githackBranch}`)
	.then(response => response.json())
	.then(response => {
		// Calculate the URL for the latest version of the mod
		const updatedURL = `https://rawcdn.githack.com/${user}/${repo}/${response.sha}/index.html?min=1`;

		// Do nothing if we're already on that URL
		if (updatedURL === window.location.href) {
			return;
		}

		// Redirect to the latest version of the mod
		window.location.href = updatedURL;
	});
}
