<template>
  <div class="app-container" :class="{
    'gallery-mode': galleryMode,
    'presentation-mode': !galleryMode,
    'immersive-mode': immersiveMode,
    'budget-mode': mode === 'BUDGET',
  'hide-all-candidates': hideAllCandidates,
  'running-autosizer': !!isSizing,
  [`_${visibleCandidates.length}-candidates`]: true,
}" :style="{
  '--candidate-columns': candidateColumns,
}">
    <app-header class="forum-app-header" :focused-candidate="focusManager.focusedCandidate" :number-candidates="numberOfCandidates" :gallery-mode="galleryMode" @update:gallery-mode="galleryMode = $event" :is-shuffling="isShuffling" :candidates-list="allCandidates" @shuffle-candidates="shuffleCandidates()" @reset-timers="resetTimers()" @focus-change="
      focusManager.changeFocus($event, numberOfCandidates - 1)
      "></app-header>
    <div class="slow-down-indicator" :class="{ 'show-indicator': slowDownIndicator }">
      <img class="double-snail" src="../assets/double_snail.png" alt="A snail calmly riding another, larger, snail" />
      SLOW DOWN
      <img class="slurtle" src="../assets/slurtle.png" alt="A sloth turtle demonstrating patience" />
    </div>
    <collapse-transition>
      <div class="all-questions-container" ref="allQuestionsContainer">
        <div v-for="(question, index) in questions" :key="index" ref="allQuestionElements" @click.shift="flipQuestion" class="question-wrap show-preamble" :class="{
          'current-question': index === questionIdx,
          'next-question': index === (questionIdx + 1) % questions.length,
          'previous-question': index === ((questionIdx + questions.length) - 1) % questions.length,
        }" :data-replicated="question">
          <div class="forum-app-question" @dblclick="setQuestionEditable($event, question)" @keydown.esc.prevent="blurElement" @keydown.enter.prevent="blurElement">
            {{ question.displayText }}
          </div>
          <div class="forum-app-question forum-app-question-preamble" @dblclick="setQuestionEditable($event, question, true)" @keydown.esc.prevent="blurElement" @keydown.enter.prevent="blurElement">
            {{ question.preamble }}
          </div>
          <div class="topic-label" v-if="question.topic !== ''">
            <!--  <i class="material-icons prefix">topic</i> -->
            <span>
              {{ question.topic }}
            </span>
          </div>
        </div>
      </div>
    </collapse-transition>
    <main class="forum-app-candidates" :class="{
      'gallery-mode': galleryMode,
    }">
      <div class="candidates-container">
        <transition-group name="squish" tag="div" class="transition-container">
          <div v-for="(candidate, index) of visibleCandidates" :key="candidate.name" class="squish-item">
            <candidate-card :candidate="candidate" :class="getCardClasses(index)" @click-candidate-name="clickedCandidate(candidate, index, $event)" @minimize-candidate="minimizeCandidate(candidate)" @use-rebuttal="reorderCandidate(candidate)"></candidate-card>
          </div>
        </transition-group>
      </div>
      <div class="forum-app-gallery">
        <div class="forum-app-gallery-wrapper">
          <!--
          <h3 class="face-area-header">
            <i class="material-icons">star</i> The Stars Of The Show!
            <i class="material-icons">star</i>
          </h3>
        -->
          <div class="all-faces">
            <!--
            <div class="face-box z-depth-1">
              <div class="face-box-label z-depth-1">Moderator</div>
            </div>
            -->
            <div class="face-box z-depth-1" v-for="(candidate, index) of visibleCandidatesUnshuffled" :class="{
              'focused-candidate': candidate.name === focusedCandidateName,
            }">
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
        <button class="waves-effect waves-teal btn-flat" role="button" @click.prevent="showCandidateDialog">
          Candidates
        </button>
        <button class="waves-effect waves-teal btn-flat" role="button" @click.prevent="showLogoDialog">
          Logo
        </button>
        <button class="waves-effect waves-teal btn-flat" role="button" @click.prevent="setTitleEditable">
          Title
        </button>
        <button class="waves-effect waves-teal btn-flat" role="button" @click.prevent="setOrgEditable">
          Org
        </button>
        <button class="waves-effect waves-teal btn-flat" role="button" @click.prevent="dumpQuestions" title="See Current Questions">
          <i class="material-icons">question_mark</i>
        </button>
        <button class="waves-effect waves-teal btn-flat" role="button" @click.prevent="showQuestionsDialog" title="Edit Questions">
          <i class="material-icons">quiz</i>
        </button>
        <button class="waves-effect waves-teal btn-flat" role="button" @click.prevent="incrementQuestion(-1)" title="Previous Question">
          <i class="material-icons">navigate_before</i>
        </button>
        <button class="waves-effect waves-teal btn-flat" role="button" @click.prevent="incrementQuestion(1)" title="Next Question">
          <i class="material-icons">navigate_next</i>
        </button>
        <button class="waves-effect waves-teal btn-flat" role="button" @click.prevent="toggleImmersive" title="Next Question">
          Immersive?
        </button>

        <button class="waves-effect waves-teal btn-flat red-text" role="button" @click.prevent="resetConfig">
          Reset All
        </button>

        <button class="btn-flat" @click.prevent="changeMode">Change Mode</button>

        <span class="sizing-indicator">Resizing text...</span>
      </div>
      <collapse-transition>
        <div class="time-out-container-container" :class="{ 'has-minimized': hasMinimizedCandidates }">
          <div class="time-out-container">
            <a class="chip is-primary minimized-candidate" v-for="candidate of minimizedCandidates" :key="candidate.name" @click.prevent="minimizeCandidate(candidate)">
              {{ candidate.name }}
            </a>
          </div>
        </div>
      </collapse-transition>

      <button class="waves-effect waves-teal btn-flat" :disabled="slowDownIndicator" role="button" @click.prevent="slowDownPlease" title="SLOW DOWN PLEASE">
        <i class="material-symbols-outlined">relax</i>
      </button>
      <button class="waves-effect waves-teal btn-flat" role="button" @click.prevent="hideCandidates" title="Hide Candidates">
        <i class="material-icons">crop_free</i>
      </button>
      <button class="waves-effect waves-teal btn-flat" role="button" @click.prevent="questionChanged" title="Force resize question">
        <i class="material-icons">sync</i>
      </button>

      <span>{{ questionIdx + 1 }} / {{ numberOfQuestions }}</span>

      <span class="attribution-label">
        <img class="copyleft-icon" src="../assets/Copyleft.svg" alt="Copyleft icon"> Alex Brown for the
        <a href="https://mvmha.com">MVMHA</a> (v2024)
      </span>
    </footer>
    <dialog class="config-dialog" ref="resetConfigDialog" @close="resetDialogClosed">
      <div class="card content-wrapper">
        <h1 class="header">Resetting Config!</h1>
        <p class="card-content">
          Are you sure you want to <b>Reset</b> all fields? This action cannot
          be undone.
        </p>
        <form method="dialog" class="card-action">
          <button class="btn red darken-4 z-depth-2 please-button" type="submit" value="reset_please">
            RESET IT ALL
          </button>
          <button class="btn" type="submit" value="reset_cancel">Cancel</button>
        </form>
      </div>
    </dialog>
    <dialog class="config-dialog" ref="logoConfigDialog" @close="logoDialogClosed">
      <div class="card content-wrapper">
        <h1 class="header">Set New Logo</h1>
        <div class="card-content">
          <div class="logo-instructions">
            <p>Input url for logo</p>
            <img v-if="tempImg" :src="tempImg" alt="preview for the logo" />
          </div>
          <input type="text" id="new-logo-input" form="logo-form" v-model="tempImg" />
        </div>
        <form id="logo-form" method="dialog" class="card-action">
          <button class="btn blue darken-4 z-depth-2 please-button" type="submit" :value="tempImg">
            Set New Logo
          </button>
          <button class="btn" type="submit" value="cancel">Cancel</button>
        </form>
      </div>
    </dialog>
    <dialog class="config-dialog" ref="candidatesConfigDialog" @close="candidatesDialogClosed">
      <div class="card content-wrapper">
        <h1 class="header">Set New Candidates</h1>
        <div class="card-content">
          <p>List the candidates, comma separated</p>
          <input type="text" id="new-candidates-input" form="candidates-form" placeholder="e.g. Joe, Jan, Jill, Jazz" v-model="tempCandidates" />
          <ul class="items-list">
            <li v-for="candidate in toCandidates(tempCandidates)" :key="candidate" class="candidate-name list-item">
              {{ candidate }}
            </li>
          </ul>
        </div>
        <form id="candidates-form" method="dialog" class="card-action">
          <button class="btn blue darken-4 z-depth-2 please-button" type="submit" :value="tempCandidates">
            Set New Candidates
          </button>
          <button class="btn" type="submit" value="cancel">Cancel</button>
        </form>
      </div>
    </dialog>
    <dialog class="config-dialog" ref="questionsConfigDialog" @close="questionsDialogClosed">
      <div class="card content-wrapper">
        <h1 class="header">Set New Questions</h1>
        <div class="card-content">
          <div>
            <div class="input-field">
              <input type="text" id="new-questions-input-topic" name="new-questions-input-topic" form="questions-form" placeholder="Zoology" v-model="tempQuestion.topic" @keydown.enter.prevent="addNewQuestion(tempQuestion)" />
              <label for="new-questions-input-topic">
                Topic
              </label>
            </div>
            <div class="input-field">
              <textarea type="text" rows="4" class="questions-form-textarea materialize-textarea" id="new-questions-input-preamble" name="new-questions-input-preamble" form="questions-form" placeholder="A woodchuck is a type of animal..." v-model="tempQuestion.preamble" @keydown.exact.enter.prevent="addNewQuestion(tempQuestion)" />
              <label for="new-questions-input-preamble">
                Preamble
              </label>
            </div>
            <div class="input-field">
              <textarea type="text" rows="2" class="questions-form-textarea materialize-textarea" id="new-questions-input" form="questions-form" placeholder="How much wood would a woodchuck chuck...?" v-model="tempQuestion.displayText" @keydown.exact.enter.prevent="addNewQuestion(tempQuestion)" />
              <label for="new-questions-input">
                Question
              </label>
            </div>
            <button class="add-item-button btn" @click.prevent="addNewQuestion(tempQuestion)">
              <i class="material-icons left">add</i>
              Add Question
            </button>
          </div>

          <ul class="items-list questions-items-list">
            <li class="header-labels list-item">
              <div></div>
              <div>Topic</div>
              <div>Question</div>
              <div></div>
              <div></div>
              <div></div>
            </li>
            <transition-group name="squish">
              <li v-for="(question, index) in tempQuestions" :key="question.displayText" :value="index" class="question-text list-item">
                <div class="move-arrows">
                  <i class="material-icons move-item-button" :hidden="index === 0" @click.prevent="moveQuestion(index, -1)">arrow_drop_up
                  </i>
                  <i class="material-icons move-item-button" :hidden="index >= numberOfQuestions - 1" @click.prevent="moveQuestion(index, 1)">
                    arrow_drop_down
                  </i>
                </div>
                <span class="questions-list-item-content">
                  <span class="question-list-item-content-topic">{{ question.topic }}</span>
                  <span class="question-list-item-content-display" style="white-space: pre-wrap;">
                    {{ question.displayText }}
                  </span>
                  <i class="preamble-hover material-icons" :title="question.preamble">info</i>
                </span>
                <i class="material-icons edit-item-button" @click.prevent="editQuestion(index, question)">
                  edit
                </i>
                <i class="material-icons remove-item-button" @click.prevent="removeQuestion(index, question)">
                  remove_circle_outline
                </i>
              </li>
            </transition-group>
          </ul>
        </div>
        <form id="questions-form" method="dialog" class="card-action">
          <input type="file" accept="application/json, text/plain" id="question-file-input" ref="questionFileInput" class="hide" @change="questionInputChanged">
          <button class="btn blue darken-4 z-depth-2 please-button" type="submit" value="new_questions_please">
            Set New Questions List
          </button>
          <button class="btn blue darken-2 z-depth-2" @click.prevent="loadQuestions()">Load Questions from File</button>
          <button class="btn blue darken-2 z-depth-2" @click.prevent="downloadQuestions(tempQuestions)">Save Questions to File</button>
          <button class="btn" type="submit" value="cancel">Cancel</button>
        </form>
      </div>
    </dialog>
  </div>
