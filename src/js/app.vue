<template>
  <div class="app-container">
    <app-header
      :focused-candidate="focusedCandidate"
      :gallery-mode.sync="galleryMode"
      :candidates-list="allCandidates"
      @shuffle-candidates="shuffleCandidates()"
      @focus-change="changeFocus($event)"
    ></app-header>
    <div class="container time-out-container-container">
      <b-taglist class="time-out-container">
        <b-tag
          class="is-primary minimized-candidate"
          v-for="candidate of minimizedCandidates"
          :key="candidate.name"
          @click.native="minimizeCandidate(candidate)"
        >{{candidate.name}}</b-tag>
      </b-taglist>
    </div>
    <main class="container" :class="{'gallery-mode': galleryMode}">
      <div class="candidates-container">
        <transition-group name="squish" tag="div" class="transition-container">
          <div
            v-for="(candidate, index) of visibleCandidates"
            :key="candidate.name"
            class="squish-item"
          >
            <candidate-card
              :candidate="candidate"
              :class="getCardClasses(index)"
              @minimize-candidate="minimizeCandidate(candidate)"
            ></candidate-card>
          </div>
        </transition-group>
      </div>
    </main>
    <footer class="container">
      <a href="#" @click.prevent="showCandidateDialog()">Set New Candidates</a>
    </footer>
  </div>
</template>
<script lang="ts">
import { Component, Vue, Prop } from "vue-property-decorator";
import moment from "moment";
import { allCandidates as listOfCandidates, Candidate } from "./candidates";
import CandidateCard from "./candidate-card.vue";
import AppHeader from "./header.vue";

@Component({
  components: { AppHeader, CandidateCard },
})
export default class App extends Vue {
  allCandidates = listOfCandidates;
  focusedCandidate = 0;
  galleryMode = false;

  checkFocus() {
    const limit = this.visibleCandidates.length - 1;
    this.checkFocusNaN();
    this.focusedCandidate = Math.max(Math.min(this.focusedCandidate, limit), 0);
  }
  checkFocusNaN() {
    if (isNaN(this.focusedCandidate)) {
      this.focusedCandidate = 0;
    }
  }
  changeFocus(num: -1 | 1) {
    this.checkFocusNaN();
    this.focusedCandidate += num;
    this.focusedCandidate += this.visibleCandidates.length;
    this.focusedCandidate %= this.visibleCandidates.length;
  }
  isFocused(index: number) {
    return this.focusedCandidate === index;
  }
  isNext(index: number) {
    return this.focusedCandidate === index - 1;
  }
  isPrev(index: number) {
    return this.focusedCandidate === index + 1;
  }

  getCardClasses(index: number) {
    return {
      "focused-item": this.isFocused(index),
      "previous-item": this.isPrev(index),
      "on-deck": this.isNext(index),
    };
  }

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
    this.checkFocus();
  }

  showCandidateDialog() {
    this.$buefy.dialog.prompt({
      message: `List the candidates, comma separated`,
      inputAttrs: {
        placeholder: "e.g. Joe, Jan, Jill, Jazz",
      },
      trapFocus: true,
      onConfirm: (value) => {
        this.setCandidates(value.split(","));
        // this.$buefy.toast.open(`Your name is: ${value}`);
      },
    });
  }

  setCandidates(candidateNames: string[]) {
    this.allCandidates = candidateNames.map((name) => new Candidate(name));
  }
}
</script>
<style lang="scss" scoped>
.app-container {
  display: flex;
  flex-direction: column;
  height: 100%;
  flex: 1;
  > header {
    flex: 0 1 auto;
  }
  > .time-out-container-container {
    flex: 0 1 auto;
  }
  > main {
    flex: 1 0 auto;
  }
  > footer {
    flex: 0 1 auto;
  }
}

.container.gallery-mode {
  .candidates-container .transition-container {
    display: flex;
    flex-direction: row;
    flex-wrap: wrap;
    justify-content: space-evenly;
    > div,
    > candidate-card {
      margin: 0 0.5em;
      visibility: visible;
    }
  }
}
.container:not(.gallery-mode) {
  .candidate-card {
    display: none;
    &.focused-item {
      /deep/ .card-content .card-title {
        font-size: 6vw;
        line-height: initial;
      }
      display: flex;
      width: 80vw;
      max-height: 33vw;
    }
    &.is-previous,
    &.on-deck {
      display: inline-block;
      /deep/ .card-action {
        display: none !important;
      }
      /deep/ .card-content > :not(.card-title) {
        display: none;
      }
    }
  }
}

.focused-item {
  border-left: 3px inset red;
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