const TelegramBot = require("node-telegram-bot-api");
const { Client, PrivateKey } = require("@hashgraph/sdk");
require("dotenv").config(); // Load environment variables

// Initialize Telegram Bot
const bot = new TelegramBot(process.env.BOT_TOKEN, { polling: true });

// Hedera Client Setup (default operator for fallback actions)
const defaultClient = Client.forTestnet().setOperator(process.env.OPERATOR_ID, process.env.OPERATOR_KEY);

// In-memory wallet storage for simplicity
const userWallets = {}; // Stores wallet info for each user

// "Connect Wallet" command
bot.onText(/\/connectWallet (.+)/, (msg, match) => {
  const chatId = msg.chat.id;
  const [accountId, privateKey] = match[1].split(" ");

  // Validate the input
  if (!accountId || !privateKey) {
    bot.sendMessage(chatId, "Invalid input! Use the format: /connectWallet <AccountID> <PrivateKey>");
    return;
  }

  try {
    // Verify if the private key is valid
    PrivateKey.fromString(privateKey);

    // Store the user's wallet info in memory
    userWallets[chatId] = { accountId, privateKey };

    // Log connected wallets to the terminal
    console.log(`Wallet connected for chat ID: ${chatId}`);
    console.log("Connected Wallets:", userWallets);

    bot.sendMessage(chatId, `Wallet connected successfully! Account ID: ${accountId}`);
  } catch (error) {
    bot.sendMessage(chatId, "Invalid private key format. Please check and try again.");
  }
});

// "Disconnect Wallet" command
bot.onText(/\/disconnectWallet/, (msg) => {
  const chatId = msg.chat.id;

  // Check if the user has a connected wallet
  if (!userWallets[chatId]) {
    bot.sendMessage(chatId, "No wallet is connected to disconnect.");
    return;
  }

  // Remove the user's wallet from the in-memory storage
  delete userWallets[chatId];
  console.log(`Wallet disconnected for chat ID: ${chatId}`);
  bot.sendMessage(chatId, "Your wallet has been disconnected successfully.");
});

// Log message to confirm the bot is running
console.log("Telegram bot is running...");
