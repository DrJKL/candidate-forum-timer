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
    <collapse-transition>
      <div
        v-show="currentQuestion"
        class="current-question forum-app-question"
        contenteditable="true"
        @blur="questionEditDone"
        @keydown.enter.prevent="questionBlur"
      >
        {{ currentQuestion }}
      </div>
    </collapse-transition>
    <collapse-transition>
      <div
        class="time-out-container-container"
        :class="{ 'has-minimized': hasMinimizedCandidates }"
      >
        <div class="time-out-container">
          <a
            class="chip is-primary minimized-candidate"
            v-for="candidate of minimizedCandidates"
            :key="candidate.name"
            @click.prevent="minimizeCandidate(candidate)"
          >
            {{ candidate.name }}
          </a>
        </div>
      </div>
    </collapse-transition>
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
        <a
          class="waves-effect waves-teal btn-flat"
          @click.prevent="showCandidateDialog()"
          >Candidates</a
        >
        <a
          class="waves-effect waves-teal btn-flat"
          @click.prevent="showLogoDialog()"
          >Logo</a
        >
        <a
          class="waves-effect waves-teal btn-flat"
          @click.prevent="showTitleDialog()"
          >Title</a
        >
        <a
          class="waves-effect waves-teal btn-flat"
          @click.prevent="showOrgDialog()"
          >Org</a
        >
        <a
          class="waves-effect waves-teal btn-flat"
          @click.prevent="dumpQuestions"
          >?</a
        >
        <a
          class="waves-effect waves-teal btn-flat red-text"
          @click.prevent="resetConfig()"
          >Reset All</a
        >
      </div>
      <span class="attribution-label">
        Built by Alex Brown for the
        <a href="https://mvmha.com">MVMHA</a> (updated 2022)
      </span>
    </footer>
  </div>
</template>
<script lang="ts">
import { Component, Vue, Prop, Watch } from "vue-property-decorator";
import { CollapseTransition } from "@ivanv/vue-collapse-transition";
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
  return question.replaceAll(/\\n/g, "\n").trim();
}

@Component({
  components: { AppHeader, CandidateCard, CollapseTransition },
})
export default class App extends Vue {
  allCandidates: Candidate[] = [];
  currentQuestion: string = "";
  galleryMode = true;
  isShuffling = false;

  focusManager = new FocusManager();

  getCardClasses(index: number) {
    return {
      "focused-item": this.focusManager.isFocused(index),
      "is-previous": this.focusManager.isPrev(index),
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
  get hasMinimizedCandidates() {
    return this.minimizedCandidates.length > 0;
  }

  minimizeCandidate(candidate: Candidate) {
    candidate.toggleMinimized();
    this.focusManager.checkFocus(this.numberOfCandidates - 1);
  }

  questionBlur(event: Event) {
    if (!(event.target instanceof HTMLDivElement)) {
      return;
    }
    event.target.blur();
  }

  questionEditDone(event: Event) {
    if (!(event.target instanceof HTMLDivElement)) {
      return;
    }
    const newQuestion = event.target.innerText;
    console.log("Question Edit Done", newQuestion);
    globalConfig.addQuestion(preProcessQuestion(newQuestion));
    saveConfig();
    this.currentQuestion = globalConfig.eventInfo.questions[0];
  }

  dumpQuestions() {
    console.log(JSON.stringify(globalConfig.eventInfo.questions, undefined, 2));
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
        globalConfig.eventInfo.questions.unshift(preProcessQuestion(value));
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

    this.currentQuestion = globalConfig.eventInfo.questions[0];
  }
}
</script>
<style lang="scss" scoped>
.app-container {
  display: grid;
  flex: 1;
  gap: 8px;
  grid-auto-flow: row;
  grid-template-columns: 1fr;
  grid-template-rows:
    fit-content(5vh) minmax(min-content, 2fr) minmax(min-content, 0fr)
    minmax(min-content, 5fr) fit-content(5vh);
  padding: 0 1em;
  transition: all 0.5s linear;

  grid-template-areas:
    "forum-app-header"
    "forum-app-question"
    "forum-app-time-out"
    "forum-app-candidates"
    "forum-app-footer";

  .forum-app-header {
    grid-area: forum-app-header;
  }

  .forum-app-question {
    -webkit-text-stroke: 1px black;
    align-items: center;
    align-self: center;
    display: flex;
    flex-direction: column;
    font-size: 6vw;
    font-weight: bold;
    grid-area: forum-app-question;
    height: 100%;
    justify-content: center;
    line-height: 1;
  }

  .time-out-container-container {
    transition: transform 0.5s ease-in;
    transform: scaleY(0);
    grid-area: forum-app-time-out;
    &.has-minimized {
      transform: scaleY(1);
    }
  }

  .candidates-container {
    grid-area: forum-app-candidates;
  }

  .forum-app-footer {
    grid-area: forum-app-footer;
  }
}

.forum-app-candidates {
  &.gallery-mode {
    .candidates-container .transition-container {
      display: grid;
      grid-template-columns: repeat(3, minmax(0, 1fr));
      justify-content: space-evenly;
      > div,
      > candidate-card {
        transition: all 0.2s ease-in-out;
        margin: 0 0.5em;
        visibility: visible;
        flex-basis: 30vw;
      }
    }
  }
  &:not(.gallery-mode) {
    .candidate-card {
      display: none;
      &.focused-item,
      &.is-previous,
      &.on-deck {
        display: flex;
      }
      &.focused-item {
        /deep/ .card-content .card-title {
          font-size: 6vw;
          font-weight: 500;
          line-height: initial;
          -webkit-text-stroke: 1px black;
        }
      }
      &.is-previous,
      &.on-deck {
        /deep/ {
          .card-content {
            padding: 12px;
            .card-title {
              font-weight: 500;
            }
            .time-section {
              display: none;
              transform: scaleY(0);
            }
          }
          .card-action {
            display: none !important;
          }
        }
      }
    }
  }
  .candidate-card.focused-item {
    /deep/ .card-content .card-title {
      transition: font-size 0.2s ease-in-out;
      font-size: 30pt;
    }
  }
}

.focused-item {
  outline: 10px solid;
}

footer {
  align-items: center;
  display: flex;
  justify-content: space-between;
  width: 100%;
  > a {
    flex: 0 1 auto;
  }
  > div {
    align-items: center;
    display: flex;
    > span {
      flex: 0 1 auto;
      padding-right: 1em;
    }
    > button {
      border-color: transparent;

      &.red-text {
        color: #f44336;
      }
    }
  }
}

[contenteditable="true"] {
  position: relative;
  &:active,
  &:focus {
    border: none;
    outline: none;
    // background-color: green;
    // text-shadow: 1px 1px 4px #aa0000aa;
  }
}

.squish-enter-to,
.squish-leave-from {
  transition: all 0.5s;
  opacity: 1;
}
.squish-enter-from,
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

.slide-enter-active,
.slide-leave-active {
  transition: all 0.5s linear;
}
.slide-enter-to,
.slide-leave-from {
  // transform: scaleY(1);
  opacity: 1;
  // padding: 1em 0;
}
.slide-enter-from,
.slide-leave-to {
  // transform: scaleY(0);
  opacity: 0;
  // padding: 0em 0;
}
</style>