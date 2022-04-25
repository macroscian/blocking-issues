regex = /blocked by ([#\d, ]+)/ig

const signature = "This comment was automatically written by babs-bot.";

const blockedLabel = {
	name: "blocked",
	color: "000000",
	description: "This issue needs is waiting for one or more dependencies to be closed.",
}

function getBlockingIssues(body) {
	issues = [];
	for (match of body.matchAll(regex)) {
		for (issue of match [1].split(", ")) {
			issueNumber = parseInt(issue.substring(1));
			issues.push(issueNumber);
		}
	}
	return issues;
}

function getCommentText(blockingIssues, openIssues) {
	const isBlocked = openIssues.length > 0
	var result = "";
	result += `# Status: ${isBlocked ? "Blocked :x:" : "Ready and waiting :heavy_check_mark:"}\n`;
	result += "### Issues blocking this PR: \n";
	for (issue of blockingIssues) {
		var isOpen = openIssues.includes(issue);
		result += `- #${issue} ${isOpen ? ":x:" : ":heavy_check_mark:"}\n`;
	}
	result += "----\n";
	result += signature;
	return result;
}

module.exports = {getBlockingIssues, getCommentText, signature, blockedLabel}
