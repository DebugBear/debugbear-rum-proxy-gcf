const axios = require("axios")
const ip3country = require("ip3country");
const { RUM_SNIPPET_ID, RUM_TOKEN } = require("./envVars");



const snippetUrl = `https://cdn.debugbear.com/${RUM_SNIPPET_ID}.js`
ip3country.init();

module.exports = {
  debugbearrumproxy: async function (req, res) {
    res.set("Access-Control-Allow-Origin", "*");
    if (req.method === "GET") {
      await serveRumSnippet(req, res)
    } else if (req.method === "POST") {
      await processRumData(req, res)
    } else {
      res.json({ error: "Unsupported method" })
    }
  }
}

async function serveRumSnippet(req, res) {
  const snippetJs = await cachedIdempotentFetchRumSnippet()
  res.set('Content-Type', 'application/javascript');
  res.end(snippetJs)
}

const MS_PER_MINUTE = 60 * 1000;
const SNIPPET_CACHE_TIME = 5 * MS_PER_MINUTE;
let cachedSnippet = "";
let cacheExpiresAt = 0;
async function cachedIdempotentFetchRumSnippet() {
  if (!cachedSnippet || cacheExpiresAt < Date.now()) {
    cachedSnippet = await idempotentFetchRumSnippet();
    cacheExpiresAt = Date.now() + SNIPPET_CACHE_TIME;
  }
  return cachedSnippet
}

let fetchPromise = null;
function idempotentFetchRumSnippet() {
  if (!fetchPromise) {
    fetchPromise = fetchRumSnippet()
    // Fallback to continue serving snippet if something goes wrong
    const resetFetchPromiseTimeout = setTimeout(() => {
      fetchPromise = null;
    }, 30000);
    fetchPromise.then(() => {
      fetchPromise = null;
      clearTimeout(resetFetchPromiseTimeout)
    });
  }
  return fetchPromise
}

async function fetchRumSnippet() {
  const resp = await axios.get(
    snippetUrl,
  );
  const { data } = resp
  return data
}

async function processRumData(req, res) {
  let country = getCountryFromRequest(req);
  const resp = await axios.post(
    "https://data.debugbear.com",
    typeof req.body === "string" ? JSON.parse(req.body) : req.body,
    {
      headers: {
        "x-rum-token": RUM_TOKEN,
        "x-rum-country": country
      }
    }
  );
  if (resp.status !== 200) {
    console.warn("Failed to send RUM data", resp.status, resp.data)
  }
  res.json({})
}

function getCountryFromRequest(req) {
  let country = req.headers["x-rum-country"];
  if (!country) {
    const requestIp = (req.headers["x-forwarded-for"] || "").split(",")[0];
    country = ip3country.lookupStr(requestIp);
  }
  return country;
}

