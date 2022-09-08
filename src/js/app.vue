<template>
  <div
    class="app-container"
    :class="{ 'gallery-mode': galleryMode, 'presentation-mode': !galleryMode }">
    <app-header
      class="forum-app-header"
      :focused-candidate="focusManager.focusedCandidate"
      :number-candidates="numberOfCandidates"
      :gallery-mode.sync="galleryMode"
      :is-shuffling="isShuffling"
      :candidates-list="allCandidates"
      @shuffle-candidates="shuffleCandidates()"
      @focus-change="
        focusManager.changeFocus($event, numberOfCandidates - 1)
      "></app-header>
    <collapse-transition>
      <div
        v-show="currentQuestion"
        class="current-question forum-app-question flow-text"
        @dblclick="setQuestionEditable"
        @keydown.esc.prevent="blurElement"
        @keydown.enter.prevent="blurElement">
        {{ currentQuestion }}
      </div>
    </collapse-transition>
    <collapse-transition>
      <div
        class="time-out-container-container"
        :class="{ 'has-minimized': hasMinimizedCandidates }">
        <div class="time-out-container">
          <a
            class="chip is-primary minimized-candidate"
            v-for="candidate of minimizedCandidates"
            :key="candidate.name"
            @click.prevent="minimizeCandidate(candidate)">
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
            class="squish-item">
            <candidate-card
              :candidate="candidate"
              :class="getCardClasses(index)"
              @minimize-candidate="
                minimizeCandidate(candidate)
              "></candidate-card>
          </div>
        </transition-group>
      </div>
    </main>
    <footer class="forum-app-footer">
      <div>
        <span>Set New...</span>
        <a
          class="waves-effect waves-teal btn-flat"
          @click.prevent="showCandidateDialog">
          Candidates
        </a>
        <a
          class="waves-effect waves-teal btn-flat"
          @click.prevent="showLogoDialog">
          Logo
        </a>
        <a
          class="waves-effect waves-teal btn-flat"
          @click.prevent="setTitleEditable">
          Title
        </a>
        <a
          class="waves-effect waves-teal btn-flat"
          @click.prevent="setOrgEditable">
          Org
        </a>
        <a
          class="waves-effect waves-teal btn-flat"
          @click.prevent="dumpQuestions"
          title="See Current Questions">
          <i class="material-icons">question_mark</i>
        </a>
        <a
          class="waves-effect waves-teal btn-flat"
          @click.prevent="showQuestionsDialog"
          title="Edit Questions">
          <i class="material-icons">quiz</i>
        </a>
        <a
          class="waves-effect waves-teal btn-flat"
          @click.prevent="incrementQuestion(-1)"
          title="Decrement Question">
          <i class="material-icons">navigate_before</i>
        </a>
        <a
          class="waves-effect waves-teal btn-flat"
          @click.prevent="incrementQuestion(1)"
          title="Increment Question">
          <i class="material-icons">navigate_next</i>
        </a>

        <a
          class="waves-effect waves-teal btn-flat red-text"
          @click.prevent="resetConfig">
          Reset All
        </a>
      </div>
      <span class="attribution-label">
        Built by Alex Brown for the
        <a href="https://mvmha.com">MVMHA</a> (updated 2022)
      </span>
    </footer>
    <dialog
      class="config-dialog"
      ref="reset-config-dialog"
      @close="resetDialogClosed">
      <div class="card content-wrapper">
        <h1 class="header">Resetting Config!</h1>
        <p class="card-content">
          Are you sure you want to <b>Reset</b> all fields? This action cannot
          be undone.
        </p>
        <form method="dialog" class="card-action">
          <button
            class="btn red darken-4 z-depth-2 please-button"
            type="submit"
            value="reset_please">
            RESET IT ALL
          </button>
          <button class="btn" type="submit" value="reset_cancel">Cancel</button>
        </form>
      </div>
    </dialog>
    <dialog
      class="config-dialog"
      ref="logo-config-dialog"
      @close="logoDialogClosed">
      <div class="card content-wrapper">
        <h1 class="header">Set New Logo</h1>
        <div class="card-content">
          <div class="logo-instructions">
            <p>Input url for logo</p>
            <img v-if="tempImg" :src="tempImg" alt="preview for the logo" />
          </div>
          <input
            type="text"
            id="new-logo-input"
            form="logo-form"
            v-model="tempImg" />
        </div>
        <form id="logo-form" method="dialog" class="card-action">
          <button
            class="btn blue darken-4 z-depth-2 please-button"
            type="submit"
            :value="tempImg">
            Set New Logo
          </button>
          <button class="btn" type="submit" value="cancel">Cancel</button>
        </form>
      </div>
    </dialog>
    <dialog
      class="config-dialog"
      ref="candidates-config-dialog"
      @close="candidatesDialogClosed">
      <div class="card content-wrapper">
        <h1 class="header">Set New Candidates</h1>
        <div class="card-content">
          <p>List the candidates, comma separated</p>
          <input
            type="text"
            id="new-candidates-input"
            form="candidates-form"
            placeholder="e.g. Joe, Jan, Jill, Jazz"
            v-model="tempCandidates" />
          <ul class="items-list">
            <li
              v-for="candidate in toCandidates(tempCandidates)"
              :key="candidate"
              class="candidate-name list-item">
              {{ candidate }}
            </li>
          </ul>
        </div>
        <form id="candidates-form" method="dialog" class="card-action">
          <button
            class="btn blue darken-4 z-depth-2 please-button"
            type="submit"
            :value="tempCandidates">
            Set New Candidates
          </button>
          <button class="btn" type="submit" value="cancel">Cancel</button>
        </form>
      </div>
    </dialog>
    <dialog
      class="config-dialog"
      ref="questions-config-dialog"
      @close="questionsDialogClosed">
      <div class="card content-wrapper">
        <h1 class="header">Set New Questions</h1>
        <div class="card-content">
          <p>Setup Questions in advance</p>
          <div class="input-field">
            <input
              type="text"
              id="new-questions-input"
              form="questions-form"
              placeholder="How much wood would a woodchuck chuck...?"
              v-model="tempQuestion"
              @keydown.enter.prevent="addNewQuestion(tempQuestion)" />
            <i
              class="material-icons prefix add-item-button"
              @click.prevent="addNewQuestion(tempQuestion)"
              >add_circle</i
            >
          </div>

          <ul class="items-list">
            <li
              v-for="(question, index) in tempQuestions"
              :key="question"
              :value="index"
              class="question-text list-item">
              <i
                class="material-icons remove-item-button"
                @click.prevent="removeQuestion(index, question)"
                >remove_circle_outline</i
              >
              {{ index }}
              {{ question }}
            </li>
          </ul>
        </div>
        <form id="questions-form" method="dialog" class="card-action">
          <button
            class="btn blue darken-4 z-depth-2 please-button"
            type="submit"
            value="new_questions_please">
            Set New Questions List
          </button>
          <button class="btn" type="submit" value="cancel">Cancel</button>
        </form>
      </div>
    </dialog>
  </div>