</template>
<script setup lang="ts">
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
  saveConfig,
  timePerCandidate,
  Question,
  downloadQuestions,
  Questions,
} from './global_config';
import { addUniqueItem } from './list_management';
import M from 'materialize-css';
import { ref, watch, computed, onMounted, reactive, Ref } from 'vue';
import { z } from 'zod';

const allCandidates = ref<Array<Candidate>>([]);
const allCandidatesUnshuffled = ref<Array<Candidate>>([]);
const candidateColumns = ref(3);
const galleryMode = ref(true);
const immersiveMode = computed(() => globalConfig.eventInfo.immersiveOn);
const editMode = ref(false);
const hideAllCandidates = ref(false);
const slowDownIndicator = ref(false);
const isShuffling = ref<true | null>(null);
const isSizing = ref<true | null>(null);
const questionIdx = computed(() => globalConfig.eventInfo.questionIdx);
const tempImg = ref('');
const tempCandidates = ref('');
const tempQuestions = ref<Question[]>([]);
const tempQuestion = ref<Question>({
  topic: '',
  preamble: '',
  displayText: '',
});
const focusManager = reactive(new FocusManager());

const resetConfigDialog = ref<HTMLDialogElement>();
const logoConfigDialog = ref<HTMLDialogElement>();
const candidatesConfigDialog = ref<HTMLDialogElement>();
const questionsConfigDialog = ref<HTMLDialogElement>();
const allQuestionElements = ref<HTMLElement[]>();
const allQuestionsContainer = ref<HTMLElement>();
const questionFileInput = ref<HTMLInputElement>();

