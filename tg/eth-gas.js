

// Get ETH Gas Data
const getGas = async function (axios, cheerio, bot, chatId, messageId = null, callbackQuery = null) {
    try {
        // Fetch Ethereum gas prices from Etherscan
        const { data } = await axios.get("https://etherscan.io/gastracker");
        const $ = cheerio.load(data);

        // Extract gas prices
        const low = $("#divLowPrice").text().trim();
        const avg = $("#divAvgPrice").text().trim();
        const high = $("#divHighPrice").text().trim();

        // Format message
        const message = `<b>⟠ ETH Gas Tracker</b>\n` +
            `<blockquote><b>🐌 Low Gas:</b>\n${getFormattedGasPrice(low, "Low")}</blockquote>\n` +
            `<blockquote><b>🕛 Average Gas:</b>\n${getFormattedGasPrice(avg, "Average")}</blockquote>\n` +
            `<blockquote><b>🚀 High Gas:</b>\n${getFormattedGasPrice(high, "High")}</blockquote>`;

        const options = {
            parse_mode: "HTML",
            reply_markup: {
                inline_keyboard: [[{ text: "🔃 Refresh", callback_data: "refresh_gas" }]],
            },
        };

        if (messageId) {
            // Try updating the message, fallback if it fails
            bot.editMessageText(message, { chat_id: chatId, message_id: messageId, ...options })
                .catch(() => {
                    if (callbackQuery) {
                        bot.answerCallbackQuery(callbackQuery.id, { text: "⚠ Price Maybe Same.." });
                    }
                });
        } else {
            bot.sendMessage(chatId, message, options);
        }
    } catch (error) {
        console.error("❌ Error: Fetching Gas Price", error.message);
        if (callbackQuery) {
            bot.answerCallbackQuery(callbackQuery.id, { text: "❌ Error: Fetching Gas Price" });
        }
    }
};

// Helper function to format gas price data
function getFormattedGasPrice(text, name) {
    if (!text) return "Test Is Null"; // Handle case where there's no data

    // Clean up spaces in the text and use regex to extract relevant data
    const cleanedText = text.replace(/\s+/g, " ").trim();

    // Regex pattern to match the expected gas price format
    const regex =
        /(\d+\.\d+)\s(\w+)\sBase:\s(\d+\.\d+)\s\|\sPriority:\s(\d+(\.\d+)?)\s\$(\d+\.\d+)\s\|\s~\s(.+)/;

    const match = cleanedText.match(regex);

    if (match) {
        // Extract details from the match and return a formatted string
        const gasPrice = match[1];
        const unit = match[2];
        const fee = match[6];
        const estimatedTime = match[7];

        return `${name}: ${gasPrice} ${unit}\nGas Fee: $${fee}\nEstimated Time: ${estimatedTime}`;
    } else {
        return "Parsing Error.."; // Return error message if parsing fails
    }
}

module.exports = {

    getGas,

}