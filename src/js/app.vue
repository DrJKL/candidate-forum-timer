<template>
  <div>
    <main class="container">
      <div class="candidates-container">
        <div v-for="candidate of allCandidates" :key="candidate.name" class="">
          <candidate-card :candidate="candidate"></candidate-card>
        </div>
      </div>
    </main>
    <section>
      <a href="#" class="btn" v-on:click.prevent="shuffleCandidates()">Shuffle</a>
    </section>
  </div>
</template>
<script lang="ts">
import { Component, Vue, Prop } from "vue-property-decorator";
import moment from "moment";
import { allCandidates as listOfCandidates } from "./candidates";
import CandidateCard from "./candidate-card.vue";

@Component({
  components: { CandidateCard },
})
export default class App extends Vue {
  allCandidates = listOfCandidates;

  shuffleCandidates() {
    const tempCandidates = this.allCandidates.slice();
    let currentIndex = tempCandidates.length;
    let temporaryValue, randomIndex;

    // While there remain elements to shuffle...
    while (0 !== currentIndex) {
      // Pick a remaining element...
      randomIndex = Math.floor(Math.random() * currentIndex);
      currentIndex -= 1;

      // And swap it with the current element.
      temporaryValue = tempCandidates[currentIndex];
      tempCandidates[currentIndex] = tempCandidates[randomIndex];
      tempCandidates[randomIndex] = temporaryValue;
    }
    this.allCandidates = tempCandidates;
  }
}
</script>
<style lang="scss" scoped>
.candidates-container {
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  > div {
    margin: 0 .5em;
  }
}
</style>