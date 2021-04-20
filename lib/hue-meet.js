'use strict';

const axios = require('axios');

const meethue = 'https://discovery.meethue.com/';

module.exports = async () => {
    try {
        let response = await axios.get(meethue);
        if (response && response.data && Array.isArray(response.data)) {
            return response.data;
        }
    } catch (err) {
        return [];
    }

    return [];
};

module.exports();
