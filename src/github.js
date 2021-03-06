const core = require('@actions/core');
const github = require('@actions/github');
const utils = require("./utils.js");
const model = require("./model.js");

const token = core.getInput("token");
const octokit = github.getOctokit(token);

function getCurrentIssueNumber() {
    return github.context.issue.number;
}

async function getLabels() {
    var json = await octokit.rest.issues.listLabelsForRepo({
	owner: github.context.repo.owner,
	repo: github.context.repo.repo,
    });
    return json.data;
}

async function createLabel(label) {
    await octokit.rest.issues.createLabel({
	owner: github.context.repo.owner,
	repo: github.context.repo.repo,
	name: label.name,
	description: label.description,
	color: label.color,
    })
}

async function updateLabel(label, newName) {
    await octokit.rest.issues.updateLabel({
	owner: github.context.repo.owner,
	repo: github.context.repo.repo,
	name: label.name,
	new_name: newName
    })
}


async function getIssue(number) {
    var json = await octokit.rest.issues.get({
	owner: github.context.repo.owner,
	repo: github.context.repo.repo,
	issue_number: number,
    }).catch(error => {
	console.log(`Failed to get issue #${number}`);
	core.setFailed(error);
    });
    return json.data;
}

async function getComments(issueNumber) {
    var json = await octokit.rest.issues.listComments({
	owner: github.context.repo.owner,
	repo: github.context.repo.repo,
	issue_number: issueNumber,
    });
    return json.data;
}

async function rewriteComment(id, text) {
    await octokit.rest.issues.updateComment({
	owner: github.context.repo.owner,
	repo: github.context.repo.repo,
	comment_id: id,
	body: text,
    });
}

async function deleteComment(id) {
    await octokit.rest.issues.deleteComment({
	owner: github.context.repo.owner,
	repo: github.context.repo.repo,
	comment_id: id,
    });
}

async function getCommentID(issueNumber) {
    comments = await getComments(issueNumber);
    for (comment of comments) {
	if (comment.body.endsWith(utils.signature)) {
	    return comment.id;
	}
    }
}

async function writeComment(issueNumber, text) {
    const id = await getCommentID(issueNumber);
    if (id) {
	console.log(`Found old comment (id ${comment.id}). Updating...`);
	return await rewriteComment(id, text);
    } else {
	await octokit.rest.issues.createComment({
	    owner: github.context.repo.owner,
	    repo: github.context.repo.repo,
	    issue_number: issueNumber,
	    body: text,
	});
    }
}

async function applyLabel(issueNumber, label) {
    await octokit.rest.issues.addLabels({
	owner: github.context.repo.owner,
	repo: github.context.repo.repo,
	issue_number: issueNumber,
	labels: [label]
    });
}

async function getLabelsForIssue(issueNumber) {
    const json = await octokit.rest.issues.listLabelsOnIssue({
	owner: github.context.repo.owner,
	repo: github.context.repo.repo,
	issue_number: issueNumber,
    });
    return json.data;
}

async function removeLabel(issueNumber, label) {
    for (otherLabel of await getLabelsForIssue(issueNumber)) {
	if (otherLabel.name == label) {
	    return await octokit.rest.issues.removeLabel({
		owner: github.context.repo.owner,
		repo: github.context.repo.repo,
		issue_number: issueNumber,
		name: label
	    });
	}
    }
}

async function getBlockedIssues() {
    const json = await octokit.rest.issues.listForRepo({
	owner: github.context.repo.owner,
	repo: github.context.repo.repo,
	state: "open",
	labels: utils.blockedLabel.name,
    });
    return json.data;
}

async function getOpenIssues() {
    const json = await octokit.rest.issues.listForRepo({
	owner: github.context.repo.owner,
	repo: github.context.repo.repo,
	state: "open"
    });
    return json.data;
}



// async function rerunUpdate(issueNumber) {
// 	console.log(`    Getting PR #${issueNumber}`);
// 	const pr = await getIssue(issueNumber);
//     await model.update(pr);
// }

module.exports = {
    // Issues
    getCurrentIssueNumber,
    getIssue,

    // labels
    getLabels,
    createLabel,
    updateLabel,
    applyLabel,
    removeLabel,
    getBlockedIssues,
    getOpenIssues,
    getLabelsForIssue,

    // comments
    deleteComment,
    getCommentID,
    writeComment,

    //	rerunUpdate,
}
