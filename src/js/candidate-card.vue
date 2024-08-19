<template>
  <div class="candidate-card card z-depth-2" :class="timeClass">
    <div class="card-content" :style="{ '--progress-color': timeColorHue }">
      <div class="card-title">
        <span @dblclick.prevent="clickCandidateName(true)" @click.prevent="clickCandidateName(false)" @click.shift="candidate.restoreRebuttal()" @click.ctrl="minimizeCandidate()">
          {{ candidate.name }}
        </span>
        <span class="rebuttals-badge" :title="`${candidate.rebuttalsLeft()} Rebuttal${candidate.rebuttalsLeft() == 1 ? '' : 's'} Left`">
          <TransitionGroup name="list">
            <button class="btn-floating btn-small token-button" v-for="n in candidate.rebuttalsLeft()" :key="n" @click="rebuttalClicked(candidate)">
              <i class="material-icons">forum</i>
            </button>
          </TransitionGroup>
        </span>
        <!--{{/* <a href="#" class="btn-floating btn-flat" @click.prevent="minimizeCandidate()">
          <i class="material-icons">minimize</i>
        </a>  */}}-->
      </div>
      <collapse-transition>
        <div class="time-section">
          <div class="progress" :class="{ 'time-up': candidate.timer.isTimeUp }">
            <div class="time-left">
              {{ candidate.timer.getTimeLeft() }}
              {{ candidate.timer.isTimeUp ? 'over' : '' }}
            </div>
            <div class="progress-bar" :class="{
              determinate: !candidate.timer.isTimeUp,
              indeterminate: candidate.timer.isTimeUp,
            }" :style="{ width: `${progressValue}%` }">
            </div>
            <div class="time-left">
              {{ candidate.timer.getTimeLeft() }}
              {{ candidate.timer.isTimeUp ? 'over' : '' }}
            </div>
          </div>
        </div>
      </collapse-transition>
    </div>
    <div class="card-action">
      <div class="action-row">
        <a href="#" class="btn startstop" role="button" @click.prevent="candidate.timer.toggleTimer()">{{ candidate.timer.isRunning() ? 'Stop' : 'Start' }}</a>

        <a href="#" class="btn resetTime reset-time-button" role="button" @click.prevent="candidate.timer.resetTime()">
          <i class="material-icons">restore</i>
        </a>

        <div class="inc-dec-buttons">
          <a href="#" class="btn add-button" role="button" @click.prevent="event => candidate.timer.addTime(event.shiftKey)">
            <i class=" material-icons">add</i>
          </a>
          <a href="#" class="btn remove-button" role="button" @click.prevent="event => candidate.timer.removeTime(event.shiftKey)">
            <i class="material-icons">remove</i>
          </a>
        </div>
      </div>
      <div class="action-row time-setters">
        <a href="#" class="btn" role="button" @click.prevent="candidate.timer.setTime(0, 's')">0</a>
        <a href="#" class="btn" role="button" @click.prevent="candidate.timer.setTime(30, 's')">30</a>
        <a href="#" class="btn" role="button" @click.prevent="candidate.timer.setTime(60, 's')">60</a>
        <a href="#" class="btn" role="button" @click.prevent="candidate.timer.setTime(90, 's')">90</a>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">

import { computed } from 'vue';
import { Candidate } from './candidates';

import CollapseTransition from '@ivanv/vue-collapse-transition/src/CollapseTransition.vue';

const props = defineProps({
  candidate: {
    type: Candidate,
    required: true,
  }
});
const emit = defineEmits(['minimizeCandidate', 'clickCandidateName', 'useRebuttal']);

function minimizeCandidate() {
  emit('minimizeCandidate');
}

function clickCandidateName(double: boolean) {
  emit('clickCandidateName', double);
}

function rebuttalClicked(candidate: Candidate) {
  emit('useRebuttal', candidate);
}

const progressPercent = computed(() => {
  return props.candidate.timer.progressPercent;
});

