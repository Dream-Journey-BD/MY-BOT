const { userAgent } = require("../tg/developer-utils")

let success = 0;
let fail = 0;

const checkInOptions = (address) => ({
    method: 'POST',
    url: 'https://api.tea-fi.com/wallet/check-in',
    params: { address: address },
    headers: {
        accept: 'application/json, text/plain, */*',
        origin: 'https://app.tea-fi.com',
        referer: 'https://app.tea-fi.com/',
        'user-agent': userAgent
    }
});

const setCodeOptions = (address) => ({
    method: 'POST',
    url: 'https://api.tea-fi.com/referrals',
    headers: {
        accept: 'application/json, text/plain, */*',
        'content-type': 'application/json',
        origin: 'https://app.tea-fi.com',
        referer: 'https://app.tea-fi.com/',
        'user-agent': userAgent
    },
    data: { address: address, code: 'hdtom4' }
});

const pointsOptions = (address) => ({
    method: 'GET',
    url: `https://api.tea-fi.com/points/${address}`,
    headers: {
        accept: 'application/json, text/plain, */*',
        origin: 'https://app.tea-fi.com',
        referer: 'https://app.tea-fi.com/',
        'user-agent': userAgent
    }
});


const getCodeOptions = (address) => ({
    method: 'GET',
    url: `https://api.tea-fi.com/referrals/${address}/code`,
    headers: {
        accept: 'application/json, text/plain, */*',
        origin: 'https://app.tea-fi.com',
        referer: 'https://app.tea-fi.com/',
        'user-agent': userAgent
    }
});



// CheckIn Code
async function getTeaFi(axios, options, address) {

    try {
        const response = await axios(options);
        console.log('Check-In Successful Points Add ', response.data.points);
        success++;
    } catch (error) {
        console.error(`Error: \nadd: ${address}\nmessage: ${error.response.data.message}`);
        fail++;
    }
}


function getResult() {
    return `<b>Success:</b> ${success}\n<b>Fail:</b> ${fail}`
}

function emptyResult() {
    success = 0;
    fail = 0
}

module.exports = {

    checkInOptions,
    setCodeOptions,
    pointsOptions,
    getCodeOptions,
    getResult,
    emptyResult,

    getTeaFi,

}


