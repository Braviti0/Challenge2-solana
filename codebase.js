// Import Solana web3 functinalities
const {
  Connection,
  PublicKey,
  clusterApiUrl,
  Keypair,
  LAMPORTS_PER_SOL,
} = require("@solana/web3.js");

// Acquire userAddress from CLI
const userAddress = process.argv[2]

// Get the wallet balance for userAddress
const getWalletBalance = async () => {
  try {
    // Connect to the Devnet
    const connection = new Connection(clusterApiUrl("devnet"), "confirmed");

    // Get wallet balance for userAddress
    const walletBalance = await connection.getBalance(
      new PublicKey(userAddress)
    );
    console.log(
      `Wallet balance: ${parseInt(walletBalance) / LAMPORTS_PER_SOL} SOL`
    );
  } catch (err) {
    console.log(err);
  }
};

const airDropSol = async () => {
  try {
    // Connect to the Devnet
    const connection = new Connection(clusterApiUrl("devnet"), "confirmed");

    // Request airdrop of 2 SOL to the wallet
    console.log("Airdropping some SOL to my wallet!");
    const fromAirDropSignature = await connection.requestAirdrop(
      new PublicKey(userAddress),
      2 * LAMPORTS_PER_SOL
    );
    await connection.confirmTransaction(fromAirDropSignature);
  } catch (err) {
    console.log(err);
  }
};

// Show the wallet balance before and after airdropping SOL
const mainFunction = async () => {
  if (userAddress != null) {
    try {
      await getWalletBalance();
      await airDropSol();
      await getWalletBalance();
    } catch (error) {
      console.log(error)
    }
    
  } else {
    console.log('\nTHIS FUNCTIONS TAKES A PUBLIC KEY AS A CLI ARGUMENT\n\nusage: node index.js <your-public-key>\n')
  }
};

mainFunction();