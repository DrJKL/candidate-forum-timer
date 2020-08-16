<template>
  <div>
    <main class="container">
      <section class="buttons">
        <a href="#" class="btn" v-on:click.prevent="shuffleCandidates()">Shuffle</a>

        <div class="time-setters-global">
          <a href="#" class="btn" v-on:click.prevent="setTime(30)">30</a>
          <a href="#" class="btn" v-on:click.prevent="setTime(60)">60</a>
          <a href="#" class="btn" v-on:click.prevent="setTime(90)">90</a>
        </div>
      </section>
      <div class="candidates-container">
        <div v-for="candidate of allCandidates" :key="candidate.name" class>
          <candidate-card :candidate="candidate"></candidate-card>
        </div>
      </div>
    </main>
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

  setTime(time: number) {
    this.allCandidates
      .map((candidate) => candidate.timer)
      .forEach((timer) => {
        timer.setTime(time, "s");
      });
  }
}
</script>
<style lang="scss" scoped>
.buttons {
  display: flex;
  justify-content: space-evenly;
  align-items: flex-end;
  margin: 0;
  a {
    flex: 0 1 auto;
  }
}

.candidates-container {
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  justify-content: space-evenly;
  > div {
    margin: 0 0.5em;
  }
}
</style>