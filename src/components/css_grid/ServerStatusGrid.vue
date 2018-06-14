<template>
    <css-grid
        :columns="['auto', 'auto', 'auto', 'auto', 'auto', 'auto', 'auto']"
        :auto-rows="'auto'">

        <!-- Headers -->
        <css-grid-item
            class="server-status-header"
            v-for="(headerName, index) in headerNames"
            :key="index">
            <div>{{headerName}}</div>
        </css-grid-item>

    </css-grid>
</template>
<script>
export default {
    name: "ServerStatusGrid",
    data() {
        return {
            headerNames: [
                "Server",
                "Online",
                "Users",
                "Mods",
                "Games",
                "AIs",
                "Latency"
            ]
        }
    },
}
</script>