const questions = computed(() => globalConfig.eventInfo.questions);
const visibleCandidates = computed<Array<Candidate>>(() => allCandidates.value.filter((candidate) => !candidate.isMinimized));
const visibleCandidatesUnshuffled = computed(() => allCandidatesUnshuffled.value.filter(
  (candidate) => !candidate.isMinimized
));
const minimizedCandidates = computed(() => allCandidates.value.filter((candidate) => candidate.isMinimized));
const numberOfCandidates = computed(() => visibleCandidates.value.length);
const hasMinimizedCandidates = computed(() => minimizedCandidates.value.length > 0);
const numberOfQuestions = computed(() => questions.value.length);
const mode = computed(() => globalConfig.eventInfo.mode);
const noCandidates = computed(() => visibleCandidates.value.length === 0);

const focusedCandidateName = computed(() => {
  const focusedIndex = focusManager.focusedCandidate;
  const focusedCandidate = visibleCandidates.value[focusedIndex];
  return focusedCandidate?.name ?? '';
});

async function slowDownPlease() {
  slowDownIndicator.value = true;
  setTimeout(() => {
    slowDownIndicator.value = false;
  }, 3_000);
}

async function hideCandidates() {
  hideAllCandidates.value = !hideAllCandidates.value;
}

function toggleImmersive() {
  globalConfig.updateInfo({ immersiveOn: !immersiveMode.value });
}

