# HTML-Client
HTML/CSS/JS-based client for Cardshifter

####Primary authors:
- @SirPython: JavaScript, AngularJS
- @Phrancis: HTML, CSS

For more information about the Cardshifter project, see:

- [Official website](http://stats.zomis.net/io-web)

- [Primary repository on GitHub](https://github.com/Cardshifter/Cardshifter)

### Development
Ensure you have [NodeJS](https://nodejs.org/) installed. Then execute the following instructions:

````bash
git clone https://www.github.com/cardshifter/html-client
cd html-client
git checkout develop
npm i
````

Then you can run one of the following scripts to perform actions:
- `npm run build` - builds, and minifies, the Cardshifter client and deposits it in the ./dist folder. The files built by this script are intended to be deployed to a live server.
- `npm run develop` - starts a basic webserver (powered by `webpack-dev-server`) that will host the Cardshifter HTML client. It will also watch your files and recompile them every time they change. See [webpack](webpack.github.io) for more information.
- `npm test` - runs all tests via karma. Tests are created by placing a file with the extension `*.spec.js` inside of the src folder. All tests have access to webpack (and thus `require`).