const progressValue = computed(() => {
  if (props.candidate.timer.isTimeUp) {
    return props.candidate.timer.isRunning() ? undefined : 100;
  }
  return progressPercent.value;
});

const timeClass = computed(() => {
  const percent = progressPercent.value;
  return {
    'plenty-time': percent >= 50,
    'running-out': percent < 50 && percent >= 25,
    'almost-done': percent < 25,
  };
});

const timeColorHue = computed(() => {
  return Math.round(lerp(0, 120, progressPercent.value / 100));
});

function lerp(min: number, max: number, progress: number) {
  return (1 - progress) * min + progress * max;
}

</script>

<style lang="scss" scoped>
.candidate-card {
  --progress-color-hue: 120;
  --progress-color-sat: 80;
  --progress-color-lit: 50;
  background-color: #607d8b;
  container-name: candidate-card;
  color: #ffffff;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  outline: 0 solid;
  position: relative;
  transition: all 0.25s linear, outline-color 0.5s linear;
  width: 100%;

  &.plenty-time {
    border-color: green;
    outline-color: green;
    --shadow-color: green;
  }

  &.running-out {
    border-color: yellow;
    outline-color: yellow;
    --shadow-color: yellow;
  }

  &.almost-done {
    border-color: red;
    outline-color: red;
    --shadow-color: red;
  }

  .card-title {
    align-items: center;
    display: flex;

    font-size: 2.167rem;
    font-weight: 500;
    min-height: 3rem;
    justify-content: space-between;
    overflow: auto;
    padding-inline-start: .2rem;
    user-select: none;
    white-space: nowrap;
    word-wrap: normal;

    > * {
      flex: 0 1 auto;
      // overflow: hidden;
          }
        }

        .card-content {
          display: flex;
          flex-direction: column;
          padding: 6px;
          padding-bottom: 2px;
        }

        .time-section {
          .time-left {
            user-select: none;
            font-size: 2.5rem;
            text-align: center;
            color: white;
            z-index: 100;
            text-shadow: 1px 1px 5px black;
          }

          .progress-bar {
            z-index: 75;
          }

          .progress {
            display: grid;
            grid-template: auto / auto;
            border-radius: 5px;
            height: 4rem;
            padding: 0;
            margin: 0;

            .determinate {
              overflow: hidden;
              // background-color: hsl(
              //   var(--progress-color, 120),
              //   calc(var(--progress-color-sat, 100) * 1%),
              //   calc(var(--progress-color-lit, 50) * 1%)
              // );
            }

            &.time-up {
              background-color: pink;

              .indeterminate {
                background-color: #ff3344;
              }
            }
          }
        }

        .card-action {
          display: flex;
          flex-direction: row;
          gap: 6px;
          padding-inline: 0;
          padding-block-start: 2px;
          padding-block-end: 6px;

          .action-row {
            flex: 1;
            display: flex;
            justify-content: space-between;

            div {
              flex: 1 1 auto;
            }

            a {
              margin: 4px;
            }

            .startstop {
              flex: 1 1 100%;
            }

            .reset-time-button {
              .budget-mode & {
                display: none;
              }
            }

            .inc-dec-buttons {
              display: none;
              justify-content: space-between;

              .budget-mode & {
                display: flex;
              }

              a {
                flex: 0 1 1em;
                width: calc(50% - 8px);
              }
            }
          }

          .time-setters {
            display: flex;
            flex-direction: row;
            flex-wrap: wrap;
            display: none; // These should be unnecessary for normal use.

            a {
              flex: 1 1 calc(50% - 8px);
              width: calc(50% - 8px);
            }
          }
        }
      }

      .rebuttals-badge {
        align-items: baseline;
        display: inline-flex;
        gap: 4px;
        height: 1em;
        position: absolute;
        right: 8px;
        top: 8px;
      }

      .list-enter-active,
      .list-leave-active {
        transition: all 0.5s ease;
      }

      .list-enter-from,
      .list-leave-to {
        opacity: 0;
        width: 0;
      }
    
</style>
