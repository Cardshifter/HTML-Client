var copy = require('recursive-copy');
var FtpDeploy = require('ftp-deploy');
var ftpDeploy = new FtpDeploy();
var path = require('path');
var temp = require('temp').track();
var request = require('request');

function ftpConfig(local, remote) {
    return {
        username: process.env.DEPLOY_FTP_USERNAME,
        password: process.env.DEPLOY_FTP_PASSWORD,
        host: "localhost",
        port: 2121,
        localRoot: local,
        remoteRoot: remote
    };
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
            throw error;
        }
        if (body) {
            console.log("Response body:\n" + body);
        }
    });
}

function setupFiles(callback) {
    // ftp-deploy doesn't handle uploading from multiple directories well
    temp.mkdir("cardshifter-deploy", function (err, tempDir) {
        if (err) {
            throw err;
        }
        copy(path.join(__dirname, "..", "www"), tempDir, function(err, res) {
            if (err) {
                throw err;
            }
            copy(path.join(__dirname, "..", "dist"), path.join(tempDir, "assets"), function(err, res) {
                if (err) {
                    throw err;
                }
                if (callback) {
                    callback(tempDir);
                }
            });
            
        });
    });
}

function deployFtp(config, callback) {
    ftpDeploy.deploy(config, function(err) {
        if (err) {
            throw err;
        } else {
            if (callback) {
                callback();
            }
        }
    });
}

setupFiles(function(dir) {
    var config = ftpConfig(dir, "/");
    console.log("Deploying to ftp://" + config.host + ":" + config.port + "...");
    deployFtp(config, function() {
            console.log("FTP deployment successful");
            postToChat(chatBotConfig, chatBotRequest);
    });
});

