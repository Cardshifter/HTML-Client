var FtpDeploy = require('ftp-deploy');
var ftpDeploy = new FtpDeploy();
var request = require('request');

var ftpConfig = {
    username: process.env.DEPLOY_FTP_USERNAME,
    password: process.env.DEPLOY_FTP_PASSWORD,
    host: "localhost",
    port: 2121,
    localRoot: __dirname + "/../dist",
    remoteRoot: "/"
};

var chatBotRequest = {
    apiKey: process.env.DEPLOY_DUGA_KEY,
    roomId: 16134,
    text: "New web client version uploaded."
};

var chatBotConfig = {
    //hostname: "stats.zomis.net",
    //path: "/GithubHookSEChatService/bot/jsonPost",
    url: "http://localhost:8000/",
    method: "POST",
    headers: {
        "Content-Type": "application/json"
    }
}

function postToChat(config, botRequest) {
    var json = JSON.stringify(botRequest, ["apiKey", "roomId", "text"]);
    config.headers["Content-Length"] = json.length;
    config.body = json;

    console.log("Posting message to " + config.url + "...");

    var req = request(config, function(error, response, body) {
        console.log("Response status: " + response.statusMessage);
        if (error) {
            console.log("Request error: " + error);
        }
        if (body) {
            console.log("Response body:\n" + body);
        }
    });
}

console.log("Deploying to ftp://" + ftpConfig.host + ":" + ftpConfig.port + "...");

ftpDeploy.deploy(ftpConfig, function(err) {
    if (err) {
        console.log(err);
        process.exit(1);
    } else {
        console.log("Deployment successful.");
        postToChat(chatBotConfig, chatBotRequest);
    }
});

