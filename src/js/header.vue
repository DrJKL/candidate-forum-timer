<template>
  <header class="is-primary is-bold">
    <div class="">
      <div class="our-header">
        <div class="logo-img">
          <img :src="logoUrl" alt="Organization logo" />
        </div>
        <div class="header-text">
          <h1 id="event-title" class="title event-title" @keydown.enter.prevent="blurElement" @keydown.esc.prevent="blurElement">
            <span v-html="eventTitle"></span>
          </h1>
          <h2 class="subtitle">
            Hosted by
            <span id="org-title" class="org-title" @keydown.enter.prevent="blurElement" @keydown.esc.prevent="blurElement">{{ orgTitle }}</span>
          </h2>
        </div>
        <div class="spacer"></div>
        <div class="buttons box">
          <div class="global-actions">
            <a class="btn reset-button" role="button" :disabled="isShuffling" @click.prevent="resetTimers()">
              Reset
              <i class="material-icons left">restart_alt</i>
            </a>
            <a class="btn shuffle-button" role="button" :disabled="isShuffling" @click.prevent="shuffleCandidates()">
              Shuffle
              <i class="material-icons left">shuffle</i>
            </a>
          </div>
          <a class="btn gallery-mode-switch global-controls" role="button" :disabled="isShuffling" @click="updateGalleryMode()">
            {{ currentModeName }}
            <i class="material-icons right">{{ currentModeIcon }} </i>
          </a>

          <div v-if="mode === 'DEFAULT'" class="time-setters-global">
            <button href="#" class="btn" role="button" v-for="time in [60, 90, 120, 180]" :key="time" @click.prevent="setTime(time)">
              {{ time }}
              <i class="material-icons left">timer</i>
            </button>
          </div>
          <div v-else class="time-setters-budget">
            <button href="#" class="btn" role="button" @click.prevent="openTimeDialog()">
              Budget
              <i class="material-icons left">timer</i>
            </button>
          </div>

          <div class="candidate-navigation">
            <a href="#" class="btn prev-button" role="button" @click.prevent="focusChange(-1)" :disabled="!prevEnabled || null">
              Prev
              <i class="material-icons left">navigate_before</i>
            </a>
            <a href="#" class="btn next-button" role="button" @click.prevent="focusChange(1)" :disabled="!nextEnabled || null">
              Next
              <i class="material-icons right">navigate_next</i>
            </a>
          </div>
        </div>
      </div>
    </div>
    <dialog class="config-dialog" ref="timeBudgetDialog" @close="timeDialogClosed">
      <div class="card content-wrapper">
        <h1 class="header">Time Budgeting</h1>
        <div class="card-content">
          <div class="time-budget-instructions">
            <p>Set Time Budget for Candidates</p>
          </div>
          <div>Number of Candidates: {{ numberCandidates }}</div>
          <form class="time-granular">
            <fieldset>
              <legend>Total Event Time</legend>

              <label for="hour-time-input">
                <input type="number" id="hour-time-input" form="time-budget-form" min="0" max="24" v-model="totalTimeTmp.hours" @keydown.enter.prevent="blurElement" @blur="_ => rectifyTmpTime()" />
                <span>Hours</span>
              </label>
              <label for="minute-time-input">
                <input type="number" id="minute-time-input" form="time-budget-form" min="-1" max="60" v-model="totalTimeTmp.minutes" @keydown.enter.prevent="blurElement" @blur="_ => rectifyTmpTime()" @input="event => (totalTimeTmp.minutes >= 60 || totalTimeTmp.minutes < 0) && rectifyTmpTime()" />
                <span>Minutes</span>
              </label>
            </fieldset>
            <fieldset>
              <legend>Extra time for intro/transitions</legend>
              <label for="padding-minute-time-input">
                <input type="number" id="padding-minute-time-input" form="time-budget-form" min="0" max="60" v-model="totalTimeTmp.paddingMinutes" />
                <span>Padding Minutes</span>
              </label>
            </fieldset>
          </form>

          <div class="time-calculated-area">
            <div class="total-time-label">Total time: </div>
            <div class="total-time-value">{{ timeFormatter(totalTimeTmp) }}</div>
            <div class="time-per-candidate-label">Time per candidate: </div>
            <div class="time-per-candidate-value">{{ timeFormatter(secondsToTime(timePerCandidate(totalTimeTmp, numberCandidates ?? 1)), true) }}</div>
          </div>

        </div>
        <form id="time-budget-form" method="dialog" class="card-action">
          <button class="btn blue darken-4 z-depth-2 please-button" type="submit" value="please">
            Allocate Time Budget for Candidates
          </button>
          <button class="btn" type="submit" value="cancel">Cancel</button>
        </form>
      </div>
    </dialog>
  </header>

