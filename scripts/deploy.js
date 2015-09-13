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
var request = require('request');
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

    console.log("Posting message to " + config.url + "...");

    var req = request(config, function(error, response, body) {
        if (error) {
            throw error;
        }
        console.log("Response: " + response.statusMessage);
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
    new FtpDeploy().deploy(config, function(err) {
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
            console.log("FTP deployment successful.");
            if (chatBotRequest.apiKey) {
                postToChat(chatBotConfig, chatBotRequest);
            }
    });
});

