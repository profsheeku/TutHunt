const withCSS = require("@zeit/next-css");
module.exports = withCSS({
    publicRuntimeConfig: {
        APP_NAME: "TutHunt",
        API: "http://localhost:8000/api",
        PRODUCTION: false,
        DOMAIN: "http://localhost:3000",
        FB_APP_ID: "garbage",
    },
});
