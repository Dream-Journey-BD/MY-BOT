const fs = require("fs");
const path = require("path");
const axios = require('axios');

const { checkInOptions, setCodeOptions, pointsOptions, getCodeOptions, getTeaFi } = require("./teafi")


// Function to simulate a delay
function waitMinutes(minS, minE) {
    const ms = Math.floor(Math.random() * (minE - minS + 1) + minS) * 60 * 1000;
    console.log(`Waiting for ${ms / (60 * 1000)} minutes`);
    return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Reads and parses any JSON file.
 * @param {string} filePath - Path to the JSON file.
 * @returns {Promise<Object>} - Parsed JSON data.
 */
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

/**
 * Extracts wallet data by label from a given JSON file.
 * @param {Array} jsonArray - Array of wallet objects to process.
 * @returns {Promise<void>} - Void, as we are performing side effects (API calls).
 */
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

        const currentDate = new Date();
        console.log(`TeaFi Execution complete\nToday's Date: `, currentDate);

    } catch (error) {
        console.error(error);
        return null;
    }
}

function callTeaFi() {
    readJsonFile("wallet.json")
        .then((data) => {
            extractWallet(data);
        })
        .catch((err) => {
            console.error(err);
        });
}


//=======Start After 24 Hours========
setInterval(callTeaFi, 86400000);