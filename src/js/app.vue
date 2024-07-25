<template>
  <div
    class="app-container"
    :class="{
      'gallery-mode': galleryMode,
      'presentation-mode': !galleryMode,
      'immersive-mode': immersiveMode,
    }"
    :style="{
      '--candidate-columns': candidateColumns,
    }">
    <app-header
      class="forum-app-header"
      :focused-candidate="focusManager.focusedCandidate"
      :number-candidates="numberOfCandidates"
      :gallery-mode="galleryMode"
      @update:gallery-mode="galleryMode = $event"
      :is-shuffling="isShuffling"
      :candidates-list="allCandidates"
      @shuffle-candidates="shuffleCandidates()"
      @reset-timers="resetTimers()"
      @focus-change="
        focusManager.changeFocus($event, numberOfCandidates - 1)
      "></app-header>
    <collapse-transition>
      <div
        ref="current-question"
        class="question-wrap"
        :data-replicated-value="currentQuestion">
        <div
          v-show="currentQuestion"
          class="current-question forum-app-question"
          @dblclick="setQuestionEditable"
          @keydown.esc.prevent="blurElement"
          @keydown.enter.prevent="blurElement">
          {{ currentQuestion }}
        </div>
      </div>
    </collapse-transition>
    <main
      class="forum-app-candidates"
      :class="{
        'gallery-mode': galleryMode,
      }">
      <div class="candidates-container">
        <transition-group name="squish" tag="div" class="transition-container">
          <div
            v-for="(candidate, index) of visibleCandidates"
            :key="candidate.name"
            class="squish-item">
            <candidate-card
              :candidate="candidate"
              :class="getCardClasses(index)"
              @click-candidate-name="clickedCandidate(candidate, index, $event)"
              @minimize-candidate="
                minimizeCandidate(candidate)
              "></candidate-card>
          </div>
        </transition-group>
      </div>
      <div class="forum-app-gallery">
        <div class="forum-app-gallery-wrapper">
          <h3 class="face-area-header">
            <i class="material-icons">star</i> The Stars Of The Show!
            <i class="material-icons">star</i>
          </h3>
          <div class="all-faces">
            <div class="face-box z-depth-1">
              <div class="face-box-label z-depth-1">Moderator</div>
            </div>
            <div
              class="face-box z-depth-1"
              v-for="(candidate, index) of visibleCandidatesUnshuffled">
              <div class="face-box-label z-depth-1">
                {{ candidate.name }}
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>

    <footer class="forum-app-footer">
      <div>
        <span>Set New...</span>
        <a
          class="waves-effect waves-teal btn-flat"
          role="button"
          @click.prevent="showCandidateDialog">
          Candidates
        </a>
        <a
          class="waves-effect waves-teal btn-flat"
          role="button"
          @click.prevent="showLogoDialog">
          Logo
        </a>
        <a
          class="waves-effect waves-teal btn-flat"
          role="button"
          @click.prevent="setTitleEditable">
          Title
        </a>
        <a
          class="waves-effect waves-teal btn-flat"
          role="button"
          @click.prevent="setOrgEditable">
          Org
        </a>
        <a
          class="waves-effect waves-teal btn-flat"
          role="button"
          @click.prevent="dumpQuestions"
          title="See Current Questions">
          <i class="material-icons">question_mark</i>
        </a>
        <a
          class="waves-effect waves-teal btn-flat"
          role="button"
          @click.prevent="showQuestionsDialog"
          title="Edit Questions">
          <i class="material-icons">quiz</i>
        </a>
        <a
          class="waves-effect waves-teal btn-flat"
          role="button"
          @click.prevent="incrementQuestion(-1)"
          title="Previous Question">
          <i class="material-icons">navigate_before</i>
        </a>
        <a
          class="waves-effect waves-teal btn-flat"
          role="button"
          @click.prevent="incrementQuestion(1)"
          title="Next Question">
          <i class="material-icons">navigate_next</i>
        </a>
        <a
          class="waves-effect waves-teal btn-flat"
          role="button"
          @click.prevent="immersiveMode = !immersiveMode"
          title="Next Question">
          Immersive?
        </a>

        <a
          class="waves-effect waves-teal btn-flat red-text"
          role="button"
          @click.prevent="resetConfig">
          Reset All
        </a>
        <Transition>
          <span class="" v-if="isSizing">Resizing text...</span>
        </Transition>
      </div>
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

      <span class="attribution-label">
        Built by Alex Brown for the
        <a href="https://mvmha.com">MVMHA</a> (updated 2024)
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
            <transition-group
              name="squish"
              tag="li"
              class="transition-container">
              <li
                v-for="(question, index) in tempQuestions"
                :key="question"
                :value="index"
                class="question-text list-item">
                <div class="move-arrows">
                  <i
                    class="material-icons move-item-button"
                    :hidden="index === 0"
                    @click.prevent="moveQuestion(index, -1)"
                    >arrow_drop_up
                  </i>
                  <i
                    class="material-icons move-item-button"
                    :hidden="index >= numberOfQuestions - 1"
                    @click.prevent="moveQuestion(index, 1)">
                    arrow_drop_down
                  </i>
                </div>
                {{ question }}
                <i
                  class="material-icons remove-item-button"
                  @click.prevent="removeQuestion(index, question)">
                  remove_circle_outline
                </i>
              </li>
            </transition-group>
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
import { Component, Vue, Watch, Ref, toNative } from 'vue-facing-decorator';
import CollapseTransition from '@ivanv/vue-collapse-transition/src/CollapseTransition.vue';
import { Candidate } from './candidates';
import {
  shuffle,
  blurElement,
  autosizeText,
  setEditableElement,
} from './common';
import CandidateCard from './candidate-card.vue';
import AppHeader from './header.vue';
import FocusManager from './focus_manager';
import {
  globalConfig,
  restoreConfig,
  actuallyResetConfig,
  Config,
  saveConfig,
} from './global_config';
import { addUniqueItem } from './list_management';
import M from 'materialize-css';