async function questionChanged() {
  if (isSizing.value) {
    console.log('Already Resizing');
    return;
  }
  isSizing.value = true;
  requestAnimationFrame(async () => {
    await Promise.all((allQuestionElements.value ?? []).map(async (questionElement) => {
      if (questionElement) {
        await autosizeText(questionElement, 10);
        await autosizeText(questionElement, -1);
        await autosizeText(questionElement, 10, 'preamble');
        await autosizeText(questionElement, -1, 'preamble');
      }
    }));
    isSizing.value = null;
  });
}

function getCardClasses(index: number) {
  return {
    'focused-item': focusManager.isFocused(index),
    'is-previous': focusManager.isPrev(index),
    'on-deck': focusManager.isNext(index),
  };
}

function toCandidates(commaSeparated: string) {
  return commaSeparated
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);
}

async function shuffleCandidates() {
  const wasGallery = galleryMode.value;

  isShuffling.value = true;
  if (!wasGallery) {
    galleryMode.value = true;
    await new Promise((resolve) => setTimeout(resolve, 700));
  }
  allCandidates.value = shuffle(allCandidates.value);

  await new Promise((resolve) => setTimeout(resolve, 100));
  focusManager.focusedCandidate = 0;

  await new Promise((resolve) => setTimeout(resolve, 1000));
  isShuffling.value = null;
  galleryMode.value = wasGallery;
}

async function resetTimers() {
  for (const candidate of allCandidates.value) {
    candidate.timer.pause();
    candidate.timer.resetTime();
  }
}


function clickedCandidate(candidate: Candidate, index: number, $event: boolean) {
  console.log(`${candidate}`, index, $event);
  if ($event) {
    focusManager.changeFocusAbsolute(index, numberOfCandidates.value - 1);
  }
}

function minimizeCandidate(candidate: Candidate) {
  candidate.toggleMinimized();
  focusManager.checkFocus(numberOfCandidates.value - 1);
}

function reorderCandidate(candidate: Candidate) {
  const candidatePosition = allCandidates.value.indexOf(candidate);
  console.log(focusManager.focusedCandidate, candidatePosition, allCandidates.value);
  if (candidatePosition > focusManager.focusedCandidate + 1) {
    const newCandidateOrder = [...allCandidates.value];
    newCandidateOrder.splice(candidatePosition, 1);
    newCandidateOrder.splice(focusManager.focusedCandidate + 1, 0, candidate);
    candidate.useRebuttal();
    allCandidates.value = newCandidateOrder;
  }
  focusManager.checkFocus(numberOfCandidates.value);
}

