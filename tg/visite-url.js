//========= all Lib Here =========
const he = require("he");

//========== Main Here ===========
async function visitUrl(bot, axios, chatId, url) {

    try {
        const startTime = Date.now();
        const res = await axios.get(url, { responseType: 'arraybuffer' }); // For handele Buffer data handle
        const responseTime = Date.now() - startTime;
        const { status: statusCode, statusText: statusMessage, headers, data } = res;

        let response = "";
        if (typeof data === "string") {
            response = data;
        } else if (Buffer.isBuffer(data)) {
            response = data.toString('utf-8');
        } else {
            response = JSON.stringify(data, null, 2);
        }

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

            let response = "";
            if (typeof data === "string") {
                response = data;
            } else if (Buffer.isBuffer(data)) {
                response = data.toString('utf-8');
            } else {
                response = JSON.stringify(data, null, 2);
            }

            if (response) {
                errorMessage += response.length > 3000
                    ? `<b>📝 Response Body:</b>\n<blockquote expandable="expandable">${he.encode(response.substring(0, 3000))}</blockquote>`
                    : `<b>📝 Response Body:</b>\n<pre><code>${he.encode(response)}</code></pre>`;
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