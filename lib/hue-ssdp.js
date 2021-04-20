const ssdp = require('node-ssdp').Client;
const client = new ssdp({});
const net = require('net');

const devices = new Map();

const MAX_PEMNDING_TTL = 1000;
let pending = true;
let pendingQueue = [];
let pendingTimeout;

const checkPending = () => {
    if (!pending) {
        return true;
    }

    let prom = new Promise(resolve => {
        pendingQueue.push(resolve);
    });

    return prom;
};

const finishPending = () => {
    clearTimeout(pendingTimeout);
    if (pending) {
        pending = false;
        while (pendingQueue.length) {
            let resolve = pendingQueue.shift();
            resolve();
        }
    }
};

pendingTimeout = setTimeout(() => {
    finishPending();
}, MAX_PEMNDING_TTL);

client.on('response', function inResponse(headers, code, rinfo) {
    let bridgeId = ((headers && headers['HUE-BRIDGEID']) || '').toString().toLowerCase();
    if (code !== 200 || !bridgeId || !rinfo || !rinfo.address || !net.isIPv4(rinfo.address)) {
        return false;
    }

    devices.set(bridgeId, { id: bridgeId, internalipaddress: rinfo.address });

    finishPending();
});

client.search('urn:schemas-upnp-org:device:basic:1');

module.exports = async () => {
    await checkPending();
    return Array.from(devices.values());
};
