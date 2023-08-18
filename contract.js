'use strict';

const {Contract} = require('fabric-contract-api');

class drugdiscoverynetContract extends Contract {
	
	constructor() {
		// Provide a custom name to refer to this smart contract
		super('org.drug-discovery-network.drugdiscoverynet');
	}
	
	/* ****** All custom functions are defined below ***** */
	
	// This is a basic user defined function used at the time of instantiating the smart contract
	// to print the success message on console
	async instantiate(ctx) {
		console.log('drugdiscoverynet Smart Contract Instantiated');
	}
	
	/**
	 * Create a new Contribution account on the network
	 * @param ctx - The transaction context object
	 * @param ContributionID - ID to be used for creating a new Contribution account
	 * @param name - Name of the Contribution
	 * @param Contribution - Contribution ID of the Contribution
	 * @returns
	 */
	async uploadOrganisationContribution(ctx, ContributionID, name, Contribution) {
		// Create a new composite key for the new Contribution account
		const ContributionKey = ctx.stub.createCompositeKey('org.drug-discovery-network.drugdiscoverynet.Contribution', [ContributionID]);
		
		// Create a Contribution object to be stored in blockchain
		let newContributionObject = {
			ContributionID: ContributionID,
			name: name,
			Contribution: Contribution,
			OrganisationID: ctx.clientIdentity.getID(),
			createdAt: new Date(),
			updatedAt: new Date(),
		};
		
		// Convert the JSON object to a buffer and send it to blockchain for storage
		let dataBuffer = Buffer.from(JSON.stringify(newContributionObject));
		await ctx.stub.putState(ContributionKey, dataBuffer);
		// Return value of new Contribution account created to user
		return newContributionObject;
	}
	
	/**
	 * Get a Contribution account's details from the blockchain
	 * @param ctx - The transaction context
	 * @param ContributionID - Contribution ID for which to fetch details
	 * @returns
	 */
	async getContribution(ctx, ContributionID) {
		// Create the composite key required to fetch record from blockchain
		const ContributionKey = ctx.stub.createCompositeKey('org.drug-discovery-network.drugdiscoverynet.Contribution', [ContributionID]);
		
		// Return value of Contribution account from blockchain
		let ContributionBuffer = await ctx.stub
				.getState(ContributionKey)
				.catch(err => console.log(err));
		return JSON.parse(ContributionBuffer.toString());
	}
	
	/**
	 * Issue a certificate to the Contribution after completing the course
	 * @param ctx
	 * @param ContributionID
	 * @param ContributionStatus
	 * @param owner
	 * @param Inchikey
	 * @returns {Object}
	 */
	async issueContributionCertificate(ctx, ContributionID, ContributionStatus, owner, Inchikey) {
		let msgSender = ctx.clientIdentity.getID();
		let certificateKey = ctx.stub.createCompositeKey('org.drug-discovery-network.drugdiscoverynet.certificate',[ContributionStatus + '-' + ContributionID]);
		let ContributionKey = ctx.stub.createCompositeKey('org.drug-discovery-network.drugdiscoverynet.Contribution', [ContributionID]);
		
		// Fetch Contribution with given ID from blockchain
		let Contribution = await ctx.stub
				.getState(ContributionKey)
				.catch(err => console.log(err));
		
		// Fetch certificate with given ID from blockchain
		let certificate = await ctx.stub
				.getState(certificateKey)
				.catch(err => console.log(err));
		
		// Make sure that Contribution already exists and certificate with given ID does not exist.
		if (Contribution.length === 0 || certificate.length !== 0) {
			throw new Error('Invalid Contribution ID: ' + ContributionID + ' or Course ID: ' + ContributionStatus + '. Either Contribution does not exist or certificate already exists.');
		} else {
			let certificateObject = {
				ContributionID: ContributionID,
				ContributionStatus: ContributionStatus,
				RegulatoryAuthority: msgSender,
				certId: ContributionStatus + '-' + ContributionID,
				Inchikey: Inchikey,
				owner: owner,
				createdAt: new Date(),
				updatedAt: new Date(),
			};
			// Convert the JSON object to a buffer and send it to blockchain for storage
			let dataBuffer = Buffer.from(JSON.stringify(certificateObject));
			await ctx.stub.putState(certificateKey, dataBuffer);
			// Return value of new certificate issued to student
			return certificateObject;
		}
	}
	
	/**
	 *
	 * @param ctx
	 * @param ContributionID
	 * @param ContributionStatus
	 * @param currentInchikey
	 * @returns {Object}
	 */
	async verifyContribution(ctx, ContributionID, ContributionStatus, currentInchikey) {
		let verifier = ctx.clientIdentity.getID();
		let certificateKey = ctx.stub.createCompositeKey('org.drug-discovery-network.drugdiscoverynet.certificate', [ContributionStatus + '-' + ContributionID]);
		
		// Fetch certificate with given ID from blockchain
		let certificateBuffer = await ctx.stub
				.getState(certificateKey)
				.catch(err => console.log(err));
		
		// Convert the received certificate buffer to a JSON object
		const certificate = JSON.parse(certificateBuffer.toString());
		
		// Check if original certificate hash matches the current hash provided for certificate
		if (certificate === undefined || certificate.Inchikey !== currentInchikey) {
			// Certificate is not valid, issue event notifying the Contribution application
			let verificationResult = {
				certificate: ContributionStatus + '-' + ContributionID,
				Contribution: ContributionID,
				verifier: verifier,
				result: 'xxx - INVALID',
				verifiedOn: new Date()
			};
			ctx.stub.setEvent('verifyContribution', Buffer.from(JSON.stringify(verificationResult)));
			return verificationResult;
		} else {
			// Certificate is valid, issue event notifying the Contribution application
			let verificationResult = {
				certificate: ContributionStatus + '-' + ContributionID,
				Contribution: ContributionID,
				verifier: verifier,
				result: 'VALID',
				verifiedOn: new Date()
			};
			ctx.stub.setEvent('verifyContribution', Buffer.from(JSON.stringify(verificationResult)));
			return verificationResult;
		}
	}
	
}

module.exports = drugdiscoverynetContract;