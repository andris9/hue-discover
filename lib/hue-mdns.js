'use strict';

const mdns = require('mdns');
const net = require('net');

const devices = new Map();
const SCAN_MAX_TIME = 1000;

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

// watch all http servers
const browser = mdns.createBrowser(mdns.tcp('hue'));
browser.on('serviceUp', service => {
    devices.set(service.name, service);

    finishPending();
});

browser.on('serviceDown', service => {
    devices.delete(service.name);
});
browser.start();

// discover all available service types
const all_the_types = mdns.browseThemAll();

module.exports = async () => {
    await checkPending();
    return Array.from(devices.values()).map(entry => ({
        id: entry.txtRecord.bridgeid,
        internalipaddress: entry.addresses.filter(addr => net.isIPv4(addr)).pop()
    }));
};
