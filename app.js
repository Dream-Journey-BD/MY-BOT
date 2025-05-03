const fs = require("fs");
const path = require("path");
const axios = require('axios');

const { checkInOptions, getTeaFi, getResult, emptyResult } = require("./web/teafi");
const { waitMinutes } = require("./web/common")
const { devID } = require("./tg/developer-utils")
const { callStorkLoop } = require("./web/stork-oracle");
const { bot } = require("./tg/tg-bot");


function readJsonFile(filePath) {
    return new Promise((resolve, reject) => {
        const absolutePath = path.resolve(filePath); // Convert to absolute path

        fs.readFile(absolutePath, "utf8", (err, data) => {
            if (err) {
                reject(`Error reading file: ${err}`);
                return;
            }

            try {
                const jsonData = JSON.parse(data);
                resolve(jsonData);
            } catch (parseErr) {
                reject(`Error parsing JSON: ${parseErr}`);
            }
        });
    });
}


async function extractWallet(jsonArray) {

    // wait 1 - 8 Minutes Than Go Next...
    await waitMinutes(1, 8);

    try {

        for (let i = 0; i < jsonArray.length; i++) {
            const jsonObj = jsonArray[i];
            const name = jsonObj.name;
            const address = jsonObj.address;

            await getTeaFi(axios, checkInOptions(address), address);
        }

        const message = `<b>TeaFi Execution Result:</b>\n\n${getResult()}`
        bot.sendMessage(devID[0], message, { parse_mode: 'HTML' });

        const currentDate = new Date();
        console.log(`TeaFi Execution complete\nToday's Date: `, currentDate);
        emptyResult();

    } catch (error) {
        console.error(error);
        return null;
    }
}

function callTeaFi() {
    readJsonFile("evm-wallet.json")
        .then((data) => {
            extractWallet(data);
        })
        .catch((err) => {
            console.error(err);
        });
}

callStorkLoop(bot, axios);
//=======Start After 24 Hours========
setInterval(callTeaFi, 86400000);