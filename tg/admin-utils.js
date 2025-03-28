//===== All Admin Code this file ======
const { isPrivateChat } = require("./common");

const notAdminAlert = "🚫 You need to be an admin to use this..";

//======= Show Admin List ===========
async function showAdminList(bot, msg) {
    const messageId = msg.message_id;
    const chatId = msg.chat.id;
    const chatName = msg.chat.title;
    try {
        const admins = await bot.getChatAdministrators(chatId);
        const adminList = admins
            .map(admin => {
                const role = admin.status;
                const username = admin.user.username ? `@${admin.user.username}` : admin.user.first_name;
                return `<blockquote><b>👤 ${username}\n⚡ Role: ${role}</b></blockquote>`;
            })
            .join("\n");

        await bot.sendMessage(
            chatId,
            `<b>🔹 Admins Of </b><i><b>${chatName}</b></i>\n\n${adminList}`,
            { reply_to_message_id: messageId, parse_mode: "HTML" }
        );
    } catch (error) {
        bot.sendMessage(chatId, "⚠️ Error fetching admin list.", { reply_to_message_id: messageId });
    }
}

// Combined method to check if the user is an admin in either group or channel
async function isAdmin(bot, chatId, userId) {
    try {
        if (isPrivateChat(chatId)) {
            console.log("This is a private chat, not a group or channel.")
            return false;
        }
        const admins = await bot.getChatAdministrators(chatId);
        return admins.some(admin => admin.user.id === userId);
    } catch (error) {
        console.error("Failed to fetch admins:", error);
        return false;
    }
}

module.exports = {

    isAdmin,
    showAdminList,
    notAdminAlert,

}