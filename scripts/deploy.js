var http = require('http');
var url = require('url');
var FtpDeploy = require('ftp-deploy');
var ftpDeploy = new FtpDeploy();

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
    hostname: "stats.zomis.net",
    path: "/GithubHookSEChatService/bot/jsonPost",
    method: "POST",
    headers: {
        "Content-Type": "application/json"
    }
}

function postToChat(config, botRequest) {
    var json = JSON.stringify(botRequest, ["url", "apiKey", "roomId", "text"]);
    config.headers["Content-Length"] = json.length;

    console.log("Posting message to " + url.format(config) + "...");
    var req = http.request(config);

    req.on("connect", function(response, socket, head) {
        console.log("Chat bot response status: " + response.statusMessage);

        socket.on("data", function(chunk) {
            console.log("Chat bot: " + chunk.toString());
        });

        socket.on("error", function(err) {
            console.log("Socket error: " + err);
        });

        socket.on("close", function(had_error) {
            if (!had_error) {
                console.log("Post successful");
            }
        });
    });

    req.end(json);
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

