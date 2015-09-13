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

var copy = require('recursive-copy');
var FtpDeploy = require('ftp-deploy');
var path = require('path');
var request = require('request-promise');
var temp = require('temp').track();

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
    text: "New web client version uploaded to http://play.cardshifter.com/."
};

var chatBotConfig = {
    url: "http://stats.zomis.net/GithubHookSEChatService/bot/jsonPost",
    method: "POST",
    headers: {
        "Content-Type": "application/json"
    }
}

function postToChat(config, botRequest) {
    var json = JSON.stringify(botRequest, ["apiKey", "roomId", "text"]);
    config.headers["Content-Length"] = json.length;
    config.body = json;

    return new Promise(function(resolve, reject) {
        console.log("Posting message to " + config.url + "...");

        request(config)
        .then(function(body) {
            if (body) {
                console.log("Body:\n" + body);
            }
            resolve();
        })
    });
}

function setupFiles() {
    // ftp-deploy doesn't handle uploading from multiple directories well
    var promise = new Promise(function(resolve, reject) {
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

    return promise;
}

function deployFtp(config) {
    return new Promise(function(resolve, reject) {
        new FtpDeploy().deploy(config, function(err) {
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
        return postToChat(chatBotConfig, chatBotRequest);
    }
})
.catch(function(err) {
    console.error("Error: " + err);
});


