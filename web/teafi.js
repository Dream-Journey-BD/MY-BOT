
const checkInOptions = (address) => ({
    method: 'POST',
    url: 'https://api.tea-fi.com/wallet/check-in',
    params: { address: address },
    headers: {
        accept: 'application/json, text/plain, */*',
        origin: 'https://app.tea-fi.com',
        referer: 'https://app.tea-fi.com/',
        'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/134.0.0.0 Safari/537.36'
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
        'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/134.0.0.0 Safari/537.36'
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
        'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/134.0.0.0 Safari/537.36'
    }
});


const getCodeOptions = (address) => ({
    method: 'GET',
    url: `https://api.tea-fi.com/referrals/${address}/code`,
    headers: {
        accept: 'application/json, text/plain, */*',
        origin: 'https://app.tea-fi.com',
        referer: 'https://app.tea-fi.com/',
        'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/134.0.0.0 Safari/537.36'
    }
});



// CheckIn Code
async function getTeaFi(axios, options, address) {

    try {
        const response = await axios(options);
        console.log('Check-In Successful Points Add ', response.data.points);
    } catch (error) {
        console.error(`Error: \nadd: ${address}\nmessage: ${error.response.data.message}`);
    }
}


module.exports = {

    checkInOptions,
    setCodeOptions,
    pointsOptions,
    getCodeOptions,

    getTeaFi,

}


