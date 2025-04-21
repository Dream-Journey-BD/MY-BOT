
require("dotenv").config();
const he = require('he');
const { devID, userAgent } = require("../tg/developer-utils")
const { waitSeconds, waitMinutes } = require("./common")

let jwtValue = '';

var jwtOptions = {
    method: 'POST',
    url: 'https://app-auth.jp.stork-oracle.network/token',
    params: { grant_type: 'password' },
    headers: {
        accept: '*/*',
        'accept-language': 'en-GB,en-US;q=0.9,en;q=0.8,bn;q=0.7',
        'content-type': 'application/json',
        origin: 'https://app.stork.network',
        priority: 'u=1, i',
        referer: 'https://app.stork.network/',
        'user-agent': userAgent
    },
    data: { email: 'imrannazirjihad@gmail.com', password: 'In3302060@' }
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

async function callStork(bot, axios) {
    try {

        const response = await axios(callOptions(jwtValue));
        const data = response.data;

        const assetKey = Object.keys(data?.data || {})[0];
        const msgHash = data?.data?.[assetKey]?.timestamped_signature?.msg_hash;

        console.log(`msg_hash for ${assetKey}:`, msgHash);

        callValidations(bot, axios, msgHash);

    } catch (error) {
        if (jwtValue === '' || (error.response.data.error === "invalid token")) {
            console.log('invalid token')
            await waitSeconds(5, 10);
            callUpadetJWT(bot, axios)

        } else {
            const errorM = error.response ? error.response.data : "From callStork..";
            const encodedE = he.encode(JSON.stringify(errorM, null, 2));
            const message = `<pre><code>${encodedE}</code></pre>`
            bot.sendMessage(devID[0], message, { parse_mode: 'HTML' });
            console.log("Stok Error:", message);
        }

    }
}

async function callValidations(bot, axios, msgHash) {
    try {

        const response = await axios(validationOptions(msgHash, jwtValue));
        console.log("Message: ", response.data.message);
        await waitSeconds(30, 60);
        callStork(bot, axios);

    } catch (error) {
        console.error('Valid Error: ', error.response.data);
        await waitSeconds(30, 60);
        callStork(bot, axios);
    }


}

async function callUpadetJWT(bot, axios) {
    try {

        const response = await axios(jwtOptions);
        const jwtRes = response.data.access_token
        jwtValue = 'Bearer ' + jwtRes;
        console.log('Update JWT: ', jwtValue);

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
        console.log("JWT Error:", text);
        await waitMinutes(5, 15);
        callStork(bot, axios);
    }


}

module.exports = {
    callStork,

}