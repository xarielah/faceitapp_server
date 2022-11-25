const axios = require('axios');
const resps = require('../responses/template');

async function faceitRequest(method, url) {
    const FACEIT_APIKEY = process.env.FACEIT_APIKEY;
    const data = axios({
        method: method,
        url: `https://open.faceit.com/data/v4${url}`,
        headers: { Authorization: `Bearer ${FACEIT_APIKEY}` },
    })
        .then((res) => ({ ok: true, data: res.data }))
        .catch((e) => ({ ok: false, tree: e }));

    return data;
}

module.exports = faceitRequest;
