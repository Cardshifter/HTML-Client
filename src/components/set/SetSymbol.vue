<template>
  <div class="main">
    <div class="wrapper" v-if="symbol === 'wave'">
      <div class="top-wave red"></div>
      <div class="box-top red"></div>
      <div class="box-bottom red"></div>
      <div class="bottom-wave red-color"></div>
    </div>
    <div class="wrapper" v-if="symbol === 'diamond'">
      <div class="diamond-narrow"></div>
    </div>
    <div class="wrapper" v-if="symbol === 'rounded'">
      <div class="oval red"></div>
    </div>
  </div>
</template>
<script>
export default {
  name: "SetSymbol",
  props: ["symbol", "filling", "color"]
}
</script>
<style scoped>
.bottom-wave.red-color:after {
    background-color: red;
}

.red {
  background: red;
}

.red-color {
  background-color: red;
}

.main {
  display: flex;
}

.wrapper {
  display: flex-grow;
  padding: 10px;
}

.top-wave {
  position: relative;
  height: 70px;
  width: 600px;
  background: white;
}
.top-wave:before {
  content: "";
  display: block;
  position: absolute;
  border-radius: 100% 50%;
  width: 340px;
  height: 80px;
  background-color: gray;
  right: 0;
  top: 40px;
}
.top-wave:after {
  content: "";
  display: block;
  position: absolute;
  border-radius: 100% 50%;
  width: 300px;
  height: 70px;
  background-color: white;
  left: 0;
  top: 27px;
}

.box-top {
  width: 600px;
  height: 10px;
}

.box-bottom {
  width: 600px;
  height: 100px;
}

.bottom-wave {
  position: relative;
  height: 70px;
  width: 600px;
}

.bottom-wave:before {
  content: "";
  display: block;
  position: absolute;
  border-radius: 100% 50%;
  width: 340px;
  height: 80px;
  background-color: white;
  right: -5px;
  top: 38px;
}
.bottom-wave:after {
  content: "";
  display: block;
  position: absolute;
  border-radius: 100% 50%;
  width: 300px;
  height: 70px;
  background-color: green;
  left: 0;
  top: 27px;
}

.oval {
	width: 200px;
	height: 100px;
	border-radius: 33%;
}

.diamond-narrow {
    width: 0;
    height: 0;
    border: 50px solid transparent;
    border-right: 70px solid red;
    position: relative;
    left: -50px;
}

.diamond-narrow:after {
    content: '';
    position: absolute;
    top: -50px;
    left: 70px;
    width: 0;
    height: 0;
    border: 50px solid transparent;
    border-left: 70px solid red;
}
</style>
