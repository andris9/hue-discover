'use strict';

const hueMeet = require('./lib/hue-meet');
const hueMdns = require('./lib/hue-mdns');
const hueSsdp = require('./lib/hue-ssdp');

const xml2js = require('xml2js');

const axios = require('axios');

const discover = async () => {
    let seen = new Set();
    let devices = (await Promise.all([hueMeet(), hueMdns(), hueSsdp()])).flatMap(entries =>
        entries.filter(entry => {
            if (!entry.id || seen.has(entry.id)) {
                return false;
            }
            seen.add(entry.id);
            return entry.id;
        })
    );

    const response = [];
    for (let device of devices) {
        console.log(`http://${device.internalipaddress}/description.xml`);
        let r = await axios.get(`http://${device.internalipaddress}/description.xml`);
        if (r.status === 200 && r.data) {
            try {
                let parsed = await xml2js.parseStringPromise(r.data);

                if (parsed && parsed.root && parsed.root.device && parsed.root.device[0]) {
                    Object.keys(parsed.root.device[0]).forEach(key => {
                        console.log(key, parsed.root.device[0][key]);
                        if (
                            Array.isArray(parsed.root.device[0][key]) &&
                            parsed.root.device[0][key].length === 1 &&
                            parsed.root.device[0][key][0] &&
                            typeof parsed.root.device[0][key][0] !== 'object'
                        ) {
                            device[key] = parsed.root.device[0][key][0];
                        }
                    });
                }

                response.push(device);
            } catch (err) {
                // ignore
            }
        }
    }

    return response;
};

module.exports = discover;
