<template>
    <nav class="navbar navbar-dark top-navbar">
        <div class="container-fluid">
            <div class="navbar-header">
                <div class="csh-top-link">
                    <span>Cardshifter</span>
                    <span class="top-navbar-username" v-if="username"> | {{ username }}</span>
                </div>
            </div>
        </div>
    </nav>
</template>

<script>
export default {
    name: "TopNavbar",
    data() {
        return {}
    },
    props: ['username'],
    methods: {}
};
</script>

<style>
@import "../assets/style.css";

.top-navbar {
    background-color: #222222;
    font-size: 0.8em;
    color: #EEEEEE;
}

.top-navbar-username {
    font-size: 1.0em;
}
</style>