@Component({
  components: { AppHeader, CandidateCard, CollapseTransition },
})
class App extends Vue {
  allCandidates: Candidate[] = [];
  allCandidatesUnshuffled: Candidate[] = [];
  candidateColumns = 3;
  galleryMode = true;
  immersiveMode = true;
  isShuffling: true|null = null;
  isSizing: true|null = null;
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
    // this.$forceUpdate();
  }
  @Watch('allCandidates', { deep: true, immediate: true })
  candidatesChanged() {
    this.candidateColumns = this.howManyColumns(this.visibleCandidates.length);
  }
  @Watch('currentQuestion', { immediate: true })
  async questionChanged() {
    console.log('currentQuestionChanged', this.currentQuestion);
    this.isSizing = true;
    if (this.currentQuestionElement) {
      await autosizeText(this.currentQuestionElement, 10);
      await autosizeText(this.currentQuestionElement, -1);
    }
    this.isSizing = null;
  }
  @Watch('immersiveMode', { immediate: true })
  async immersiveChanged() {
    await this.questionChanged();
  }

  @Ref('reset-config-dialog')
  resetDialog?: HTMLDialogElement;

  @Ref('logo-config-dialog')
  logoDialog?: HTMLDialogElement;

  @Ref('candidates-config-dialog')
  candidatesDialog?: HTMLDialogElement;

  @Ref('questions-config-dialog')
  questionsDialog?: HTMLDialogElement;

  @Ref('current-question')
  currentQuestionElement?: HTMLElement;

  async mounted() {
    restoreConfig();
    this.resetCandidates();
    this.questionChanged();
    window.addEventListener('resize', () => {
      this.questionChanged();
    });
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
    this.isShuffling = null;
    this.galleryMode = wasGallery;
  }

  async resetTimers() {
    for (const candidate of this.allCandidates) {
      candidate.timer.pause();
      candidate.timer.resetTime();
    }
  }

  get visibleCandidates() {
    return this.allCandidates.filter((candidate) => !candidate.isMinimized);
  }
  get visibleCandidatesUnshuffled() {
    return this.allCandidatesUnshuffled.filter(
      (candidate) => !candidate.isMinimized
    );
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
  get numberOfQuestions() {
    return this.config.eventInfo.questions.length;
  }

  clickedCandidate(candidate: Candidate, index: number, $event: boolean) {
    console.log(`${candidate}`, index, $event);
    if ($event) {
      this.focusManager.changeFocusAbsolute(index, this.numberOfCandidates - 1);
    }
  }

  minimizeCandidate(candidate: Candidate) {
    candidate.toggleMinimized();
    this.focusManager.checkFocus(this.numberOfCandidates - 1);
  }

  incrementQuestion(dir = 1) {
    const numQuestions = this.config.eventInfo.questions.length;
    this.questionIdx += dir + numQuestions;
    this.questionIdx = this.questionIdx % numQuestions;
    console.log('increment', dir, numQuestions, this.questionIdx);
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
    this.tempQuestions = addUniqueItem(newQuestion, this.tempQuestions);
    this.tempQuestion = '';
  }

  removeQuestion(index: number, question: string) {
    this.tempQuestions.splice(index, 1);
  }
  moveQuestion(index: number, dir: -1 | 1) {
    const [question] = this.tempQuestions.splice(index, 1);
    this.tempQuestions.splice(index + dir, 0, question);
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
    saveConfig();
  }

  setCandidates(candidateNames: string[]) {
    globalConfig.eventInfo.candidatesList = candidateNames;
    this.resetCandidates();
  }

  private howManyColumns(howManyCandidates: number) {
    switch (true) {
      case howManyCandidates === 1:
        return 1;
      case howManyCandidates % 2 === 0 && howManyCandidates < 5:
        return 2;
      default:
        return 3;
    }
  }

  private resetCandidates() {
    this.allCandidates = globalConfig.eventInfo.candidatesList.map(
      (name) => new Candidate(name)
    );
    this.allCandidatesUnshuffled = [...this.allCandidates];
  }
}
export default toNative(App);
</script>
<style lang="scss" scoped>
.app-container {
  --candidate-columns: 3;
  display: grid;
  flex: 1;
  gap: 8px;
  grid-auto-flow: row;
  grid-template-columns: 1fr;
  grid-template-rows:
   fit-content(5vh)
   minmax(10em, 1fr)
   4fr
   fit-content(5vh);
  height: 100%;
  max-height: 100%;
  overflow: hidden;
  padding: 0 16px;

  grid-template-areas:
    'forum-app-header'
    'forum-app-question'
    'forum-app-candidates'
    'forum-app-footer';

  .forum-app-header {
    max-height: min-content;
    grid-area: forum-app-header;
  }

  .question-wrap {
    --question-size-test: 200px;

    display: grid;
    grid-area: forum-app-question;
    position: relative;

    .forum-app-question {
      -webkit-text-stroke: 1px black;
      align-items: center;
      display: grid;
      font-size: var(--question-size-test);
      font-weight: bold;
      grid-area: 1 / 1 / 2 / 2;
      line-height: 1;
      position: absolute;
      left: 50%;
      top: 50%;
      transform: translateX(-50%) translateY(-50%);
      transform-origin: center;
      text-align: center;
      width: calc(100% - 8px);
      height: calc(100% - 8px);
      user-select: none;
    }
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

  .forum-app-candidates {
    grid-area: forum-app-candidates;

    transition: width 1s linear;
    display: flex;
    flex-direction: row;
    gap: 16px;
    overflow-y: auto;
    @at-root .app-container.immersive-mode
        .forum-app-candidates
        .forum-app-gallery {
      flex-grow: 0.000001;
      width: 0;
      overflow: hidden;
      .forum-app-gallery-wrapper {
        transform: translateX(110%);
      }
    }
    .candidates-container {
      flex: 2;
    }
    .forum-app-gallery {
      flex: 1;
      transition: all 0.5s ease-in;
    }

    &.gallery-mode {
      .candidates-container .transition-container {
        display: grid;
        grid-template-columns: repeat(
          (var(--candidate-columns)),
          minmax(0, 1fr)
        );
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
          :deep( .card-content .card-title) {
            font-size: 6vw;
            font-weight: 500;
            line-height: initial;
            -webkit-text-stroke: 1px black;
          }
        }
        &.is-previous,
        &.on-deck {
          :deep() {
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
      :deep( .card-content .card-title) {
        transition: font-size 0.2s ease-in-out;
        font-size: 30pt;
      }
    }
  }
  .forum-app-gallery {
    display: grid;
    grid-template: 1fr / 1fr;
    position: relative;

    .forum-app-gallery-wrapper {
      display: grid;
      grid-template: fit-content(4rem) 1fr / 1fr;
      position: absolute;
      width: 100%;
      height: 100%;
      transform: translateX(0);
      transition: transform 0.5s linear;
    }

    .face-area-header {
      padding: 0;
      margin-top: 0;
      text-align: center;
      font-weight: bold;
      white-space: nowrap;
      overflow: hidden;

      i {
        color: gold;
        text-shadow: 0px 1px 4px gold;
        -webkit-text-stroke: 1px rgba(0, 0, 0, 1);
      }
    }

    .all-faces {
      display: grid;
      gap: 4px;
      grid-auto-flow: row;
      grid-template-columns: repeat(auto-fill, minmax(30%, 1fr));

      .face-box {
        aspect-ratio: 1 / 1;
        border: 1px solid rgba(0, 0, 0, 0.8);
        display: grid;

        align-items: flex-end;

        &::before {
          content: '';
          padding-top: 100%;
          display: block;
          grid-area: 1 / 1 / 2 / 2;
        }

        .face-box-label {
          --label-surface: black;
          --label-engraving: white; //#ffdd43;
          transition: font 0.1s linear;
          background-color: var(--label-surface, black);
          color: var(--label-engraving, white);
          font-family: Garamond, 'Times New Roman', Times, serif;
          font-size: clamp(10px, 1vw, 22px);
          font-weight: bold;
          text-align: center;
          margin: 5px;
          outline: 3px solid var(--label-surface, black);
          border: 1px solid var(--label-engraving, white);
          white-space: nowrap;
          overflow: hidden;
        }
      }
    }
  }

  .forum-app-footer {
    max-height: min-content;
    grid-area: forum-app-footer;
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

:deep( [contenteditable='true'] ) {
  position: relative;
  &:active,
  &:focus {
    border: none;
    outline: none;
    // text-shadow: 1px 1px 4px #aa0000aa;
    z-index: 100;
    background: rgba(255, 255, 255, 0.8);
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
    .question-text {
      user-select: none;
    }
    .remove-item-button,
    .add-item-button,
    .move-item-button {
      cursor: pointer;
      user-select: none;
    }
    .remove-item-button:hover {
      text-shadow: 1px 1px 5px red;
    }
    .add-item-button:hover {
      text-shadow: 0 0 5px green;
    }
    .move-item-button:hover {
      text-shadow: 0 0 5px blue;
    }
    .move-arrows {
      display: grid;
      user-select: none;
    }

    .items-list {
      .list-item {
        align-items: center;
        display: grid;
        grid-auto-flow: column;
        gap: 8px;
        justify-content: space-between;
      }
    }
  }

  &::backdrop {
    background-color: rgba(5, 0, 0, 0.8);
  }
}

.v-enter-active,
.v-leave-active {
  transition: opacity 0.5s ease;
}

.v-enter-from,
.v-leave-to {
  opacity: 0;
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
