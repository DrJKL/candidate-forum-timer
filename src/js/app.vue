<template>
  <div class="app-container">
    <header class="is-primary is-bold container">
      <div class="hero-body">
        <div class="our-header container">
          <div class="logo-img">
            <img src="../assets/just_homes_logo.png" alt="MVMHA logo" />
          </div>
          <div class="header-text">
            <h1 class="title">
              2020
              <span>Mountain View</span>
              <span>City Council</span>
              <span>Candidate Forum</span>
            </h1>
            <h2 class="subtitle">
              Hosted by the
              <span>Mountain View Mobile Home Alliance</span>
            </h2>
          </div>
          <div class="buttons box">
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
    </header>
    <main class="container">
      <b-taglist class="time-out-container">
        <b-tag
          class="is-primary minimized-candidate"
          v-for="candidate of minimizedCandidates"
          :key="candidate.name"
          v-on:click.native="minimizeCandidate(candidate)"
        >{{candidate.name}}</b-tag>
      </b-taglist>
      <div class="candidates-container">
        <transition-group name="squish" tag="div" class="transition-container">
          <div v-for="candidate of visibleCandidates" :key="candidate.name" class="squish-item">
            <candidate-card :candidate="candidate"></candidate-card>
          </div>
        </transition-group>
      </div>
    </main>
  </div>
</template>
<script lang="ts">
import { Component, Vue, Prop } from "vue-property-decorator";
import moment from "moment";
import { allCandidates as listOfCandidates, Candidate } from "./candidates";
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

  get visibleCandidates() {
    return this.allCandidates.filter((candidate) => !candidate.isMinimized);
  }
  get minimizedCandidates() {
    return this.allCandidates.filter((candidate) => candidate.isMinimized);
  }

  minimizeCandidate(candidate: Candidate) {
    console.log("FFFF", candidate);
    candidate.toggleMinimized();
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
.our-header {
  display: flex;
  > div {
    flex: 1;
  }
  > div.logo-img {
    flex: 0 1 auto;
    margin-right: 2em;
    img {
      height: 5em;
      width: auto;
    }
  }
  .header-text {
    padding-right: 1em;
  }
  .buttons {
    display: flex;
    flex-direction: column;
    align-items: flex-end;
    flex: 0 1 auto;
    width: fit-content;
    > a {
      flex: 0 1 auto;
      margin-bottom: 8px;
    }
  }
}

.our-header .title span,
.subtitle span {
  display: inline-block;
}

.app-container {
  display: flex;
  flex-direction: column;
  height: 100%;
  flex: 1;
  > header {
    flex: 0 1 auto;
  }
}

.candidates-container .transition-container {
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  justify-content: space-evenly;
  > div,
  > candidate-card {
    margin: 0 0.5em;
  }
}

.squish-item {
  transition: all 0.5s;
  opacity: 1;
}
.squish-enter,
.squish-leave-to {
  opacity: 0;
  max-width: 0;
  flex-grow: 0.0000001;
}
.squish-leave-active {
  position: absolute;
}

.squish-move {
  transition: transform 0.5s;
}
</style>