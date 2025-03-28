const { isPrivateChat, isValidURL } = require("./common");
const { isAdmin, notAdminAlert } = require("./admin-utils")


// /Monitor Any Website Command handler
async function startMonitoring(bot, axios, monitoringJobs, chatId, userMessage, msg) {
    const userId = msg.from.id;
    const username = msg.from.username;
    const url = userMessage.split(" ")[1];

    if (!monitoringJobs[chatId]) monitoringJobs[chatId] = {};
    const options = {
        parse_mode: 'Markdown',
        disable_web_page_preview: true,
        reply_markup: {
            inline_keyboard: [
                [{ text: "🛑 Stop Monitoring", callback_data: `stop_monitor` }]
            ]
        }
    };

    // Check Valid Action
    if (isPrivateChat(chatId)) return bot.sendMessage(chatId, priveteChatAlert);
    if (!url || !isValidURL(url)) return bot.sendMessage(chatId, "⚠️ Please provide a valid URL for monitoring.");
    const isUserAdmin = await isAdmin(bot, chatId, userId);
    if (!isUserAdmin) return bot.sendMessage(chatId, notAdminAlert);
    if (monitoringJobs[chatId][url]) return bot.sendMessage(chatId, `*⚠️ Monitoring Status:\n\nURL: ${url}\n\nThis is already running.*`, options);

    bot.sendMessage(chatId, `*🔍 Monitoring started For:\n\n🔗 URL: ${url}\n\n⏰ Checking every 10 minutes...\n\n🔁*`, options);

    // Start Monitoring
    monitoringJobs[chatId][url] = {
        intervalId: setInterval(async () => {
            try {
                console.log(`Monitoring Job Start For ${url}...`);
                const startTime = Date.now();
                const response = await axios.get(url);
                if (response.status === 200) {
                    const responseTime = Date.now() - startTime;
                    const { status: statusCode, statusText: statusMessage } = response;
                    clearInterval(monitoringJobs[chatId][url].intervalId);
                    delete monitoringJobs[chatId][url];
                    const restartOption = {
                        parse_mode: 'Markdown',
                        disable_web_page_preview: true,
                        reply_markup: {
                            inline_keyboard: [
                                [{ text: "🔄 Restart Monitoring", callback_data: `restart_monitor` }]
                            ]
                        }
                    };

                    let message = `*👋 Hello Friends:*\n\n`;
                    message += `*🔗 URL: ${url} is now active!*\n\n`;
                    message += `*🌐 Status Code: ${statusCode} ${statusMessage}*\n\n`;
                    message += `*⏳ Response Time: ${responseTime}ms*\n\n`;
                    message += `*➡ @${username}, The website is back online! 🎉*`;

                    bot.sendMessage(chatId, message, restartOption);
                }
            } catch (error) {
                if (error.response) {
                    const { status, statusText } = error.response;
                    console.log(`Status: ${status || "Unknown"} ${statusText || "Error"}\n❌ ${url} is still down...`);
                } else {
                    console.log(`❌ ${url} is still down...\n Because ${error.message}`);
                }
            }

        }, 5 * 60 * 1000), // Every 5 minutes
        adminId: userId,
        adminUsername: username,
        adminChatId: chatId
    };

}

async function showMonitorList(bot, monitoringJobs, chatId, msg) {
    const userId = msg.from.id;
    const username = msg.from.username;
    let message = "<b>🔍 Monitoring List:</b>\n\n";
    let button = [];

    if (isPrivateChat(chatId)) return bot.sendMessage(chatId, priveteChatAlert);
    const admin = await isAdmin(bot, chatId, userId);
    if (!admin) return bot.sendMessage(chatId, notAdminAlert);
    if (!monitoringJobs[chatId]) {
        message += "<b>🚫 No URLs are currently being monitored!</b>\n\n";
        message += `<b>Action By: @${username}</b>\n\n`;
        message += "<b>⚡</b>";
        return bot.sendMessage(chatId, message, { parse_mode: 'HTML' });
    }

    const chatMonitoringJobs = monitoringJobs[chatId];

    if (Object.keys(chatMonitoringJobs).length === 0) {

        message += "<b>🚫 No URLs are currently being monitored!</b>\n\n";
        message += `<b>Action By: @${username}</b>\n\n`;
        message += "<b>⚡</b>";
        return bot.sendMessage(chatId, message, { parse_mode: 'HTML' });

    } else {
        let number = 1;
        for (const url in chatMonitoringJobs) {
            message += `<blockquote><b>[ ${number++} ] URL:</b> ${url} <b>\n\n`;
            message += `👤 Set By: </b>${chatMonitoringJobs[url].adminUsername}</blockquote>\n\n`;
            button.push([{ text: `${number - 1}`, callback_data: `stop_button_${number - 1}` }]);
        }
        message += `<b><blockquote>Note:📌 Select a URL to stop monitoring by clicking the button below ⬇️</blockquote></b>`

        bot.sendMessage(chatId, message, {
            parse_mode: 'HTML',
            disable_web_page_preview: true,
            reply_markup: {
                inline_keyboard: button
            }
        });
    }
}

// Handle No Monitor Message
function noMonitorMessage(bot, username, chatId, messageId) {
    let message = "<b>🔍 Monitoring List:</b>\n\n";
    message += "<b>🚫 No URLs are currently being monitored!</b>\n\n";
    message += `<b>Action By: @${username}</b>\n\n`;
    message += "<b>⚡</b>";
    bot.editMessageText(message, {
        chat_id: chatId,
        message_id: messageId,
        parse_mode: 'HTML'
    });
}


module.exports = {
    // Monitoring Module Here
    startMonitoring,
    showMonitorList,
    noMonitorMessage

}