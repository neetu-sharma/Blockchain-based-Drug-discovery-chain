'use strict';

/**
 * This is a Node.JS application to fetch a Contribution Account from network
 * Defaults:
 * ContributionID: 0001
 */

const helper = require('./contractHelper');

async function main(ContributionID) {

	try {
		const drugdiscoverynetContract = await helper.getContractInstance();

		// Create a new Contribution account
		console.log('.....Get Contribution Account');
		const ContributionBuffer = await drugdiscoverynetContract.submitTransaction('getContribution', ContributionID);

		// process response
		console.log('.....Processing Get Contribution Transaction Response\n\n');
		let existingContribution = JSON.parse(ContributionBuffer.toString());
		console.log(existingContribution);
		console.log('\n\n.....Get Contribution Transaction Complete!');
    return existingContribution;

	} catch (error) {

		console.log(`\n\n ${error} \n\n`);
    throw new Error(error);

	} finally {

		// Disconnect from the fabric gateway
		helper.disconnect();

	}
}

/* main('200').then(() => {

	console.log('.....API Execution Complete!');

}); */