</template>
<script lang="ts">
import { Component, Vue, Prop, Watch, Ref } from 'vue-property-decorator';
import { CollapseTransition } from '@ivanv/vue-collapse-transition';
import { Candidate } from './candidates';
import { shuffle, blurElement } from './common';
import CandidateCard from './candidate-card.vue';
import AppHeader from './header.vue';
import FocusManager from './focus_manager';
import {
  addUniqueQuestion,
  globalConfig,
  restoreConfig,
  actuallyResetConfig,
  Config,
} from './global_config';
import M from 'materialize-css';

@Component({
  components: { AppHeader, CandidateCard, CollapseTransition },
})
export default class App extends Vue {
  allCandidates: Candidate[] = [];
  galleryMode = true;
  isShuffling = false;
  questionIdx = 0;

  tempImg = '';
  tempCandidates = '';
  tempQuestions: string[] = [];
  tempQuestion = '';

  focusManager = new FocusManager();
  blurElement = blurElement;
  config = globalConfig;

  @Watch('config', { deep: true, immediate: true })
  configChanged(newConfig: Config) {
    this.$forceUpdate();
  }

  @Ref('reset-config-dialog')
  resetDialog?: HTMLDialogElement;

  @Ref('logo-config-dialog')
  logoDialog?: HTMLDialogElement;

