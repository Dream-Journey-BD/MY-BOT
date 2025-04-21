
function waitSeconds(secS, secE) {
    const seconds = Math.floor(Math.random() * (secE - secS + 1)) + secS;
    const ms = seconds * 1000;
    console.log(`Waiting for ${seconds} seconds (${ms} ms)`);
    return new Promise(resolve => setTimeout(resolve, ms));
}


function waitMinutes(minS, minE) {
    const ms = Math.floor(Math.random() * (minE - minS + 1) + minS) * 60 * 1000;
    console.log(`Waiting for ${ms / (60 * 1000)} minutes`);
    return new Promise(resolve => setTimeout(resolve, ms));
}

module.exports = {

    waitSeconds,
    waitMinutes

}