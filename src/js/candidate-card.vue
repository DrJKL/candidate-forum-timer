<template>
  <div class="candidate-card card z-depth-2" :class="timeClass">
    <div class="card-content">
      <div class="card-title">
        <span>{{ candidate.name }}</span>
        <a
          href="#"
          class="btn-floating btn-flat"
          @click.prevent="minimizeCandidate()">
          <i class="material-icons">minimize</i>
        </a>
      </div>
      <collapse-transition>
        <div class="time-section">
          <div class="time-left">
            {{ candidate.timer.getTimeLeft() }}
            {{ candidate.timer.isTimeUp ? 'over' : 'remaining' }}
          </div>
          <div
            class="progress"
            :class="{ 'time-up': candidate.timer.isTimeUp }">
            <div
              :class="{
                determinate: !candidate.timer.isTimeUp,
                indeterminate: candidate.timer.isTimeUp,
              }"
              :style="{ width: `${progressValue}%` }"></div>
          </div>
        </div>
      </collapse-transition>
    </div>
    <div class="card-action">
      <div class="action-row">
        <a
          href="#"
          class="btn startstop"
          @click.prevent="candidate.timer.toggleTimer()"
          >{{ candidate.timer.isRunning() ? 'Stop' : 'Start' }}</a
        >

        <a
          href="#"
          class="btn resetTime"
          @click.prevent="candidate.timer.resetTime()">
          <i class="material-icons">restore</i>
        </a>

        <div class="inc-dec-buttons">
          <a href="#" class="btn" @click.prevent="candidate.timer.addTime()">
            <i class="material-icons">add</i>
          </a>
          <a href="#" class="btn" @click.prevent="candidate.timer.removeTime()">
            <i class="material-icons">remove</i>
          </a>
        </div>
      </div>
      <div class="action-row time-setters">
        <a href="#" class="btn" @click.prevent="candidate.timer.setTime(0, 's')"
          >0</a
        >
        <a
          href="#"
          class="btn"
          @click.prevent="candidate.timer.setTime(30, 's')"
          >30</a
        >
        <a
          href="#"
          class="btn"
          @click.prevent="candidate.timer.setTime(60, 's')"
          >60</a
        >
        <a
          href="#"
          class="btn"
          @click.prevent="candidate.timer.setTime(90, 's')"
          >90</a
        >
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Vue, Prop, Emit } from 'vue-property-decorator';
import { Candidate } from './candidates';

import { CollapseTransition } from '@ivanv/vue-collapse-transition';

@Component({ components: { CollapseTransition } })
export default class CandidateCard extends Vue {
  @Prop({ required: true })
  candidate!: Candidate;

  @Emit()
  minimizeCandidate() {}

  get progressPercent() {
    return this.candidate.timer.progressPercent;
  }

  get progressValue() {
    if (this.candidate.timer.isTimeUp) {
      return this.candidate.timer.isRunning() ? undefined : 100;
    }
    return this.progressPercent;
  }

  get timeClass() {
    return {
      'plenty-time': this.progressPercent >= 50,
      'running-out': this.progressPercent < 50 && this.progressPercent >= 25,
      'almost-done': this.progressPercent < 25,
    };
  }
}
</script>

<style lang="scss" scoped>
.candidate-card {
  background-color: #607d8b;
  color: #ffffff;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  transition: all 0.25s linear;
  width: 100%;
  .card-title {
    display: flex;
    font-size: 26pt;
    font-weight: 500;
    justify-content: space-between;
    user-select: none;
    white-space: nowrap;
    word-wrap: normal;
    > * {
      flex: 0 1 auto;
    }
  }
  .card-content {
    display: flex;
    flex-direction: column;
    padding-bottom: 0.5rem;
  }
  .time-section {
    .time-left {
      user-select: none;
      font-size: 30pt;
    }
    .time-up.progress {
      background-color: pink;
      .indeterminate {
        background-color: #ff3344;
      }
    }
    .progress {
      border-radius: 5px;
      height: 2rem;
      margin-bottom: 0.5rem;
    }
  }
  &.plenty-time {
    border-color: green;
    outline-color: green;
  }
  &.running-out {
    border-color: yellow;
    outline-color: yellow;
  }
  &.almost-done {
    border-color: red;
    outline-color: red;
  }

  .card-action {
    display: flex;
    flex-direction: row;
    gap: 6px;

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
      .inc-dec-buttons {
        display: flex;
        justify-content: space-between;
        display: none;
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
</style>
