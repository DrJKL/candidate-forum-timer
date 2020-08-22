<template>
  <div class="app-container">
    <app-header
      :focused-candidate="focusManager.focusedCandidate"
      :number-candidates="numberOfCandidates"
      :gallery-mode.sync="galleryMode"
      :is-shuffling="isShuffling"
      :candidates-list="allCandidates"
      @shuffle-candidates="shuffleCandidates()"
      @focus-change="focusManager.changeFocus($event, numberOfCandidates - 1)"
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
      <div>
        <span>Set New</span>
        <a href="#" class="btn-flat" @click.prevent="showCandidateDialog()">Candidates</a>
        <a href="#" class="btn-flat" @click.prevent="showLogoDialog()">Logo</a>
        <a href="#" class="btn-flat" @click.prevent="showTitleDialog()">Title</a>
      </div>
      <span class="attribution-label">
        Originally Built by Alex Brown for the
        <a href="https://mvmha.com">MVMHA</a> (2020)
      </span>
    </footer>
  </div>
</template>
<script lang="ts">
import { Component, Vue, Prop } from "vue-property-decorator";
import moment from "moment";
import {
  allCandidates as listOfCandidates,
  Candidate,
  shuffle,
} from "./candidates";
import CandidateCard from "./candidate-card.vue";
import AppHeader from "./header.vue";
import FocusManager from "./focus_manager";
import { globalConfig } from "./global_config";

@Component({
  components: { AppHeader, CandidateCard },
})
export default class App extends Vue {
  allCandidates = listOfCandidates;
  galleryMode = true;
  isShuffling = false;

  focusManager = new FocusManager();

  getCardClasses(index: number) {
    return {
      "focused-item": this.focusManager.isFocused(index),
      "previous-item": this.focusManager.isPrev(index),
      "on-deck": this.focusManager.isNext(index),
    };
  }

  async shuffleCandidates() {
    const wasGallery = this.galleryMode;

    this.isShuffling = true;
    if (!wasGallery) {
      this.galleryMode = true;
      await new Promise((resolve) => setTimeout(resolve, 700));
    }
    this.allCandidates = shuffle(this.allCandidates);

    await new Promise((resolve) => setTimeout(resolve, 100));
    this.focusManager.focusedCandidate = 0;

    await new Promise((resolve) => setTimeout(resolve, 1000));
    this.isShuffling = false;
    this.galleryMode = wasGallery;
  }

  get visibleCandidates() {
    return this.allCandidates.filter((candidate) => !candidate.isMinimized);
  }
  get minimizedCandidates() {
    return this.allCandidates.filter((candidate) => candidate.isMinimized);
  }
  get numberOfCandidates() {
    return this.visibleCandidates.length;
  }

  minimizeCandidate(candidate: Candidate) {
    candidate.toggleMinimized();
    this.focusManager.checkFocus(this.numberOfCandidates - 1);
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
      },
    });
  }
  showLogoDialog() {
    this.$buefy.dialog.prompt({
      message: `Enter image URL for logo`,
      inputAttrs: {
        // placeholder: "e.g. Joe, Jan, Jill, Jazz",
      },
      trapFocus: true,
      onConfirm: (value) => {
        console.log("Logo change: ", value);
        console.log(globalConfig.eventInfo);
        globalConfig.eventInfo.logoUrl = value;
        console.log(globalConfig.eventInfo);
      },
    });
  }
  showTitleDialog() {
    this.$buefy.dialog.prompt({
      message: `Enter new Event Title`,
      inputAttrs: {
        // placeholder: "e.g. Joe, Jan, Jill, Jazz",
      },
      trapFocus: true,
      onConfirm: (value) => {
        globalConfig.eventInfo.eventTitle = value;
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

footer {
  display: flex;
  justify-content: space-between;
  width: 80%;
  > a {
    flex: 0 1 auto;
  }
  > span {
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
  outline: 4px solid;
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