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
            v-for="(content, index) in getGridCellsContent(serverOptions)"
            :key="index">
            {{content}}
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
            const serverValueIndexes = {
                name: 0,
                isOnline: 1,
                userCount: 2,
                availableMods: 3,
                gamesRunning: 4,
                ais: 5,
                latency: 6
            };
            // Skip last value in array because it is for "Other"
            for (let server = 0; server < serverOptions.length - 1; server++) {
                console.log(server);
                const thisServerValues = [
                    serverOptions[server].name,
                    serverOptions[server].isOnline || false,
                    serverOptions[server].userCount || 0,
                    serverOptions[server].availableMods || [],
                    serverOptions[server].gamesRunning || 0,
                    serverOptions[server].ais || 0,
                    serverOptions[server].latency || null
                ];
                console.log("thisServerValues");
                console.log(thisServerValues);
                for (let index = 0; index < thisServerValues.length; index++) {
                    switch(index) {
                        case serverValueIndexes.name:
                            allServerValues.push(server[index]);
                            break;
                        case serverValueIndexes.isOnline:
                            allServerValues.push(server[index] ? "true" : "false");
                        case serverValueIndexes.userCount:
                            let realUserCount = parseInt(server.userCount);
                            realUserCount--;
                            allServerValues.push(server[index]
                                ? '-'
                                : `${realUserCount} ${realUserCount === 1 ? 'user' : 'users'}`
                            );
                            break;
                        case serverValueIndexes.availableMods:
                            allServerValues.push(
                                `<ul class="server-mod-list">` +
                                    `<li>` +
                                        `<router-link :to="/cards?server=${server.address}&mod=${serverValueIndexes.availableMods}">` +
                                            `{{ key }}` +
                                        `</router-link>` +
                                    `</li>` +
                                `</ul>`
                            );
                            break;
                        case serverValueIndexes.gamesRunning:
                            const gamesRunning = server.gamesRunning;
                            allServerValues.push(!gamesRunning
                                ? '-'
                                : `${gamesRunning} ${gamesRunning === 1 ? 'game' : 'games'}`
                            );
                            break;
                        case serverValueIndexes.ais:
                            const serverAis = server.ais;
                            allServerValues.push(
                                !serverAis
                                    ? '-'
                                    : `${serverAis} ${serverAis === 1 ? 'AI' : 'AIs'}`
                            );
                            break;
                        case serverValueIndexes.latency:
                            allServerValues.push(
                                !server.latency ? '-' : `${server.latency} ms`
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
</style>