function incrementQuestion(dir = 1) {
  const numQuestions = numberOfQuestions.value;

  const newIdx = (questionIdx.value + dir + numQuestions) % numQuestions;
  globalConfig.updateInfo({ questionIdx: newIdx });
  console.log('increment', dir, numQuestions, questionIdx);
}

function dumpQuestions() {
  const questionsString = questions.value.map(q => q.displayText).join('\n---\n');
  console.log(questionsString);
  M.toast({ html: questionsString, displayLength: 1_000 });
}

function questionEditDone(event: Event) {
  if (!(event.target instanceof HTMLElement)) {
    return;
  }
  const newQuestion = { topic: '', preamble: '', displayText: event.target.innerText };
  globalConfig.addQuestion(newQuestion);
}

function showCandidateDialog() {
  tempCandidates.value = allCandidates.value
    .map((candidate) => candidate.name)
    .join(', ');
  if (candidatesConfigDialog.value) {
    candidatesConfigDialog.value.showModal();
  }
}
function showLogoDialog() {
  tempImg.value = globalConfig.eventInfo.logoUrl;
  if (logoConfigDialog.value) {
    logoConfigDialog.value.showModal();
  }
}
function showQuestionsDialog() {
  tempQuestion.value = {
    topic: '',
    preamble: '',
    displayText: '',
  };
  tempQuestions.value = [...questions.value];
  if (questionsConfigDialog.value) {
    questionsConfigDialog.value.showModal();
  }
}

function addNewQuestion(newQuestion: Question) {
  tempQuestions.value = addUniqueItem(newQuestion, tempQuestions.value);
  tempQuestion.value = {
    topic: '',
    preamble: '',
    displayText: '',
  };
}

function editQuestion(index: number, question: Question) {
  tempQuestion.value = question;
  removeQuestion(index, question);
}
function removeQuestion(index: number, question: Question) {
  tempQuestions.value.splice(index, 1);
}
function moveQuestion(index: number, dir: -1 | 1) {
  const [question] = tempQuestions.value.splice(index, 1);
  tempQuestions.value.splice(index + dir, 0, question);
}

function flipQuestion(event: MouseEvent) {
  const { currentTarget } = event;
  if (!(currentTarget instanceof HTMLElement)) {
    return;
  }
  currentTarget.classList.toggle('show-preamble');
}


function setQuestionEditable(event: MouseEvent, question: Question, settingPreamble = false) {
  if (!editMode) {
    return;
  }
  if (!(event.target instanceof HTMLElement)) {
    console.log('......', event);
    return;
  }
  const { preamble, displayText, topic } = question;

  setEditableElement(event.target, (newValue) => {
    if (settingPreamble) {
      globalConfig.addQuestion({ topic, preamble: newValue, displayText });
      return;
    }
    globalConfig.addQuestion({ topic, preamble, displayText: newValue });
  });
}

function setTitleEditable() {
  const element = document.getElementById('event-title');
  if (!(element instanceof HTMLElement)) {
    return;
  }
  setEditableElement(element, (newValue) => {
    globalConfig.updateEvent(newValue);
  });
}

function setOrgEditable() {
  const element = document.getElementById('org-title');
  if (!(element instanceof HTMLElement)) {
    return;
  }
  setEditableElement(element, (newValue) => {
    globalConfig.updateOrg(newValue);
  });
}

function resetDialogClosed(event: Event) {
  if (!resetConfigDialog.value?.returnValue) {
    return;
  }
  if (resetConfigDialog.value?.returnValue !== 'reset_please') {
    console.log(
      'Not actually resetting, dialog value:',
      resetConfigDialog.value.returnValue,
      '\nProbably need to be more polite about it.'
    );
    return;
  }
  actuallyResetConfig();
  resetCandidates();
  M.toast({ html: 'Options Reset!' });
}
function resetConfig() {
  if (resetConfigDialog.value) {
    resetConfigDialog.value.showModal();
  }
}

function changeMode() {
  globalConfig.changeMode(globalConfig.mode === 'DEFAULT' ? 'BUDGET' : 'DEFAULT');
  saveConfig();
}

function logoDialogClosed(event: Event) {
  if (
    !logoConfigDialog.value?.returnValue ||
    logoConfigDialog.value.returnValue === 'cancel'
  ) {
    return;
  }
  globalConfig.updateLogo(logoConfigDialog.value.returnValue);
}
function candidatesDialogClosed(event: Event) {
  if (
    !candidatesConfigDialog.value?.returnValue ||
    candidatesConfigDialog.value.returnValue === 'cancel'
  ) {
    return;
  }
  setCandidates(toCandidates(candidatesConfigDialog.value.returnValue));
}
function questionsDialogClosed(event: Event) {
  if (
    !questionsConfigDialog.value?.returnValue ||
    questionsConfigDialog.value.returnValue === 'cancel'
  ) {
    return;
  }
  globalConfig.updateInfo({ questionIdx: 0 });
  globalConfig.eventInfo.questions = [...tempQuestions.value];
  saveConfig();
}

