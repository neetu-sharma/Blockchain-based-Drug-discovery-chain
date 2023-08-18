'use strict';

/**
 * This is a Node.JS application to add a new Contribution on the network.
 */

const fs = require('fs');
const yaml = require('js-yaml');
const { FileSystemWallet, Gateway } = require('fabric-network');
let gateway;

async function main(ContributionID, name, Contribution) {

	try {

		const drugdiscoverynetContract = await getContractInstance();

		// Create a new Contribution account
		console.log('.....Create a new Contribution account');
		const ContributionBuffer = await drugdiscoverynetContract.submitTransaction('uploadOrganisationContribution', ContributionID, name, Contribution);

		// process response
		console.log('.....Processing Create Contribution Transaction Response \n\n');
		let newContribution = JSON.parse(ContributionBuffer.toString());
		console.log(newContribution);
		console.log('\n\n.....Create Contribution Transaction Complete!');
		return newContribution;

	} catch (error) {

		console.log(`\n\n ${error} \n\n`);
		throw new Error(error);

	} finally {

		// Disconnect from the fabric gateway
		console.log('.....Disconnecting from Fabric Gateway');
		gateway.disconnect();

	}
}

async function getContractInstance() {

	// A gateway defines which peer is used to access Fabric network
	// It uses a common connection profile (CCP) to connect to a Fabric Peer
	// A CCP is defined manually in file connection-profile-researchanddevelopment.yaml
	gateway = new Gateway();

	// A wallet is where the credentials to be used for this transaction exist
	// Credentials for user researchanddevelopment_ADMIN was initially added to this wallet.
	const wallet = new FileSystemWallet('./identity/regulatory');

	// What is the username of this Client user accessing the network?
	const fabricUserName = 'regulatory_ADMIN';

	// Load connection profile; will be used to locate a gateway; The CCP is converted from YAML to JSON.
	let connectionProfile = yaml.safeLoad(fs.readFileSync('./connection-profile-regulatory.yaml', 'utf8'));

	// Set connection options; identity and wallet
	let connectionOptions = {
		wallet: wallet,
		identity: fabricUserName,
		discovery: { enabled: false, asLocalhost: true }
	};

	// Connect to gateway using specified parameters
	console.log('.....Connecting to Fabric Gateway');
	await gateway.connect(connectionProfile, connectionOptions);

	// Access certification channel
	console.log('.....Connecting to channel - drugdiscoverychannel');
	const channel = await gateway.getNetwork('drugdiscoverychannel');

	// Get instance of deployed drugdiscoverynet contract
	// @param Name of chaincode
	// @param Name of smart contract
	console.log('.....Connecting to drugdiscoverynet Smart Contract');
	return channel.getContract('drugdiscoverynet', 'org.drug-discovery-network.drugdiscoverynet');
}

/* main('200', 'Aakash Bansal', 'connect@aakashbansal.com').then(() => {
	console.log('Contribution account created');
}); */

module.exports.execute = main;
