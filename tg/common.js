const developers = [123456789, 987654321]; // Bot Developer IDs here
const priveteChatAlert = "⚠️ This command is not available in private chats..";
const notDevAlert = "⚠️ This command is only available to the bot developers..";


// Check if the chat is a private chat
function isPrivateChat(chatId) {
    return chatId.toString().startsWith('-') === false;
}

// Check if the user is a developer
function isDeveloper(userId) {
    return developers.includes(userId); // Checks if the user ID is in the list of developers
}
// Extract URLs from a message
function extractUrl(message) {
    const urlRegex = /(https?:\/\/[^\s]+)/g;
    const matches = message.match(urlRegex);
    return matches ? matches : [];
}
// Check if the URL is valid
function isValidURL(url) {
    const regex = /^(https?:\/\/).+/i;
    return regex.test(url);
}
// Get the URL at a specific position
function getMyUrl(message, position) {
    const urlRegex = /URL:\s(https?:\/\/[^\s]+)/g;
    let urls = [];
    let match;

    while ((match = urlRegex.exec(message)) !== null) {
        urls.push(match[1]); // Push the matched URL
    }

    if (position > 0 && position <= urls.length) {
        return urls[position - 1];
    } else {
        return null;
    }
}

// Export the functions
module.exports = {
    isDeveloper,
    isPrivateChat,
    extractUrl,
    isValidURL,
    getMyUrl,
    priveteChatAlert,
    notDevAlert
}