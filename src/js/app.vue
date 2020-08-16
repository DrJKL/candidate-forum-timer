<template>
  <div>
    <header class="is-primary is-bold container">
      <div class="hero-body">
        <div class="our-header container">
          <div class="logo-img">
            <img src="../assets/just_homes_logo.png" alt="MVMHA logo" />
          </div>
          <div>
            <h1 class="title">2020 Mountain View City Council Candidate Forum</h1>
            <h2 class="subtitle">Hosted by the Mountain View Mobile Home Alliance</h2>
          </div>
          <div class="buttons">
            <div class="container">
              <a href="#" class="btn" v-on:click.prevent="shuffleCandidates()">
                Shuffle
                <i class="material-icons right">shuffle</i>
              </a>

              <div class="time-setters-global">
                <a href="#" class="btn" v-on:click.prevent="setTime(30)">
                  30
                  <i class="material-icons left">timer</i>
                </a>
                <a href="#" class="btn" v-on:click.prevent="setTime(60)">
                  60
                  <i class="material-icons left">timer</i>
                </a>
                <a href="#" class="btn" v-on:click.prevent="setTime(90)">
                  90
                  <i class="material-icons left">timer</i>
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
    <main class="container">
      <div class="candidates-container">
        <div v-for="candidate of allCandidates" :key="candidate.name">
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
  .container {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    margin: 0;
    > a {
      flex: 0 1 auto;
      margin-right: 4px;
      margin-bottom: 8px;
    }
  }
}

.candidates-container {
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  justify-content: space-evenly;
  > div,
  > candidate-card {
    margin: 0 0.5em;
  }
}
</style>