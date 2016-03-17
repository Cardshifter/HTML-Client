/* Deploy the client to play.cardshifter.com
 *
 * How to use:
 *  1. Build the project and make sure that everything is in order.
 *  2. Set up environment variables (see below).
 *  3. Run `npm run deploy`.
 *  4. Profit!
 *
 * Environment variables used:
 *  - DEPLOY_FTP_USERNAME: Username used to log in through FTP.
 *  - DEPLOY_FTP_PASSWORD: Password used to log in through FTP.
 *  - DEPLOY_DUGA_KEY: Duga API key. If not set the chat bot post is skipped.
 */
'use strict';

var copy      = require('recursive-copy');
var FtpDeploy = require('ftp-deploy');
var path      = require('path');
var Promise   = require('bluebird');
var request   = require('request-promise');
var temp      = require('temp').track();

var deployAddress = "play.cardshifter.com";

function ftpConfig(local, remote) {
    return {
        username: process.env.DEPLOY_FTP_USERNAME,
        password: process.env.DEPLOY_FTP_PASSWORD,
        host: deployAddress,
        port: 21, // Standard FTP port
        localRoot: local,
        remoteRoot: remote
    };
};

var chatBotRequest = {
    // http://chat.stackexchange.com/rooms/info/16134/cardshifter-tcg
    roomId: 16134,
    apiKey: process.env.DEPLOY_DUGA_KEY,
    text: "New web client version uploaded to [" + deployAddress + "](http://" + deployAddress +"/)."
};

var chatBotConfig = {
    url: "http://stats.zomis.net/GithubHookSEChatService/bot/jsonPost",
    method: "POST",
    headers: {
        "Content-Type": "application/json"
    }
}

function postToChat(config, botRequest) {
    return new Promise(function(resolve, reject) {
        var json = JSON.stringify(botRequest, ["apiKey", "roomId", "text"]);
        config.headers["Content-Length"] = json.length;
        config.body = json;

        request(config)
        .then(function(body) {
            resolve(body);
        })
    });
}

function setupFiles() {
    // ftp-deploy doesn't handle uploading from multiple directories well
    return new Promise(function(resolve, reject) {
        temp.mkdir("cardshifter-deploy", function (err, tempDir) {
            if (err) {
                reject(err);
            }

            Promise.all([
                copy(path.join(__dirname, "..", "www"), tempDir),
                copy(path.join(__dirname, "..", "dist"), path.join(tempDir, "assets"))
            ])
            .then(function() {
                resolve(tempDir);
            })
            .catch(function(err) {
                reject(err);
            });
        });
    });
}

function deployFtp(config) {
    return new Promise(function(resolve, reject) {
        var ftp = new FtpDeploy();

        ftp.on("uploading", function(data) {
            console.log(
                data.percentComplete + "% " +
                "(" + data.transferredFileCount +
                "/" + data.totalFileCount +
                ") " + data.filename
            );
        });

        ftp.deploy(config, function(err) {
            if (err) {
                reject(err);
            } else {
                resolve();
            }
        });
    });
}

setupFiles()
.then(function(dir) {
    var config = ftpConfig(dir, "/");
    console.log("Deploying to ftp://" + config.host + ":" + config.port + "...");
    return deployFtp(config);
})
.then(function() {
    console.log("FTP deployment successful.");
    if (chatBotRequest.apiKey) {
        console.log("Posting message to " + chatBotConfig.url + "...");
        return postToChat(chatBotConfig, chatBotRequest);
    }
})
.then(function(responseBody) {
    if (responseBody) {
        console.log(responseBody);
    }
})
.catch(function(err) {
    console.error(err.toString());
    console.error(err.stack);
});