function loadQuestions() {
  if (!questionFileInput.value) {
    console.error('No File input to click...');
    return;
  }
  questionFileInput.value.click();
}

function questionInputChanged() {
  const file = questionFileInput.value?.files?.[0];
  if (!file) {
    console.log('No file to try to load');
    return;
  }
  if (file.type !== 'application/json') {
    console.error(`Has to be a JSON file, was ${file.type}`);
    return;
  }
  if (file.size > 1_000_000_000) {
    console.error(`That's too big ${file.size}`);
    return;
  }

  const reader = new FileReader();
  reader.onload = (e) => {
    console.log('Reading file...', e);
    const questionsText = e.target?.result;
    if (!questionsText || typeof questionsText !== 'string') {
      console.error('Failed to read questions File');
      return;
    }
    const parsedQuestionsMaybe = Questions.safeParse(JSON.parse(questionsText));
    if (!parsedQuestionsMaybe.success) {
      console.error('Failed to parse questions', parsedQuestionsMaybe);
      return;
    }
    const { data } = parsedQuestionsMaybe;
    console.log('Got these questions...', data);

    tempQuestions.value = data;

  };
  reader.readAsText(file);
}

function setCandidates(candidateNames: string[]) {
  globalConfig.eventInfo.candidatesList = candidateNames;
  resetCandidates();
}


function resetCandidates() {
  allCandidates.value = globalConfig.eventInfo.candidatesList.map(
    (name): Candidate => {
      const candidate = new Candidate(name);
      if (globalConfig.mode === 'BUDGET') {
        candidate.timer.setTime(timePerCandidate(globalConfig.eventInfo.totalTime, globalConfig.eventInfo.candidatesList.length), 's');
      }
      return candidate;
    }
  );
  allCandidatesUnshuffled.value = [...allCandidates.value];
}

function howManyColumns(howManyCandidates: number) {
  switch (true) {
    case howManyCandidates === 1:
      return 1;
    case howManyCandidates % 2 === 0 && howManyCandidates < 5:
      return 2;
    default:
      return 3;
  }
}


watch(allCandidates, () => {
  candidateColumns.value = howManyColumns(visibleCandidates.value.length);
}, { immediate: true, deep: true });

watch([noCandidates, questions, hideAllCandidates], async () => {
  requestAnimationFrame(async () => {
    await questionChanged();
  });
}, { immediate: true, flush: 'post' });

const resizeTimeout = ref<number>();
const resizeObserver = new ResizeObserver(() => {
  if (resizeTimeout.value) {
    cancelAnimationFrame(resizeTimeout.value);
    resizeTimeout.value = undefined;
  }

  resizeTimeout.value = requestAnimationFrame(async () => {
    await questionChanged();
  });
});

watch(allQuestionElements, (newValue, oldValue, onCleanup) => {
  console.log('~~~~~');
  // resizeObserver.disconnect();
  for (const question of newValue ?? []) {
    // resizeObserver.observe(question);
  }
  onCleanup(() => {
    resizeObserver.disconnect();
  });
});


onMounted(async () => {
  restoreConfig();
  resetCandidates();
  // await questionChanged();
  const questionsSection = allQuestionsContainer.value;
  if (questionsSection) {
    resizeObserver.observe(questionsSection);
  }
  window.addEventListener('resize', () => {
    questionChanged();
  });

});

</script>
<style scoped lang="scss">
:global(#app) {
  width: 100%;
  height: 100%;
}