</template>
<script setup
        lang="ts">
        import { Candidate } from './candidates';
        import { EventTime, globalConfig, saveConfig, secondsToTime, timeFormatter, timePerCandidate, } from './global_config';
        import { blurElement } from './common';
        import { computed, ref, watch } from 'vue';

        interface Props {
          candidatesList?: Candidate[];
          galleryMode?: boolean;
          isShuffling?: true | null;
          focusedCandidate?: number;
          numberCandidates?: number;
        }

        import { getCurrentInstance } from 'vue';
        const instance = getCurrentInstance();

        watch(globalConfig, () => {
          instance?.proxy?.$forceUpdate();
        });

        const props = defineProps<Props>();

        const emit = defineEmits(['shuffleCandidates', 'resetTimers', 'focusChange', 'update:galleryMode']);

        function shuffleCandidates() {
          emit('shuffleCandidates');
        }

        function resetTimers() {
          emit('resetTimers');
        }

        function focusChange(num: -1 | 1) {
          emit('focusChange', num);
        }

        function updateGalleryMode() {
          emit('update:galleryMode', !props.galleryMode);
        }

        const timeBudgetDialog = ref<HTMLDialogElement>();

        const logoUrl = computed(() => globalConfig.eventInfo.logoUrl);
        const eventTitle = computed(() => globalConfig.eventInfo.eventTitle);
        const orgTitle = computed(() => globalConfig.eventInfo.orgTitle);

        const currentModeName = computed(() => props.galleryMode ? 'All Candidates' : 'Question Time!');
        const currentModeIcon = computed(() => props.galleryMode ? 'groups' : 'person');
        const mode = computed(() => globalConfig.mode);

        const totalTime = computed(() => globalConfig.eventInfo.totalTime);
        const totalTimeTmp = ref<EventTime>({ ...totalTime.value });

        function rectifyTmpTime() {
          const { hours, minutes } = totalTimeTmp.value;
          const hoursInMinutes = minutes < 0 ? -1 : Math.floor(minutes / 60);

          const remainingMinutes = minutes < 0 ? 59 : minutes % 60;
          const newTotalHours = Math.max(0, hours + hoursInMinutes);

          totalTimeTmp.value = {
            ...totalTimeTmp.value,
            hours: newTotalHours,
            minutes: remainingMinutes,

          };
        }


        function setTime(time: number) {
          props.candidatesList
            ?.map((candidate) => candidate.timer)
            .forEach((timer) => {
              timer.toggleTimer(false);
              timer.setTime(time, 's');
            });
        }

        function openTimeDialog() {
          timeBudgetDialog.value?.showModal();
        }
        function timeDialogClosed(event: Event) {
          if (
            !timeBudgetDialog.value?.returnValue ||
            timeBudgetDialog.value.returnValue === 'cancel'
          ) {
            return;
          }
          globalConfig.eventInfo.totalTime = { ...totalTimeTmp.value };
          saveConfig();
          const newTime = timePerCandidate(totalTime.value, props.numberCandidates ?? 1);
          setTime(newTime);
        }

        const prevEnabled = computed(() => props.focusedCandidate !== undefined && props.focusedCandidate > 0 || null);
        const nextEnabled = computed(() => (
          props.focusedCandidate !== undefined &&
          props.numberCandidates !== undefined &&
          props.focusedCandidate < props.numberCandidates - 1
        ) || null);


