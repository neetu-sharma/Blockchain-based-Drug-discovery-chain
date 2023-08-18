'use strict';

/**
 * This is a Node.JS application to Issue a Certificate to Contribution
 */

const helper = require('./contractHelper');

async function main(ContributionID, ContributionStatus, owner, hash) {

	try {
		const drugdiscoverynetContract = await helper.getContractInstance();

		// Create a new Contribution account
		console.log('.....Issue Contribution Certificate');
		const certificateBuffer = await drugdiscoverynetContract.submitTransaction('issueContributionCertificate', ContributionID, ContributionStatus, owner, hash);

		// process response
		console.log('.....Processing Issue contribution Certificate Transaction Response \n\n');
		let newCertificate = JSON.parse(certificateBuffer.toString());
		console.log(newCertificate);
		console.log('\n\n.....Issue contribution Certificate Transaction Complete!');
		return newCertificate;

	} catch (error) {

		console.log(`\n\n ${error} \n\n`);
		throw new Error(error);

	} finally {

		// Disconnect from the fabric gateway
		helper.disconnect();

	}
}

/* main('200', 'PGDBC', 'A', 'asdfgh').then(() => {
	console.log('Certificate created for the Contribution');
}); */

module.exports.execute = main;
