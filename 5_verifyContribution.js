'use strict';

/**
 * This is a Node.JS application to Verify A Contribution's Certificate
 */

const helper = require('./contractHelper');

async function main(ContributionID, ContributionStatus, hash) {

	try {
		const drugdiscoverynetContract = await helper.getContractInstance();

		// Register a listener to listen to custom events triggered by this contract
		const eventListener = await drugdiscoverynetContract.addContractListener('verify-certificate-listener', 'verifyContribution', (err, event) => {
			if (!err) {
				event.payload = JSON.parse(event.payload.toString());
				console.log('\n\n*** NEW EVENT ***');
				console.log(event);
				console.log('\n\n');
			} else {
				console.log(err);
			}
		});

		// Create a new Contribution account
		console.log('.....Verify Contribution');
		const verificationBuffer = await drugdiscoverynetContract.submitTransaction('verifyContribution', ContributionID, ContributionStatus, hash);
		// process response

		return JSON.parse(verificationBuffer.toString());

	} catch (error) {

		console.log(`\n\n ${error} \n\n`);
		throw new Error(error);

	} finally {

		// Disconnect from the fabric gateway
		helper.disconnect();

	}
}

/* main('200', 'PGDBC', 'asdfg').then(() => {
	console.log('Verification result available');
}); */

module.exports.execute = main;