  @Ref('candidates-config-dialog')
  candidatesDialog?: HTMLDialogElement;

  @Ref('questions-config-dialog')
  questionsDialog?: HTMLDialogElement;

  mounted() {
    restoreConfig();
    this.resetCandidates();
  }

  getCardClasses(index: number) {
    return {
      'focused-item': this.focusManager.isFocused(index),
      'is-previous': this.focusManager.isPrev(index),
      'on-deck': this.focusManager.isNext(index),
    };
  }

  toCandidates(commaSeparated: string) {
    return commaSeparated
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);
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
  get currentQuestion() {
    return this.config.eventInfo.questions[this.questionIdx];
  }

  minimizeCandidate(candidate: Candidate) {
    candidate.toggleMinimized();
    this.focusManager.checkFocus(this.numberOfCandidates - 1);
  }

  incrementQuestion(dir = 1) {
    const numQuestions = this.config.eventInfo.questions.length;
    this.questionIdx += dir + numQuestions;
    this.questionIdx = this.questionIdx % numQuestions;
    console.log(numQuestions, this.questionIdx);
  }

  dumpQuestions() {
    const questionsString = globalConfig.eventInfo.questions.join('\n');
    console.log(questionsString);
    M.toast({ html: questionsString });
  }

  questionEditDone(event: Event) {
    if (!(event.target instanceof HTMLElement)) {
      return;
    }
    const newQuestion = event.target.innerText;
    globalConfig.addQuestion(newQuestion);
  }

  showCandidateDialog() {
    this.tempCandidates = this.allCandidates
      .map((candidate) => candidate.name)
      .join(', ');
    if (this.candidatesDialog) {
      this.candidatesDialog.showModal();
    }
  }
  showLogoDialog() {
    this.tempImg = this.config.eventInfo.logoUrl;
    if (this.logoDialog) {
      this.logoDialog.showModal();
    }
  }
  showQuestionsDialog() {
    this.tempQuestion = '';
    this.tempQuestions = [...this.config.eventInfo.questions];
    if (this.questionsDialog) {
      this.questionsDialog.showModal();
    }
  }

  addNewQuestion(newQuestion: string) {
    this.tempQuestions = addUniqueQuestion(newQuestion, this.tempQuestions);
    this.tempQuestion = '';
  }

  removeQuestion(index: number, question: string) {
    this.tempQuestions.splice(index, 1);
  }

  setQuestionEditable(event: MouseEvent) {
    if (!(event.target instanceof HTMLElement)) {
      return;
    }
    setEditableElement(event.target, (newValue) => {
      globalConfig.addQuestion(newValue);
    });
  }

  setTitleEditable() {
    const element = document.getElementById('event-title');
    if (!(element instanceof HTMLElement)) {
      return;
    }
    setEditableElement(element, (newValue) => {
      globalConfig.updateEvent(newValue);
    });
  }

  setOrgEditable() {
    const element = document.getElementById('org-title');
    if (!(element instanceof HTMLElement)) {
      return;
    }
    setEditableElement(element, (newValue) => {
      globalConfig.updateOrg(newValue);
    });
  }

