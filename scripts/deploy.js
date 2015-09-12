function getCredentials() {
    return {
        username: process.env.DEPLOY_FTP_USERNAME,
        password: process.env.DEPLOY_FTP_PASSWORD
    }
}

console.log(getCredentials())
