<template>
  <div
    class="app-container"
    :class="{ 'gallery-mode': galleryMode, 'presentation-mode': !galleryMode }"
  >
    <app-header
      class="forum-app-header"
      :focused-candidate="focusManager.focusedCandidate"
      :number-candidates="numberOfCandidates"
      :gallery-mode.sync="galleryMode"
      :is-shuffling="isShuffling"
      :candidates-list="allCandidates"
      @shuffle-candidates="shuffleCandidates()"
      @focus-change="focusManager.changeFocus($event, numberOfCandidates - 1)"
    ></app-header>
    <Transition name="slide">
      <div
        v-if="!galleryMode && currentQuestion"
        class="current-question forum-app-question"
      >
        {{ currentQuestion }}
      </div>
    </Transition>
    <Transition name="slide">
      <div class="time-out-container-container" v-if="hasMinimizedCandidates">
        <b-taglist class="time-out-container">
          <b-tag
            class="is-primary minimized-candidate"
            v-for="candidate of minimizedCandidates"
            :key="candidate.name"
            @click.native="minimizeCandidate(candidate)"
            >{{ candidate.name }}</b-tag
          >
        </b-taglist>
      </div>
    </Transition>
    <main class="forum-app-candidates" :class="{ 'gallery-mode': galleryMode }">
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
    <footer class="forum-app-footer">
      <div>
        <span>Set New...</span>
        <b-button @click.prevent="showCandidateDialog()">Candidates</b-button>
        <b-button @click.prevent="showLogoDialog()">Logo</b-button>
        <b-button @click.prevent="showTitleDialog()">Title</b-button>
        <b-button @click.prevent="showOrgDialog()">Org</b-button>
        <b-button @click.prevent="showQuestionDialog()">Set Question</b-button>
        <b-button class="red-text" @click.prevent="resetConfig()"
          >Reset All</b-button
        >
      </div>
      <span class="attribution-label">
        Built by Alex Brown for the
        <a href="https://mvmha.com">MVMHA</a> (2020)
      </span>
    </footer>
  </div>
</template>
<script lang="ts">
import { Component, Vue, Prop, Watch } from "vue-property-decorator";
import { Candidate, shuffle } from "./candidates";
import CandidateCard from "./candidate-card.vue";
import AppHeader from "./header.vue";
import FocusManager from "./focus_manager";
import {
  globalConfig,
  saveConfig,
  restoreConfig,
  actuallyResetConfig,
} from "./global_config";

function preProcessQuestion(question: string): string {
  if (question === ".") {
    return "";
  }
  return question.replaceAll(/\\n/g, "\n");
}

@Component({
  components: { AppHeader, CandidateCard },
})
export default class App extends Vue {
  allCandidates: Candidate[] = [];
  galleryMode = false;
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

  get currentQuestion() {
    return `${globalConfig.currentQuestion}`;
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
  get hasMinimizedCandidates() {
    return this.minimizedCandidates.length > 0;
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
        saveConfig();
      },
    });
  }
  showLogoDialog() {
    this.$buefy.dialog.prompt({
      message: `Enter image URL for logo`,
      trapFocus: true,
      onConfirm: (value) => {
        globalConfig.eventInfo.logoUrl = value;
        saveConfig();
      },
    });
  }
  showTitleDialog() {
    this.$buefy.dialog.prompt({
      message: `Enter new Event Title`,
      trapFocus: true,
      onConfirm: (value) => {
        globalConfig.eventInfo.eventTitle = value;
        saveConfig();
      },
    });
  }
  showOrgDialog() {
    this.$buefy.dialog.prompt({
      message: `Enter new Host Organization Title`,
      trapFocus: true,
      onConfirm: (value) => {
        globalConfig.eventInfo.orgTitle = value;
        saveConfig();
      },
    });
  }
  showQuestionDialog() {
    this.$buefy.dialog.prompt({
      message: `Enter Question to display ("." for No Question)`,
      trapFocus: true,
      onConfirm: (value) => {
        console.log(`new Question: ${value}`);
        globalConfig.currentQuestion = preProcessQuestion(value);
        saveConfig();
      },
    });
  }
  resetConfig() {
    this.$buefy.dialog.confirm({
      title: "Resetting Config",
      message:
        "Are you sure you want to <b>Reset</b> all fields? This action cannot be undone.",
      confirmText: "Reset Page",
      type: "is-danger",
      hasIcon: true,
      onConfirm: () => {
        actuallyResetConfig();
        this.resetCandidates();
        this.$buefy.toast.open("Options Reset!");
      },
    });
  }

  setCandidates(candidateNames: string[]) {
    globalConfig.eventInfo.candidatesList = candidateNames;
    this.allCandidates = candidateNames.map((name) => new Candidate(name));
  }

  mounted() {
    restoreConfig();
    this.resetCandidates();
  }
  private resetCandidates() {
    this.allCandidates = globalConfig.eventInfo.candidatesList.map(
      (name) => new Candidate(name)
    );
  }
}
</script>
<style lang="scss" scoped>
.app-container {
  display: flex;
  flex-direction: column;
  flex: 1;
  gap: 8px;
  height: 100%;
  padding: 0 1em;
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
    margin-top: auto;
  }
}

