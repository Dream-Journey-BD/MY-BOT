
require("dotenv").config();
const he = require('he');
const { devID } = require("../tg/developer-utils")

const callOptions = {
    method: 'GET',
    url: 'https://app-api.jp.stork-oracle.network/v1/stork_signed_prices',
    headers: {
        accept: '*/*',
        'accept-language': 'en-US,en;q=0.9,bn-BD;q=0.8,bn;q=0.7',
        authorization: process.env.StorkOracle,
        origin: 'chrome-extension://knnliglhgkmlblppdejchidfihjnockl',
        priority: 'u=1, i',
        'sec-fetch-dest': 'empty',
        'sec-fetch-mode': 'cors',
        'sec-fetch-site': 'cross-site',
        'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/134.0.0.0 Safari/537.36'
    }
};

const validationOptions = (msg_hash) => ({
    method: 'POST',
    url: 'https://app-api.jp.stork-oracle.network/v1/stork_signed_prices/validations',
    headers: {
        accept: '*/*',
        'accept-language': 'en-US,en;q=0.9,bn-BD;q=0.8,bn;q=0.7',
        authorization: process.env.StorkOracle,
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

async function callStork(bot, axios) {
    try {
        const response = await axios(callOptions);
        const data = response.data;

        const assetKey = Object.keys(data?.data || {})[0];
        const msgHash = data?.data?.[assetKey]?.timestamped_signature?.msg_hash;

        console.log(`msg_hash for ${assetKey}:`, msgHash);

        callValidations(bot, axios, msgHash);

    } catch (error) {
        const errorM = error.response ? error.response.data : "Error: From callStork..";
        const encodedE = he.encode(JSON.stringify(errorM, null, 2));
        const message = `<pre><code>${encodedE}</code></pre>`
        bot.sendMessage(devID[0], message, { parse_mode: 'HTML' });
    }
}

async function callValidations(bot, axios, msgHash) {
    try {

        const response = await axios(validationOptions(msgHash));
        console.log("Message: ", response.data.message);
        await waitSeconds(30, 60);
        callStork(bot, axios);

    } catch (error) {
        console.error('Error: ', error.response.data);
        await waitSeconds(30, 60);
        callStork(bot, axios);
    }


}

function waitSeconds(secS, secE) {
    const seconds = Math.floor(Math.random() * (secE - secS + 1)) + secS;
    const ms = seconds * 1000;
    console.log(`Waiting for ${seconds} seconds (${ms} ms)`);
    return new Promise(resolve => setTimeout(resolve, ms));
}

module.exports = {
    callStork,

}