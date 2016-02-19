console.log('Starting password manager');

var crypto = require('crypto-js')
var storage = require('node-persist');
storage.initSync();

var argv = require('yargs')
	.command('create', 'Creates a new account', function(yargs) {
		yargs.options({
			name: {
				demand: true,
				alias: 'n',
				description: 'Account name (eg: Twitter, Facebook)',
				type: 'string'
			},
			username: {
				demand: true, 
				alias: 'u',
				description: 'Account username or email',
				type: 'string'
			},
			password: {
				demand: true,
				alias: 'p',
				description: "Your account password",
				type: 'string'
			},
			masterPassword: {
				demand: true,
				alias: 'm',
				description: 'Master password',
				type: 'string'
			}
		}).help('help');
	})
	.command('get', 'Get an existing account', function(yargs){
		yargs.options({
			name: {
				demand: true,
				alias: 'n',
				description: 'Account name (eg: Twitter, Facebook)',
				type: 'string'
			},
			masterPassword: {
				demand: true,
				alias: 'm',
				description: 'Master password',
				type: 'string'
			}
		}).help('help');
	})
	.help('help')
	.argv;
var command = argv._[0];

//create
// --name
// --username
// --password

//get
// --name

// account.name facebook
//acount.username User12!
//account.password password123

function getAccounts(masterPassword){
// use getItemSync to fetch accounts
var encryptedAccount = storage.getItemSync('accounts');

var accounts = [];

// decrypt
if(typeof encryptedAccount !== 'undefined'){
	var bytes = crypto.AES.decrypt(encryptedAccount, masterPassword);
	var accounts = JSON.parse(bytes.toString(crypto.enc.UTF8));
}

// return accounts array
return accounts;
}

function saveAccounts (accounts, masterPassword){
	//encrypt accounts
	var encryptedAccounts = crypto.AES.encrypt(JSON.stringify(accounts), masterPassword);

	// setItemSync
	storage.setItemSync('accounts', encryptedAccounts.toString());

	//return accounts array
	return accounts;
}

function createAccount (account, masterPassword){
	var accounts = getAccounts(masterPassword);

	accounts.push(account);

	// storage.setItemSync('accounts', accounts);
	saveAccounts(accounts, masterPassword);

	return account;
}

function getAccount(accountName, masterPassword){
	// var accounts = storage.getItemSync('accounts');
	var accounts = getAccounts(masterPassword);
	var matchedAccount;

	accounts.forEach(function (account) {
		if(account.name === accountName){
			matchedAccount = account;
		}
	});

	return matchedAccount;
}

if (command === 'create') {
	 try {
			var createdAccount = createAccount({
			name: argv.name,
			username: argv.username,
			password: argv.password
		}, argv.masterPassword);
		console.log('Account created!');
		console.log(createdAccount);
	} catch (e) {
	console.log("Unable to create Account");
	}
} else if(command === 'get') {
	try {
		var fetchedAccount = getAccount(argv.name, argv.masterPassword);

	if(typeof fetchedAccount === 'undefined') {
		console.log('Account not found! :(');
	} else {
		console.log('Account found! :)');
		console.log(fetchedAccount);
	} 
} catch(e){
	console.log('Unable to fetch Account!');
}
}

