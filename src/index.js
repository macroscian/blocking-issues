const core = require('@actions/core');
const model = require('./model.js');


async function main() {
    try {
	console.log("Initializing labels");
	await model.initLabels();
	console.log("Getting issue");
	const issues = await model.getOpenIssues();
	var isReady=false;
	for (issue of issues) {
	    
	    console.log("Analyzing current issue");
	    isReady = await model.update(issue);

	    if (isReady == false)  // undefined means no blocking issues
		console.log("Issue is blocked")
	    else if (isReady == undefined) 
		console.log("No blocking issues found.")
	    else if (isReady == true) 
		console.log("All blocking issues have been closed")
	}
    } catch (error) {
	core.setFailed(error.message);
    }
}

main()
