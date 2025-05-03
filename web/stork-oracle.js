//======= Lib impl ===========
const he = require('he');
const { devID, userAgent } = require("../tg/developer-utils")
const { waitSeconds, waitMinutes } = require("./common")

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
    data: { refresh_token: 'QQ78ILXwtbNWLE7NV5uo5w' }
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
        'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/134.0.0.0 Safari/537.36'
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
async function callStork(bot, axios) {

    createBotMessage = '';

    try {

        const response = await axios(callOptions(jwtValue));
        const data = response.data;

        const assetKey = Object.keys(data?.data || {})[0];
        const msgHash = data?.data?.[assetKey]?.timestamped_signature?.msg_hash;

        createBotMessage += `✅ Call Stork\n👉 msg_hash for ${assetKey}: ${msgHash}\n\n`;

        callValidations(bot, axios, msgHash);



    } catch (error) {
        if (jwtValue === '' || (error.response.data.error === "invalid token")) {
            createBotMessage += `❌ Stok Error: invalid token\n\n`;
            await waitSeconds(5, 10);
            callUpadetJWT(bot, axios)

        } else {
            const errorM = error.response ? error.response.data : "From callStork..";
            const encodedE = he.encode(JSON.stringify(errorM, null, 2));
            const message = `<pre><code>${encodedE}</code></pre>`
            createBotMessage += "❌ Stok Error:\n" + message + "\n\n";
        }

    }

    callMeProfile(bot, axios);

}

async function callValidations(bot, axios, msgHash) {
    try {

        const response = await axios(validationOptions(msgHash, jwtValue));
        createBotMessage += `✅ Validation Message: ${response.data.message}\n\n`;
        await waitSeconds(30, 60);
        callStork(bot, axios);

    } catch (error) {
        createBotMessage += `❌ Valid Error: ${error.response.data}\n\n`;
        await waitSeconds(30, 60);
        callStork(bot, axios);
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
    console.log(createBotMessage)

}

//========== Token Update ========
async function callUpadetJWT(bot, axios) {
    try {

        const response = await axios(jwtOptions);
        const jwtRes = response.data.access_token
        jwtValue = 'Bearer ' + jwtRes;
        createBotMessage += `✅ Update JWT: ${jwtValue}\n\n`;

        await waitSeconds(7, 15);
        callStork(bot, axios);

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
        await waitMinutes(5, 15);
        callStork(bot, axios);
    }


}

module.exports = {

    callStork,

}
