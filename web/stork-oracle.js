//======= Lib impl ===========
const he = require('he');
const { devID, userAgent } = require("../tg/developer-utils")
const { waitSeconds } = require("./common")

let jwtValue = '';

let createBotMessage = '';

let messageID = '';


//Some Change Here New Api Intigtret
var jwtOptions = {
    method: 'POST',
    url: 'https://app-auth.jp.stork-oracle.network/token',
    params: { grant_type: 'refresh_token' },
    headers: {
        accept: '*/*',
        'accept-language': 'en-US,en;q=0.9,bn-BD;q=0.8,bn;q=0.7',
        'content-type': 'application/json',
        origin: 'chrome-extension://knnliglhgkmlblppdejchidfihjnockl',
        'user-agent': userAgent
    },
    data: { refresh_token: 'Us1nxodl5GJr8Gu6FpEOnw' }
};


const callOptions = (jwt) => ({
    method: 'GET',
    url: 'https://app-api.jp.stork-oracle.network/v1/stork_signed_prices',
    headers: {
        accept: '*/*',
        'accept-language': 'en-US,en;q=0.9,bn-BD;q=0.8,bn;q=0.7',
        authorization: jwt,
        origin: 'chrome-extension://knnliglhgkmlblppdejchidfihjnockl',
        priority: 'u=1, i',
        'sec-fetch-dest': 'empty',
        'sec-fetch-mode': 'cors',
        'sec-fetch-site': 'cross-site',
        'user-agent': userAgent
    }
});


const validationOptions = (msg_hash, jwt) => ({
    method: 'POST',
    url: 'https://app-api.jp.stork-oracle.network/v1/stork_signed_prices/validations',
    headers: {
        accept: '*/*',
        'accept-language': 'en-US,en;q=0.9,bn-BD;q=0.8,bn;q=0.7',
        authorization: jwt,
        'content-type': 'application/json',
        origin: 'chrome-extension://knnliglhgkmlblppdejchidfihjnockl',
        priority: 'u=1, i',
        'sec-fetch-dest': 'empty',
        'sec-fetch-mode': 'cors',
        'sec-fetch-site': 'cross-site',
        'user-agent': userAgent
    },
    data: {
        msg_hash: msg_hash,
        valid: true
    }
});

const meOptions = (jwt) => ({
    method: 'GET',
    url: 'https://app-api.jp.stork-oracle.network/v1/me',
    headers: {
        accept: '*/*',
        'accept-language': 'en-US,en;q=0.9,bn-BD;q=0.8,bn;q=0.7',
        authorization: jwt,
        origin: 'chrome-extension://knnliglhgkmlblppdejchidfihjnockl',
        'sec-ch-ua-platform': '"Windows"',
        'user-agent': userAgent
    }
});


//====== Main Methode Here ==========
async function callStorkLoop(bot, axios) {
    while (true) {

        createBotMessage = '';
        await callStork(axios);
        await callMeProfile(bot, axios);
        await waitSeconds(300, 310);

    }

}

async function callStork(axios) {

    try {

        const response = await axios(callOptions(jwtValue));
        const data = response.data;

        const assetKey = Object.keys(data?.data || {})[0];
        const msgHash = data?.data?.[assetKey]?.timestamped_signature?.msg_hash;

        createBotMessage += `✅ Call Stork\n👉 msg_hash for ${assetKey}: ${msgHash}\n\n`;

        await callValidations(axios, msgHash);



    } catch (error) {
        if (jwtValue === '' || (error.response.data.error === "invalid token")) {
            createBotMessage += `❌ Main Stok Error: invalid token\n\n`;
            await waitSeconds(5, 7);
            await callUpadetJWT(axios)

        } else {
            const errorM = error.response ? error.response.data : "From Call Stork..";
            const encodedE = he.encode(JSON.stringify(errorM, null, 2));
            const message = `<pre><code>${encodedE}</code></pre>`
            createBotMessage += "❌ Main Stok Error:\n" + message + "\n\n";
        }

    }


}

async function callValidations(axios, msgHash) {

    try {

        const response = await axios(validationOptions(msgHash, jwtValue));
        createBotMessage += `✅ Validation Message: ${response.data.message}\n\n`;

    } catch (error) {
        createBotMessage += `❌ Valid Error: ${error.response.data}\n\n`;
    }

}

//========== Token Update ========
async function callUpadetJWT(axios) {

    try {

        const response = await axios(jwtOptions);
        const jwtRes = response.data.access_token
        jwtValue = 'Bearer ' + jwtRes;
        createBotMessage += `✅ Update JWT: ${jwtValue}\n\n`;

    } catch (error) {
        let text = '';
        if (error?.message) {
            text = error.message;
        } else if (error?.response?.status && error?.response?.data?.error) {
            text = error.response.status;
            text = error.response.data.error;
        } else {
            text = "From Call UpdateJWT...";
        }
        createBotMessage += `❌ JWT Error: ${text}\n\n`;

    }

}

// ====== Show Live Points =========
async function callMeProfile(bot, axios) {

    try {

        const response = await axios(meOptions(jwtValue));
        const validCount = response.data.data.stats.stork_signed_prices_valid_count;
        createBotMessage += `💕 MY Points: ${validCount}\n\n`;

    } catch (error) {
        let text = '';
        if (error?.message) {
            text = error.message;
        } else if (error?.response?.status && error?.response?.data?.error) {
            text = error.response.status;
            text = error.response.data.error;
        } else {
            text = "From Call Call Me Profile...";
        }

        createBotMessage += `❌ Me Error: ${text}\n\n`;

    }

    const currentDate = new Date();
    const bdTime = currentDate.toLocaleString("en-US", { timeZone: "Asia/Dhaka" });

    createBotMessage += `Last Update Time: ${bdTime}`;
    await smartSendMessage(bot, createBotMessage);
}

async function smartSendMessage(bot, message) {
    try {

        if (messageID) {
            await bot.editMessageText(message, {
                chat_id: devID[0],
                message_id: messageID,
                parse_mode: "HTML"
            });
            //console.log(`🔁 Message updated`);
            return;
        }
        throw new Error("No messageID");
    } catch (editError) {
        //console.log(`⚠️ Edit failed or not available: ${editError.message}`);

        try {
            const sent = await bot.sendMessage(devID[0], message, { parse_mode: "HTML" });

            messageID = sent.message_id;
            //console.log(`✅ New message ID: ${messageID}`);
        } catch (sendError) {
            //console.error(`❌ Failed to send message: ${sendError.message}`);
        }
    }
}

module.exports = {

    callStorkLoop,

}
