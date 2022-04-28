const github = require("./github.js");
const utils = require("./utils.js");

async function initLabels() {
    console.log("Getting labels");
    const labels = await github.getLabels();
    var hasBlockedLabel = false;
    for (label of labels) {
	if (label.name === utils.blockedLabel.name) hasBlockedLabel = true;
    }
    if (!hasBlockedLabel) {
	console.log("Creating label");
	await github.createLabel(utils.blockedLabel);
    }
}

async function update(issue) {
    console.log(`Processing #${issue.number}`);
    const blockingIssueNumbers = utils.getBlockingIssues(issue.body);

    if (blockingIssueNumbers.length == 0) {
	console.log("No blocking issues -- removing comment and label");
	await github.removeLabel(issue.number, "blocked");
	// If comment is present, remove it
	const oldComment = await github.getCommentID(issue.number);
	if (oldComment) {
	    await github.deleteComment(oldComment);
	}
	return;
    }
    
    console.log(`Issue is blocked by ${blockingIssueNumbers}`);
    var openIssues = [];
    for (issueNumber of blockingIssueNumbers) {
	const issue = await github.getIssue(issueNumber);
	if (issue.state !== "open") continue;
	openIssues.push(issueNumber);
    }
    console.log(`${issue}  needs these issues to be closed: ${openIssues}`);

    console.log("Writing comment");
    const commentText = utils.getCommentText(blockingIssueNumbers, openIssues);
    await github.writeComment(issue.number, commentText);
    console.log("Comment written");
    
    const isBlocked = openIssues.length > 0;
    console.log(`Applying label? ${isBlocked}`);
    if (isBlocked) await github.applyLabel(issue.number, "blocked");
    else await github.removeLabel(issue.number, "blocked");
    return openIssues.length == 0;
}

async function getOpenIssues() {
    return await github.getOpenIssues();
}

module.exports = {
    initLabels,
    getOpenIssues,
    update,
}
