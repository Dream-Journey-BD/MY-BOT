// Function to visit a URL and fetch its content
async function visitUrl(bot, axios, he, chatId, url) {
    try {
        const startTime = Date.now();
        const res = await axios.get(url);
        const responseTime = Date.now() - startTime;
        const { status: statusCode, statusText: statusMessage, headers, data } = res;

        let response = typeof data === "string" ? data : JSON.stringify(data, null, 2);

        let message =
            `<b>📡 URL Visit Success:</b>\n` +
            `<b>📥 Status Code: ${statusCode} ${statusMessage}</b>\n` +
            `<b>⏳ Response Time: ${responseTime}ms</b>\n` +
            `<b>📜 Content-Type: ${headers["content-type"]}</b>\n`;

        if (response.length > 3000) {
            // For long response, show inside blockquote
            message += `<b>📝 Response Body:</b>\n<blockquote expandable="expandable">${he.encode(response.substring(0, 3000))}</blockquote>`;
        } else {
            // For short response, show inside code block
            message += `<b>📝 Response Body:</b>\n<pre><code>${he.encode(response)}</code></pre>`;
        }

        bot.sendMessage(chatId, message, { parse_mode: "HTML", disable_web_page_preview: true });
    } catch (error) {

        if (error.response) {
            const { status, statusText, headers, data } = error.response;
            let errorMessage = `❌ <b>URL Visit Failed:</b>\n`;
            errorMessage += `📥 <b>Status Code:</b> ${status || "Unknown"} ${statusText || "Error"}\n`;
            errorMessage += `📜 <b>Content-Type:</b> ${headers["content-type"] || "Unknown"}\n`;
            errorMessage += `📝 <b>Error Message:</b> ${error.message}\n`;

            if (data) {
                errorMessage += data.length > 3000
                    ? `<b>📝 Response Body:</b>\n<blockquote expandable="expandable">${he.encode(data.substring(0, 3000))}</blockquote>`
                    : `<b>📝 Response Body:</b>\n<pre><code>${he.encode(data)}</code></pre>`;
            }

            bot.sendMessage(chatId, errorMessage, { parse_mode: "HTML" });
        } else {
            bot.sendMessage(chatId, `❌ <b>URL Visit Failed</b>\nError: ${error.message}`, { parse_mode: "HTML" });
        }
    }
}


module.exports = {

    visitUrl

}