  resetDialogClosed(event: Event) {
    if (!this.resetDialog?.returnValue) {
      return;
    }
    if (this.resetDialog.returnValue !== 'reset_please') {
      console.log(
        'Not actually resetting, dialog value:',
        this.resetDialog.returnValue,
        '\nProbably need to be more polite about it.'
      );
      return;
    }
    actuallyResetConfig();
    this.resetCandidates();
    M.toast({ html: 'Options Reset!' });
  }
  resetConfig() {
    if (this.resetDialog) {
      this.resetDialog.showModal();
    }
  }
  logoDialogClosed(event: Event) {
    if (
      !this.logoDialog?.returnValue ||
      this.logoDialog.returnValue === 'cancel'
    ) {
      return;
    }
    this.config.updateLogo(this.logoDialog.returnValue);
  }
  candidatesDialogClosed(event: Event) {
    if (
      !this.candidatesDialog?.returnValue ||
      this.candidatesDialog.returnValue === 'cancel'
    ) {
      return;
    }
    this.setCandidates(this.toCandidates(this.candidatesDialog.returnValue));
  }
  questionsDialogClosed(event: Event) {
    if (
      !this.questionsDialog?.returnValue ||
      this.questionsDialog.returnValue === 'cancel'
    ) {
      return;
    }
    this.questionIdx = 0;
    this.config.eventInfo.questions = [...this.tempQuestions];
  }

  setCandidates(candidateNames: string[]) {
    globalConfig.eventInfo.candidatesList = candidateNames;
    this.allCandidates = candidateNames.map((name) => new Candidate(name));
  }

  private resetCandidates() {
    this.allCandidates = globalConfig.eventInfo.candidatesList.map(
      (name) => new Candidate(name)
    );
  }
}
function setEditableElement(
  el: HTMLElement,
  valueCallback: (value: string) => void
) {
  el.setAttribute('contenteditable', 'true');
  function onBlur(event: FocusEvent) {
    if (!(event.target instanceof HTMLElement)) {
      return;
    }
    const newValue = event.target.innerText;

    valueCallback(newValue);
    event.target.removeAttribute('contenteditable');
    event.target.removeEventListener('blur', onBlur);
  }
  el.addEventListener('blur', onBlur);

  el.focus();
  selectElementContents(el);
}
function selectElementContents(el: HTMLElement) {
  var range = document.createRange();
  range.selectNodeContents(el);
  var sel = window.getSelection();
  sel?.removeAllRanges();
  sel?.addRange(range);
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
    'forum-app-header'
    'forum-app-question'
    'forum-app-time-out'
    'forum-app-candidates'
    'forum-app-footer';

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
    .minimized-candidate {
      cursor: pointer;
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

[contenteditable='true'] {
  position: relative;
  &:active,
  &:focus {
    border: none;
    outline: none;
    // background-color: green;
    // text-shadow: 1px 1px 4px #aa0000aa;
  }
}

dialog.config-dialog {
  border: 0;
  border-radius: 10px;
  padding: 0;
  box-shadow: 0px 0px 20px 10px rgba(200, 255, 200, 0.5);
  > .content-wrapper {
    margin: 0;
    padding: 1.5rem;

    > .header {
      font-variant: small-caps;
      margin-top: 0;
    }
    .card-content {
      margin: 24px;
    }
    .card-action {
      display: flex;
      justify-content: space-between;
    }
    .please-button {
      font-weight: 700;
    }
    .remove-item-button,
    .add-item-button {
      cursor: pointer;
      &:hover {
        text-shadow: 1px 1px 5px red;
      }
    }
    .remove-item-button:hover {
      text-shadow: 1px 1px 5px red;
    }
    .add-item-button:hover {
      text-shadow: 0 0 5px green;
    }

    .items-list {
      .list-item {
        display: flex;
        gap: 8px;
      }
    }
  }

  &::backdrop {
    background-color: rgba(5, 0, 0, 0.8);
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
  opacity: 1;
}
.slide-enter-from,
.slide-leave-to {
  opacity: 0;
}
</style>