.app-container.presentation-mode {
  display: grid;
  grid-template-columns: 1fr;
  grid-template-rows: 0.5fr 2fr 5fr 0.5fr;
  gap: 0px 0px;
  grid-auto-flow: row;
  grid-template-areas:
    "forum-app-header"
    "forum-app-question"
    "forum-app-candidate"
    "forum-app-footer";
  width: 100%;
  height: 100%;

  .forum-app-header {
    grid-area: forum-app-header;
  }

  .forum-app-question {
    grid-area: forum-app-question;
  }

  .forum-app-candidate {
    grid-area: forum-app-candidate;
  }

  .forum-app-footer {
    grid-area: forum-app-footer;
  }
}

footer {
  display: flex;
  justify-content: space-between;
  width: 100%;
  align-items: center;
  > a {
    flex: 0 1 auto;
  }
  > div {
    display: flex;
    align-items: center;
    > span {
      flex: 0 1 auto;
      padding-right: 1em;
    }
    > button {
      &.red-text {
        color: #f44336;
      }
      border-color: transparent;
    }
  }
}

.current-question {
  flex: 0 1 min-content;
  font-size: 6vw;
  font-weight: bold;
  padding: 1rem 0;
  text-align: center;
  align-self: center;
  line-height: 1;
  -webkit-text-stroke: 1px black;
}

main.gallery-mode {
  .candidates-container .transition-container {
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    justify-content: space-evenly;
    > div,
    > candidate-card {
      margin: 0 0.5em;
      visibility: visible;
      flex-basis: 30vw;
    }
  }
}
main:not(.gallery-mode) {
  display: contents;

  .candidate-card {
    display: none;
    &.focused-item {
      /deep/ .card-content .card-title {
        font-size: 6vw;
        font-weight: 500;
        line-height: initial;
        -webkit-text-stroke: 1px black;
      }
      display: flex;
      max-height: 33vw;
    }
    &.is-previous,
    &.on-deck {
      display: inline-block;
      /deep/ .card-action {
        display: none !important;
      }
      /deep/ .card-content {
        .card-title {
          font-weight: 500;
        }
        > :not(.card-title) {
          display: none;
        }
      }
    }
  }
}

.focused-item {
  outline: 10px solid;
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

.slide-item {
  transition: all 1s ease-in-out;
  transform: scaleY(1);
  opacity: 1;
  flex: 1;
  padding: 1em 0;
}
.slide-enter,
.slide-leave-to {
  opacity: 0;
  transform: scaleY(0);
  max-width: 0;
  flex-grow: 0.0000001;
  padding: 0em 0;
}

.app-container.presentation-mode /deep/ .our-header {
  transition: all 0.5s ease-in;
  .logo-img {
    margin-right: 1.15rem;
  }
  .header-text {
    padding-right: 0.5rem;
    padding-top: 0.5rem;
  }
  .buttons {
    transition: all 1s linear;
    align-items: center;

    .time-setters-global {
      display: grid;
      grid-template: 1fr 1fr / 1fr 1fr;
      gap: 4px;
    }

    .candidate-navigation {
      display: grid;

      grid-template: 1fr / 2fr 1fr 2fr;
      text-align: center;
      align-items: center;
      align-self: baseline;
    }
  }
  .buttons {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    grid-template-rows: repeat(2, 1fr);
    grid-auto-flow: row;
    grid-template-areas:
      "time-setters-global global-controls"
      "time-setters-global candidate-navigation";
  }

  .time-setters-global {
    grid-area: time-setters-global;
  }

  .global-controls {
    grid-area: global-controls;
  }

  .candidate-navigation {
    grid-area: candidate-navigation;
  }
}
</style>