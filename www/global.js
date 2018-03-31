/*
 * This file is for global values to be used throughout the site.
 */
"use strict";

const global = {
    gameServerWebSocketConnection : null
};

/*
 * Setting to `true` will log messages in the browser console
 * to help in debugging and keeping track of what is happening on the page.
 * This should be set to `false` on the public client.
 */
const DEBUG = true;

/*
 * Port number used for WebSocket.
 */
const WS_PORT = 4243;

/*
 * List of game server names and WebSocket URIs.
 */
const GAME_SERVERS = {
    "localhost" : `ws://127.0.0.1:${WS_PORT}`,
    "dwarftowers.com" : `ws://dwarftowers.com:${WS_PORT}`,
    "zomis.net" : `ws://stats.zomis.net:${WS_PORT}`,
    "Other" : ""
};

/**
 * Default date format for the application.
 * @type String
 */
const DEFAULT_DATE_FORMAT = "yyyy/MM/dd hh:mm:ss";

let GAME_SERVER_WS_CONNECTION = null;