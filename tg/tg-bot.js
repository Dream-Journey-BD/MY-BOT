// Import required modules
const express = require("express");
const app = express();
const port = process.env.PORT || 3000;

// Create an endpoint to check if the bot is running
app.get("/", (req, res) => res.send("Bot is running!"));
app.listen(port, () => console.log(`Server is listening on port ${port}`));

// Load environment variables from a .env file
require("dotenv").config();

// Import Telegram Bot API, Axios for HTTP requests, and Cheerio for web scraping, and he for HTML encoding
const TelegramBot = require("node-telegram-bot-api");
const axios = require("axios");
const cheerio = require("cheerio");
const he = require("he");

const { extractUrl, getMyUrl, } = require("./common");
const { noMonitorMessage, showMonitorList, startMonitoring } = require("./url-monitor")
const { showAdminList, isAdmin, notAdminAlert } = require("./admin-utils");
const { getGas } = require("./eth-gas");
const { visitUrl } = require("./visite-url");

// Bot token from environment variables
const TOKEN = process.env.BOT_TOKEN;
const bot = new TelegramBot(TOKEN, { polling: true });
const monitoringJobs = {};
console.log("Bot is running...");

// Main bot message handler
bot.on("message", async (msg, metadata) => {

    // get Valid Response
    const chatId = msg.chat.id;
    const userMessage = msg.text ? msg.text.trim() : "";
    const chatType = msg.chat.type;

    if (msg.media_group_id) {
        console.log('This message is part of a media group:', msg.media_group_id);
    } else {
        console.log('This is a single media message:');
    }


    if (chatType == "private") {
        //getChannelMessageId(msg, bot, metadata.type);
    }

    if (!userMessage) return;
    // Call Neccarey Methode
    if (userMessage.startsWith("/")) {
        handleCommand(chatId, userMessage, msg);
    }
});

// Handle All Command
function handleCommand(chatId, userMessage, msg) {

    if (userMessage.startsWith("/gas")) {

        getGas(axios, cheerio, bot, chatId);

    }
    else if (userMessage.startsWith("/visiturl")) {

        const url = userMessage.split(" ")[1]?.trim();
        url && visitUrl(bot, axios, he, chatId, url, userMessage.message_id);

    }
    else if (userMessage.startsWith("/urlmonitor")) {
        startMonitoring(bot, axios, monitoringJobs, chatId, userMessage, msg);
    }
    else if (userMessage.startsWith("/monitorlist")) {
        showMonitorList(bot, monitoringJobs, chatId, msg);
    }
    else if (userMessage.startsWith("/adminlist")) {

        showAdminList(bot, msg);

    }
    else {
        console.log("Command Not Found:", userMessage);
    }

}

// Function to start monitoring a URL
bot.on("callback_query", async (callbackQuery) => {
    const msg = callbackQuery.message;
    const chatId = msg.chat.id;
    const userId = callbackQuery.from.id;
    const username = callbackQuery.from.username;
    const data = callbackQuery.data;
    const messageId = msg.message_id;

    if (data === "stop_monitor") {

        const url = extractUrl(msg.text)
        const isUserAdmin = await isAdmin(bot, chatId, userId);

        if (!isUserAdmin) {
            return bot.answerCallbackQuery(callbackQuery.id, { text: notAdminAlert, show_alert: true });
        }

        else if (!monitoringJobs[chatId] || !monitoringJobs[chatId][url]) {
            bot.answerCallbackQuery(callbackQuery.id, {
                text: "⚠️ Monitoring URL Not Found!",
                show_alert: false
            });

            let message = "<b>⚠️ Monitoring URL Not Found!</b>\n\n";
            message += "<b>Action By:</b> @" + username + "\n\n";
            message += "<b>⚡</b>";
            return bot.editMessageText(message, {
                chat_id: chatId,
                message_id: messageId,
                parse_mode: 'HTML'
            });

        }

        clearInterval(monitoringJobs[chatId][url].intervalId);
        delete monitoringJobs[chatId][url];

        let message = "<b>🛑 Monitoring Stopped For:</b>\n\n";
        message += `<b><blockquote expandable="expandable" >🔗 URL: ${url}</blockquote></b>\n\n`;
        message += "<b>👤 Stopped By: @" + username + "</b>\n\n";
        message += "<b>⚡ Action Successfully!</b>\n\n";

        bot.editMessageText(message, {
            chat_id: chatId,
            message_id: messageId,
            parse_mode: 'HTML',
            disable_web_page_preview: true
        });

    }
    if (data === "restart_monitor") {

        const url = extractUrl(msg.text);
        const adminPass = { from: { id: userId, username: username }, chat: { id: chatId } }
        const isUserAdmin = await isAdmin(bot, chatId, userId);
        if (isUserAdmin) {
            startMonitoring(bot, axios, monitoringJobs, chatId, `/urlmonitor ${url}`, adminPass);
            return bot.answerCallbackQuery(callbackQuery.id, { text: "Monitoring restarted successfully!" });
        }
        else {
            return bot.answerCallbackQuery(callbackQuery.id, { text: notAdminAlert, show_alert: true });
        }

    }
    if (data === "refresh_gas") {
        getGas(axios, cheerio, bot, chatId, messageId, callbackQuery);
    }
    if (data.startsWith("stop_button")) {
        const number = data.split("_")[2];
        const url = getMyUrl(msg.text, number);
        const isUserAdmin = await isAdmin(bot, chatId, userId);

        if (!isUserAdmin) {
            return bot.answerCallbackQuery(callbackQuery.id, { text: notAdminAlert, show_alert: true });
        }
        if (!url) return bot.answerCallbackQuery(callbackQuery.id, { text: "⚠️ URL Not Found.." });

        if (monitoringJobs[chatId] && monitoringJobs[chatId][url]) {
            clearInterval(monitoringJobs[chatId][url].intervalId);
            delete monitoringJobs[chatId][url];

            let message = "<b>🔍 Monitoring List:</b>\n\n";
            let button = [];
            if (!monitoringJobs[chatId]) {
                return noMonitorMessage(bot, username, chatId, messageId);
            }

            const chatMonitoringJobs = monitoringJobs[chatId];

            if (Object.keys(chatMonitoringJobs).length === 0) {
                return noMonitorMessage(bot, username, chatId, messageId);
            } else {
                let number = 1;
                for (const url in chatMonitoringJobs) {
                    message += `<blockquote><b>[ ${number++} ] URL:</b> ${url} <b>\n\n`;
                    message += `👤 Set By: </b>${chatMonitoringJobs[url].adminUsername}</blockquote>\n\n`;
                    button.push([{ text: `${number - 1}`, callback_data: `stop_button_${number - 1}` }]);
                }
                message += `<b><blockquote>Note:📌 Select a URL to stop monitoring by clicking the button below ⬇️</blockquote></b>`
                bot.editMessageText(message, {
                    chat_id: chatId,
                    message_id: messageId,
                    parse_mode: 'HTML',
                    disable_web_page_preview: true,
                    reply_markup: {
                        inline_keyboard: button
                    }
                });
                bot.answerCallbackQuery(callbackQuery.id, { text: `✅ Monitoring Stopped for URL No: ${number}` });
            }

        } else {
            noMonitorMessage(bot, username, chatId, messageId)
            return bot.answerCallbackQuery(callbackQuery.id, { text: "⚠️ Monitoring URL Not Found!" });
        }
    }

    //=================Post maker==============
    //if (data === "add_button") handleCallback(bot, chatId);


});

module.exports = {

    bot

}