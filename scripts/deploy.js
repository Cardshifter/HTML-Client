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

console.log("Deploying to ftp://" + ftpConfig.host + ":" + ftpConfig.port + "...");

ftpDeploy.deploy(ftpConfig, function(err) {
    if (err) {
        console.log(err);
        process.exit(1);
    } else {
        console.log("Deployment successful.");
        process.exit(0);
    }
});

