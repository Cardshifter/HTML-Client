<template>
    <css-grid
        :columns="['auto', 'auto', 'auto', 'auto', 'auto', 'auto', 'auto']"
        :auto-rows="'auto'">

        <!-- Headers -->
        <css-grid-item
            class="server-status-header"
            v-for="(headerName, index) in headerNames"
            :key="index">
            {{headerName}}
        </css-grid-item>

        <css-grid-item
            class="server-status-cell"
            v-for="(content, i) in getGridCellsContent(serverOptions)"
            :key="i">
            <span v-if="content.constructor !== Array">{{content}}</span>
            <ul v-else>
                <li v-for="(value, j) in content" :key="j">
                    {{value}}
                </li>
            </ul>
        </css-grid-item>

    </css-grid>
</template>

<script>
const headerNames = [
    "Server",
    "Online",
    "Users",
    "Mods",
    "Games",
    "AIs",
    "Latency"
];

export default {
    name: "ServerStatusGrid",
    props: ["serverOptions"],
    data() {
        return {
            headerNames: headerNames
        }
    },
    methods: {
        getGridCellsContent: function(serverOptions) {
            console.log(serverOptions);
            const allServerValues = [];
            const allServerAddresses = [];
            const serverValueIndexes = {
                name: 0,
                isOnline: 1,
                userCount: 2,
                availableMods: 3,
                gamesRunning: 4,
                ais: 5,
                latency: 6,
            };
            // Skipping last index because it is for "Other..." server
            for (let server = 0; server < serverOptions.length - 1; server++) {
                console.log(server);
                const thisServerValues = [];
                if (server.name !== "Other...") {
                    allServerAddresses.push(serverOptions[server].address);
                    thisServerValues.push(serverOptions[server].name);
                    thisServerValues.push(serverOptions[server].isOnline || false);
                    thisServerValues.push(serverOptions[server].userCount || 0);
                    thisServerValues.push(serverOptions[server].availableMods || []);
                    thisServerValues.push(serverOptions[server].gamesRunning || 0);
                    thisServerValues.push(serverOptions[server].ais || 0);
                    thisServerValues.push(serverOptions[server].latency || null);
                    console.log("thisServerValues");
                    console.log(thisServerValues);
                }
                for (let index = 0; index < thisServerValues.length; index++) {
                    switch(index) {
                        case serverValueIndexes.name:
                            allServerValues.push(thisServerValues[index]);
                            break;
                        case serverValueIndexes.isOnline:
                            allServerValues.push(thisServerValues[index] ? "true" : "false");
                            break;
                        case serverValueIndexes.userCount:
                            let realUserCount = thisServerValues[index];
                            if (realUserCount !== 0) {
                                realUserCount--;
                            }
                            allServerValues.push(realUserCount < 0 || realUserCount
                                ? '-'
                                : `${realUserCount} ${realUserCount === 1 ? 'user' : 'users'}`
                            );
                            break;
                        case serverValueIndexes.availableMods:
                            allServerValues.push(
                                !thisServerValues[index] || thisServerValues[index].length === 0
                                    ? "-"
                                    : thisServerValues[index]
                            );
                            break;
                        case serverValueIndexes.gamesRunning:
                            const gamesRunning = thisServerValues[index];
                            allServerValues.push(!gamesRunning
                                ? '-'
                                : `${gamesRunning} ${gamesRunning === 1 ? 'game' : 'games'}`
                            );
                            break;
                        case serverValueIndexes.ais:
                            const serverAis = thisServerValues[index];
                            allServerValues.push(
                                !serverAis
                                    ? '-'
                                    : `${serverAis} ${serverAis === 1 ? 'AI' : 'AIs'}`
                            );
                            break;
                        case serverValueIndexes.latency:
                            allServerValues.push(
                                !thisServerValues[index] ? '-' : `${thisServerValues[index]} ms`
                            );
                            break;
                        default:
                            allServerValues.push(null);
                            break;
                    }
                }
            }
            console.log("allServerValues");
            console.log(allServerValues);
            return allServerValues;
            // return {
            //     allServerValues: allServerValues,
            //     allServerAddresses: allServerAddresses
            // };
        }
    }
}
</script>

<style>
.server-status-header {
    background-color: #eee;
    color: #000;
    padding: 5px;
    border: 1px solid #000;
    border-collapse: collapse;
    font-weight: bold;
    font-size: 1.2em;
}
.server-status-cell {
    background-color: #FFF;
    color: #000;
    padding: 5px;
    border: 1px solid #000;
    border-collapse: collapse;
    font-size: 1.0em;
}
</style>
