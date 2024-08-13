<template>
  <div class="app-container" :class="{
    'gallery-mode': galleryMode,
    'presentation-mode': !galleryMode,
    'immersive-mode': immersiveMode,
    'budget-mode': mode === 'BUDGET',
  [`_${visibleCandidates.length}-candidates`]: true,
}" :style="{
  '--candidate-columns': candidateColumns,
}">
    <app-header class="forum-app-header" :focused-candidate="focusManager.focusedCandidate" :number-candidates="numberOfCandidates" :gallery-mode="galleryMode" @update:gallery-mode="galleryMode = $event" :is-shuffling="isShuffling" :candidates-list="allCandidates" @shuffle-candidates="shuffleCandidates()" @reset-timers="resetTimers()" @focus-change="
      focusManager.changeFocus($event, numberOfCandidates - 1)
      "></app-header>
    <collapse-transition>
      <div ref="currentQuestionElement" class="question-wrap" :data-replicated="currentQuestion">
        <div v-show="currentQuestion" class="current-question forum-app-question" @dblclick="setQuestionEditable" @keydown.esc.prevent="blurElement" @keydown.enter.prevent="blurElement">
          {{ currentQuestion }}
        </div>
      </div>
    </collapse-transition>
    <main class="forum-app-candidates" :class="{
      'gallery-mode': galleryMode,
    }">
      <div class="candidates-container">
        <transition-group name="squish" tag="div" class="transition-container">
          <div v-for="(candidate, index) of visibleCandidates" :key="candidate.name" class="squish-item">
            <candidate-card :candidate="candidate" :class="getCardClasses(index)" @click-candidate-name="clickedCandidate(candidate, index, $event)" @minimize-candidate="
              minimizeCandidate(candidate)
              "></candidate-card>
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
        <i class="material-icons" title="Event Settings">change_circle</i>
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
        <button class="waves-effect waves-teal btn-flat" role="button" @click.prevent="immersiveMode = !immersiveMode" title="Next Question">
          Immersive?
        </button>

        <button class="waves-effect waves-teal btn-flat red-text" role="button" @click.prevent="resetConfig">
          Reset All
        </button>

        <button class="btn-flat" @click.prevent="changeMode">Change Mode</button>

        <Transition>
          <span class="sizing-indicator" v-if="isSizing">Resizing text...</span>
        </Transition>
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

      <span class="attribution-label">
        By Alex Brown for the
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
          <p>Setup Questions in advance</p>
          <div class="input-field">
            <input type="text" id="new-questions-input" form="questions-form" placeholder="How much wood would a woodchuck chuck...?" v-model="tempQuestion" @keydown.enter.prevent="addNewQuestion(tempQuestion)" />
            <i class="material-icons prefix add-item-button" @click.prevent="addNewQuestion(tempQuestion)">add_circle</i>
          </div>

          <ul class="items-list">
            <transition-group name="squish" tag="li" class="transition-container">
              <li v-for="(question, index) in tempQuestions" :key="question" :value="index" class="question-text list-item">
                <div class="move-arrows">
                  <i class="material-icons move-item-button" :hidden="index === 0" @click.prevent="moveQuestion(index, -1)">arrow_drop_up
                  </i>
                  <i class="material-icons move-item-button" :hidden="index >= numberOfQuestions - 1" @click.prevent="moveQuestion(index, 1)">
                    arrow_drop_down
                  </i>
                </div>
                {{ question }}
                <i class="material-icons remove-item-button" @click.prevent="removeQuestion(index, question)">
                  remove_circle_outline
                </i>
              </li>
            </transition-group>
          </ul>
        </div>
        <form id="questions-form" method="dialog" class="card-action">
          <button class="btn blue darken-4 z-depth-2 please-button" type="submit" value="new_questions_please">
            Set New Questions List
          </button>
          <button class="btn" type="submit" value="cancel">Cancel</button>
        </form>
      </div>
    </dialog>
  </div>
