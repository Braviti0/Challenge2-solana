// Import Solana web3 functinalities
const {
    Connection,
    PublicKey,
    clusterApiUrl,
    Keypair,
    LAMPORTS_PER_SOL,
    Transaction,
    SystemProgram,
    sendAndConfirmRawTransaction,
    sendAndConfirmTransaction
} = require("@solana/web3.js");

// Stored secret key of from wallet
const DEMO_FROM_SECRET_KEY = new Uint8Array(
    [
      105, 153, 200,  77,  70,  43, 200,   2, 150, 107, 168,
       87, 252, 187, 116,  53,  19, 155, 220,  85, 146, 210,
      200,  66, 194, 105, 113, 114, 186,  37,  45,  22, 181,
      238,  65, 181, 103,  80, 190, 104, 214,  86, 192,  96,
       68, 182, 161, 165,  45, 116, 105,   1, 118,  79, 212,
       86, 109,  10, 223, 110, 195, 197, 187,  57
    ]            
);
// Get Keypair from Secret Key
var from = Keypair.fromSecretKey(DEMO_FROM_SECRET_KEY);

// function for airdropping Sol to from wallet if it is empty
const airdropSol = async(publicKey) => {
    // Create a new connection
    const connection = new Connection(clusterApiUrl("devnet"), "confirmed");

    // Airdrop 2 SOL to Sender wallet
    console.log("Airdopping some SOL to Sender wallet!");
    const fromAirDropSignature = await connection.requestAirdrop(
        new PublicKey(from.publicKey),
        2 * LAMPORTS_PER_SOL
    );

    // Latest blockhash (unique identifer of the block) of the cluster
    let latestBlockHash = await connection.getLatestBlockhash();

    // Confirm transaction using the last valid block height (refers to its time)
    // to check for transaction expiration
    await connection.confirmTransaction({
        blockhash: latestBlockHash.blockhash,
        lastValidBlockHeight: latestBlockHash.lastValidBlockHeight,
        signature: fromAirDropSignature
    });

    console.log("Airdrop completed for the Sender account");
};

// function for transferring a given ratio of Sol

const transferSol = async(ratio) => {

    // Create a new connection
    const connection = new Connection(clusterApiUrl("devnet"), "confirmed");

    let amount = await getWalletBalance(from.publicKey) * ratio;

    // Irrelevant comments
    // Other things to try: 
    // 1) Form array from userSecretKey
    // const from = Keypair.fromSecretKey(Uint8Array.from(userSecretKey));
    // 2) Make a new Keypair (starts with 0 SOL)
    // const from = Keypair.generate();

    // Generate another Keypair (account we'll be sending to)
    const to = Keypair.generate();

    // Get balances for from and to wallet before airdrop
    await getBalances(from.publicKey, to.publicKey);

    // Send money from "from" wallet and into "to" wallet
    var transaction = new Transaction().add(
        SystemProgram.transfer({
            fromPubkey: from.publicKey,
            toPubkey: to.publicKey,
            lamports: Math.ceil(amount * LAMPORTS_PER_SOL)
        })
    );

    // Sign transaction
    var signature = await sendAndConfirmTransaction(
        connection,
        transaction,
        [from]
    );
    console.log('Signature is ', signature);
    
    // Get Wallet balances for from and to wallet after sending Sol
    await getBalances(from.publicKey, to.publicKey);
};

// Get the wallet balance for given address
const getWalletBalance = async (publicKey) => {
  try {
    // Connect to the Devnet
    const connection = new Connection(clusterApiUrl("devnet"), "confirmed");

    // Get wallet balance for given address
    let walletBalance = await connection.getBalance(
      publicKey
    );
    return walletBalance/LAMPORTS_PER_SOL;
  } catch (err) {
    console.log(err);
  }
};


// Get wallet balances
const getBalances = async (fromWallet, toWallet) => {
    try {
        var fromWalletBalance =  await getWalletBalance(fromWallet);
        let toWalletBalance = await getWalletBalance(toWallet);
        console.log('from Wallet balance: ', fromWalletBalance);
        console.log('to Wallet balance: ', toWalletBalance);
    } catch (error) {
        console.log(error);
    }
};

// Check if from wallet balance is not low then transfer
// else airdrop 2 Sol to from wallet

// Derived function transferring half of from wallet balance

const transferHalfOfSol = async() => {
    let fromWalletBalance = await getWalletBalance(from.publicKey);
    console.log("Initializing\nMaking sure sender address balance is not low");
    if (fromWalletBalance > 0.5) {
        console.log('Sender address balance is adequate\nInitiating transfer of Sol')
        transferSol(0.5);
    } else {
        console.log('The sender has insufficient Sol\nAttempting to airdrop Sol to sender address');
        await airdropSol(from.publicKey);
        transferSol(0.5);
    } 
}

// Call the derived function

transferHalfOfSol();