.app-container {
  --candidate-columns: 3;
  display: grid;
  flex: 1;
  gap: 8px;
  grid-auto-flow: row;
  grid-template-columns: 1fr;
  grid-template-rows:
    fit-content(5vh) auto 600px fit-content(5vh);
  height: 100%;
  max-height: 100%;
  overflow: hidden;
  transition: grid-template-rows 0.5s ease-in;

  grid-template-areas:
    'forum-app-header'
    'forum-app-question'
    'forum-app-candidates'
    'forum-app-footer';

  &._0-candidates,
  &.hide-all-candidates {
    grid-template-rows:
      fit-content(5vh) auto 0 fit-content(5vh);
  }

  .forum-app-header {
    max-height: min-content;
    grid-area: forum-app-header;
    box-shadow: 0 1px 6px 7px rgba(0, 0, 0, 0.1);
    padding-inline: 16px;
  }

  .all-questions-container {
    grid-area: forum-app-question;
    display: grid;
    place-content: stretch;
    grid-template: auto / auto;
    padding-inline: 16px;


  }

  .question-wrap {
    --question-size-test: 20px;
    --preamble-size-test: 20px;
    container-type: size;

    display: grid;
    grid-area: 1 / 1 / -1 / -1;
    grid-template-columns: 1fr;
    place-content: stretch;
    position: relative;
    transition: unset;

    .immersive-mode & {
      /* grid-template-columns: auto 100px; */
    }

    .forum-app-question {
      /* left: 50%; */
      /* position: absolute; */
      /* top: 50%; */
      /* transform-origin: center; */
      /* transform: translateX(-500%) translateY(-50%); */
      /* width: calc(100% - 8px); */
      align-items: center;
      background: white;
      border-radius: 5px;
      border: 1px solid black;
      display: grid;
      font-size: var(--question-size-test);
      font-weight: bold;
      grid-area: 1 / 1 / -1 / -1;
      line-height: 1;
      padding-bottom: 2rem;
      padding-inline: 16px;
      /* padding: .2rem; */
      text-align: left;
      transition: transform .5s ease-in-out, opacity .5s ease-in-out, z-index .5s ease-in-out;
      user-select: none;
      white-space: pre-wrap;

      &.forum-app-question-preamble {
        // text-align: left;
        font-size: var(--preamble-size-test);
        z-index: var(--preamble-z, 8);
        /* opacity: var(--preamble-scale, 0); */
        transform: scaleY(var(--preamble-scale, -1));
      }

      &:not(.forum-app-question-preamble) {
        z-index: var(--question-z, 8);
        /* opacity: var(--question-scale, 0); */
        transform: scaleY(var(--question-scale, -1));
      }

    }

    --preamble-scale: initial;
    --preamble-z: initial;
    --question-scale: 1;
    --question-z: 11;

    &.show-preamble {
      --preamble-scale: 1;
      --preamble-z: 11;
      --question-scale: initial;
      --question-z: initial;
    }

    .topic-label {
      font-weight: 700;
      align-content: center;
      display: flex;
      grid-area: 1 / 1 / -1 / -1;
      place-self: end start;
      background: white;
      z-index: 12;
      border-radius: 5px;
      padding-inline: 2px;
      box-shadow: -3px 3px 10px 0px black;
      // position: absolute;
      // left: -5px;
      // bottom: -10px;
      // transform: translateX(-.25rem) translateY(.5rem);
    }

    &.current-question {
      animation: slide-in-left 1s forwards;
    }

    &:not(.current-question) {
      animation: slide-out-left 1s forwards;
    }

    &.show-preamble {
      /* color: red; */
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

    display: grid;
    grid-template-columns: calc(100% - 16px) 0%;
    gap: 16px;
    padding-inline: 16px;
    // overflow-y: auto;
    transition: transform .2s linear, grid-template-columns .2s linear;

    .forum-app-gallery {
      /* width: 0; */
      transform: scaleX(0);
      overflow: hidden;
    }

    @at-root .app-container.immersive-mode .forum-app-candidates {
      grid-template-columns: auto 550px;

      .forum-app-gallery {
        /* width: 100%; */
        transform: scaleX(1);
        overflow: visible;

        /* .forum-app-gallery-wrapper {
                transform: translateX(110%);
              } */
      }
    }

    .candidates-container {
      // place-content: center stretch;
      place-items: stretch;
      align-content: baseline;
    }

    &.gallery-mode {
      .candidates-container .transition-container {
        display: grid;
        grid-template-columns: repeat((var(--candidate-columns)),
            minmax(0, 1fr));
        grid-auto-rows: max-content;
        /* height: 100%; */
        align-items: center;

        > div,
        > candidate-card {
          transition: all 0.2s ease-in-out;
          margin: 0 0.5em;
          visibility: visible;
          flex-basis: 30vw;
        }
      }
    }

    /* Presentation Mode */
    &:not(.gallery-mode) {
      .candidates-container {
        display: grid;
        place-items: center stretch;
      }

      .candidate-card {
        display: none;

        &.focused-item,
        &.is-previous,
        &.on-deck {
          display: flex;
        }

        &.focused-item {
          :deep(.card-content .card-title) {
            place-content: center;
            font-size: 7.2rem;
            font-weight: 500;
            line-height: initial;
            text-shadow: 1px 1px 3px black;
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
      :deep(.card-content .card-title) {
        transition: font-size 0.2s ease-in-out;
        font-size: 2.5rem;
      }
    }
  }

  .forum-app-gallery {
    display: grid;
    grid-template: 1fr / 1fr;
    position: relative;

    .forum-app-gallery-wrapper {
      display: grid;
      grid-template: 1fr / 1fr;
      position: relative;
      height: 100%;
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
      margin-block: auto;

      .face-box {
        aspect-ratio: 1 / 1;
        border: 1px solid rgba(0, 0, 0, 0.8);
        display: grid;

        align-items: flex-end;
        transition: border-width 0.1s linear;

        &.focused-candidate {
          border-width: 3px;
        }

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
          font-size: clamp(0.625rem, 1vw, 1.375rem);
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
    position: relative;
    z-index: 1000;
    background-color: white;
    padding-inline: 16px;
    box-shadow: 0 -1px 3px 2px rgba(0, 0, 0, 0.1);
  }
}

.focused-item {
  box-shadow: 0px 0px 10px 5px var(--shadow-color, transparent);
  z-index: 100;
}

.slow-down-indicator {
  backdrop-filter: blur(10px);
  background-color: rgba(255, 0, 0, 0.6);
  border-radius: 1ch;
  font-size: 8rem;
  left: 50%;
  opacity: 0;
  padding-inline: 1ch;
  position: fixed;
  pointer-events: none;
  text-align: center;
  top: 50%;
  transform: translate(-50%, -50%);
  transition: opacity 1s ease-in;
  width: max-content;
  z-index: 1001;

  &.show-indicator {
    opacity: 1;
    transition: opacity 1s ease-out;
  }

  .slurtle,
  .double-snail {
    height: auto;
    width: 1em;
  }
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

:deep([contenteditable='true']) {
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
    height: max(500px, 90vh);
    width: max(500px, 70vw);
    display: flex;
    flex-direction: column;

    > .header {
      font-variant: small-caps;
      margin-top: 0;
      flex: 0 1 auto;
    }

    .card-content {
      padding: 2rem;
      flex: 1;
      overflow: hidden;
      display: flex;
      flex-direction: column;
    }

    .card-action {
      display: flex;
      justify-content: space-between;
      gap: 4px;
      flex: 0 1 auto;
    }

    .please-button {
      font-weight: 700;
    }

    .question-text {
      user-select: none;
    }

    .questions-list-item-content {
      display: contents;
      flex: 1;
      justify-content: space-between;
      gap: 2ch;

      .question-list-item-content-display {
        flex: 1;
      }

      .question-list-item-content-topic {
        flex: 0 1 auto;
      }
    }

    .remove-item-button,
    .edit-item-button,
    .add-item-button,
    .move-item-button {
      cursor: pointer;
      user-select: none;
    }

    .remove-item-button:hover {
      text-shadow: 1px 1px 5px red;
    }

    .edit-item-button:hover {
      text-shadow: 1px 1px 5px purple;
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
      overflow: auto;
      padding-right: 2ch;

      &.questions-items-list {
        display: grid;
        grid-template-columns: repeat(2, min-content) 1fr repeat(3, min-content);
        grid-auto-flow: row;

        .header-labels {
          font-weight: bold;
        }
        .list-item {
          display: grid;
          grid-column: span 6;
          grid-template-columns: subgrid;
          gap: 8px;
          justify-content: space-between;
          border-bottom: 1px dashed black;
        }

      }

      .list-item {
        align-items: flex-start;
        display: grid;
        grid-template-columns: subgrid;
        gap: 8px;
        justify-content: space-between;
        border-bottom: 1px dashed black;
      }
    }
  }

  &::backdrop {
    background-color: rgba(5, 0, 0, 0.8);
  }
}

.questions-form-textarea {
  resize: vertical;
}

.attribution-label {
  overflow: hidden;

  .copyleft-icon {
    width: auto;
    height: 1em;
    vertical-align: middle;
  }
}

.sizing-indicator {
  visibility: hidden;

  .running-autosizer & {
    visibility: visible;
  }

  position: absolute;
  right: 0;
  border-radius: 5px;
  color:white;
  background: black;
  padding-inline: 5px;
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

@keyframes slide-in-left {
  from {
    transform: translateX(-200%);
  }

  to {
    transform: translateX(0);
  }
}

@keyframes slide-out-left {
  to {
    transform: translateX(-200%);
  }

  from {
    transform: translateX(0);
  }
}
</style>