</template>
<script setup
        lang="ts">
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
        } from './global_config';
        import { addUniqueItem } from './list_management';
        import M from 'materialize-css';
        import { ref, watch, computed, onMounted, reactive, Ref } from 'vue';

        const allCandidates = ref<Array<Candidate>>([]);
        const allCandidatesUnshuffled = ref<Array<Candidate>>([]);
        const candidateColumns = ref(3);
        const galleryMode = ref(true);
        const immersiveMode = ref(false);
        const isShuffling = ref<true | null>(null);
        const isSizing = ref<true | null>(null);
        const questionIdx = ref(0);
        const tempImg = ref('');
        const tempCandidates = ref('');
        const tempQuestions = ref<string[]>([]);
        const tempQuestion = ref('');
        const focusManager = reactive(new FocusManager());

        const resetConfigDialog = ref<HTMLDialogElement>();
        const logoConfigDialog = ref<HTMLDialogElement>();
        const candidatesConfigDialog = ref<HTMLDialogElement>();
        const questionsConfigDialog = ref<HTMLDialogElement>();
        const currentQuestionElement = ref<HTMLElement>();

        const currentQuestion = computed(() => globalConfig.eventInfo.questions[questionIdx.value]);
        const visibleCandidates = computed<Array<Candidate>>(() => allCandidates.value.filter((candidate) => !candidate.isMinimized));
        const visibleCandidatesUnshuffled = computed(() => allCandidatesUnshuffled.value.filter(
          (candidate) => !candidate.isMinimized
        ));
        const minimizedCandidates = computed(() => allCandidates.value.filter((candidate) => candidate.isMinimized));
        const numberOfCandidates = computed(() => visibleCandidates.value.length);
        const hasMinimizedCandidates = computed(() => minimizedCandidates.value.length > 0);
        const numberOfQuestions = computed(() => globalConfig.eventInfo.questions.length);
        const mode = computed(() => globalConfig.eventInfo.mode);
        const noCandidates = computed(() => visibleCandidates.value.length === 0);

        const focusedCandidateName = computed(() => {
          const focusedIndex = focusManager.focusedCandidate;
          const focusedCandidate = visibleCandidates.value[focusedIndex];
          return focusedCandidate?.name ?? '';
        });

        async function questionChanged() {
          console.log('currentQuestionChanged', currentQuestion);
          isSizing.value = true;
          if (currentQuestionElement.value) {
            await autosizeText(currentQuestionElement.value, 10);
            await autosizeText(currentQuestionElement.value, -1);
          }
          isSizing.value = null;
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

        function incrementQuestion(dir = 1) {
          const numQuestions = globalConfig.eventInfo.questions.length;
          questionIdx.value += dir + numQuestions;
          questionIdx.value = questionIdx.value % numQuestions;
          console.log('increment', dir, numQuestions, questionIdx);
        }

        function dumpQuestions() {
          const questionsString = globalConfig.eventInfo.questions.join('\n');
          console.log(questionsString);
          M.toast({ html: questionsString });
        }

        function questionEditDone(event: Event) {
          if (!(event.target instanceof HTMLElement)) {
            return;
          }
          const newQuestion = event.target.innerText;
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
          tempQuestion.value = '';
          tempQuestions.value = [...globalConfig.eventInfo.questions];
          if (questionsConfigDialog.value) {
            questionsConfigDialog.value.showModal();
          }
        }

        function addNewQuestion(newQuestion: string) {
          tempQuestions.value = addUniqueItem(newQuestion, tempQuestions.value);
          tempQuestion.value = '';
        }

        function removeQuestion(index: number, question: string) {
          tempQuestions.value.splice(index, 1);
        }
        function moveQuestion(index: number, dir: -1 | 1) {
          const [question] = tempQuestions.value.splice(index, 1);
          tempQuestions.value.splice(index + dir, 0, question);
        }

        function setQuestionEditable(event: MouseEvent) {
          if (!(event.target instanceof HTMLElement)) {
            return;
          }
          setEditableElement(event.target, (newValue) => {
            globalConfig.addQuestion(newValue);
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
          questionIdx.value = 0;
          globalConfig.eventInfo.questions = [...tempQuestions.value];
          saveConfig();
        }

        function setCandidates(candidateNames: string[]) {
          globalConfig.eventInfo.candidatesList = candidateNames;
          resetCandidates();
        }


        function resetCandidates() {
          allCandidates.value = globalConfig.eventInfo.candidatesList.map(
            (name) => {
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

        watch([currentQuestion, immersiveMode, noCandidates], async () => {
          await questionChanged();
        }, { immediate: true });

        onMounted(async () => {
          restoreConfig();
          resetCandidates();
          questionChanged();
          window.addEventListener('resize', () => {
            questionChanged();
          });

        });

</script>
<style scoped
       lang="scss">

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
          fit-content(5vh) auto fit-content(65vh) fit-content(5vh);
        height: 100%;
        max-height: 100%;
        overflow: hidden;
        padding: 0 16px;

        grid-template-areas:
          'forum-app-header'
          'forum-app-question'
          'forum-app-candidates'
          'forum-app-footer';

        &._0-candidates {
          grid-template-rows:
            fit-content(5vh) minmax(10em, 1fr) 0 fit-content(5vh);
        }

        .forum-app-header {
          max-height: min-content;
          grid-area: forum-app-header;
        }

        .question-wrap {
          --question-size-test: 200px;
          container-type: size;

          display: grid;
          grid-area: forum-app-question;
          position: relative;
          transition: unset;

          .immersive-mode & {
            grid-template-columns: auto 100px;
          }

          .forum-app-question {
            align-items: center;
            display: grid;
            font-size: var(--question-size-test);
            font-weight: bold;
            grid-area: 1 / 1 / 2 / 2;
            line-height: 1;
            position: absolute;
            left: 50%;
            top: 50%;
            transition: unset;
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

          display: grid;
          grid-template-columns: calc(100% - 16px) 0%;
          gap: 16px;
          overflow-y: auto;
          transition: transform .2s linear, grid-template-columns .2s linear;

          .forum-app-gallery {
            /* width: 0; */
            transform: scaleX(0);
            overflow: hidden;
          }

          @at-root .app-container.immersive-mode .forum-app-candidates {
            grid-template-columns: 70% calc(30% - 16px);

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
            place-content: center stretch;
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
              transition: border-width 0.5s ease-in-out;

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
        }
      }

      .focused-item {
        box-shadow: 0px 0px 10px 5px var(--shadow-color, transparent);
        z-index: 100;
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

      .attribution-label {
        overflow: hidden;
      }

      .sizing-indicator {
        position: absolute;
        right: 0;
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