</script>
<style lang="scss"
       scoped>
      header {
        width: 100%;
      }

      .our-header {
        align-items: center;
        display: flex;
        user-select: none;

        .logo-img {
          margin-right: 1.15rem;

          img {
            height: 5em;
            width: auto;
          }
        }

        .header-text {
          flex-shrink: 1;
          padding-right: 0.5rem;
          padding-top: 0.5rem;
          transition: transform 0.5s ease-in-out;

          .title :deep(span),
          .subtitle :deep(span) {
            display: inline-block;
          }

          .title,
          .subtitle {
            line-height: 1.25;
            padding: 0;
            word-break: break-word;
          }

          .title {
            color: #363636;
            font-size: clamp(1rem, 3vw, 2rem);
            font-weight: 600;
            margin: 0 0 1.5rem;
          }

          .subtitle {
            color: #4a4a4a;
            margin: -1.25rem 0 0;
            font-size: clamp(1rem, 1vw, 1.25rem);
            font-weight: 400;
          }
        }

        .spacer {
          flex: 1;
        }

        @mixin header-button-grid {
          display: grid;
          gap: 4px;
        }

        .buttons {
          @include header-button-grid;
          align-items: center;
          border-radius: 6px;
          box-shadow: 0 0.5em 1em -0.125em rgba(10, 10, 10, 0.15),
            0 0px 0 1px rgba(10, 10, 10, 0.02);
          grid-template-rows: 1fr;
          grid-template-columns: 1fr 2fr 2fr;
          grid-auto-flow: row;
          grid-template-areas: 'global-actions time-setters-global global-controls'
            'global-actions time-setters-global candidate-navigation';
          // padding: 1.25rem 1.25rem 0.5rem;
          transition: all 2s ease-in;
          user-select: none;

          .budget-mode & {
            grid-template-columns: 1fr 1fr 1.5fr 2fr;

            grid-template-areas: 'global-actions time-setters-global global-controls candidate-navigation';
          }



          > div {
            width: 100%;
          }

          .btn {
            display: flex;
            flex-direction: row-reverse;
            justify-content: space-between;
          }

          .reset-button {
            .budget-mode & {
              display: none;
            }
          }

          .shuffle-button {
            .budget-mode & {
              grid-row: 1 / -1;
              height: unset;
              align-items: center;
            }
          }

          .time-setters-global {
            @include header-button-grid;
            grid-area: time-setters-global;
            grid-template: 1fr 1fr / 1fr 1fr;
          }

          .time-setters-budget {
            @include header-button-grid;
            grid-area: time-setters-global;
            grid-template: 1fr / 1fr;
            align-self: stretch;

            > button {
              height: unset;
              align-items: center;

              > i {
                align-self: center;
              }
            }
          }

          .gallery-mode-switch {
            grid-area: global-controls;
            min-width: min-content;
          }

          .global-actions {
            @include header-button-grid;
            grid-area: global-actions;
            width: 100%;
            height: 100%;

            .budget-mode & {
              grid-template: auto / auto;
            }

          }

          .candidate-navigation {
            @include header-button-grid;
            grid-area: candidate-navigation;
            grid-template: 1fr / 1fr 1fr;
            text-align: center;

            .current-focus-number {
              font-weight: bold;
              align-self: center;
            }
          }
        }
      }

      .time-calculated-area {
        display: grid;
        grid-template: 1fr 1fr / max-content auto;
        gap: 8px;
      }

      .time-granular {

        fieldset {
          display: flex;
          gap: 8px;
          align-items: center;

          > label {
            align-items: center;
            display: flex;
            justify-content: space-between;
            flex: 1;
            gap: 4px;
          }

          > input {
            max-width: 7ch;
          }

        }
      }


      dialog.config-dialog {
        border: 0;
        border-radius: 10px;
        padding: 0;
        box-shadow: 0px 0px 20px 10px rgba(200, 255, 200, 0.5);

        #time-budget-form {
          gap: 4px;
        }

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
    </style>
