const RUM_TOKEN = process.env.RUM_TOKEN;
const RUM_SNIPPET_ID = process.env.RUM_SNIPPET_ID;

if (!RUM_TOKEN) {
  throw Error("RUM_TOKEN environment variable is required");
}
if (!RUM_SNIPPET_ID) {
  throw Error("RUM_SNIPPET_ID environment variable is required");
}

module.exports = {
  RUM_TOKEN,
  RUM_SNIPPET_ID,
};
