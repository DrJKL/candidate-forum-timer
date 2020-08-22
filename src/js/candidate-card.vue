<template>
  <div class="candidate-card card z-depth-2" :class="timeClass">
    <div class="card-content">
      <div class="card-title">
        <span>{{candidate.name}}</span>
        <a href="#" class="btn-floating btn-flat" @click.prevent="minimizeCandidate()">
          <i class="material-icons">minimize</i>
        </a>
      </div>
      <div class="time-left">
        {{candidate.timer.getTimeLeft()}} {{candidate.timer.isTimeUp ? 'over' :
        'remaining'}}
      </div>
      <div class="spacer"></div>
      <div :class="{'time-up': candidate.timer.isTimeUp}">
        <b-progress
          :value="progressValue"
          size="is-large"
          :type="candidate.timer.isTimeUp ? 'is-danger' : 'is-info'"
        ></b-progress>
      </div>
    </div>
    <div class="card-action">
      <div class="action-row">
        <a
          href="#"
          class="btn startstop"
          @click.prevent="candidate.timer.toggleTimer();"
        >{{candidate.timer.isRunning() ? 'Stop': 'Start'}}</a>
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
        <a href="#" class="btn" @click.prevent="candidate.timer.setTime(0,'s')">0</a>
        <a href="#" class="btn" @click.prevent="candidate.timer.setTime(30,'s')">30</a>
        <a href="#" class="btn" @click.prevent="candidate.timer.setTime(60,'s')">60</a>
        <a href="#" class="btn" @click.prevent="candidate.timer.setTime(90,'s')">90</a>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Vue, Prop, Emit } from "vue-property-decorator";
import { Candidate } from "./candidates";

@Component({})
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
    }
  }
}
</script>

<style lang="scss" scoped>
.candidate-card {
  background-color: #607d8b;
  color: #ffffff;
  width: 100%;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  .card-content {
    display: flex;
    flex-direction: column;
  }
  .card-title {
    word-wrap: normal;
    white-space: nowrap;
    font-size: 26pt;
    display: flex;
    justify-content: space-between;
    > * {
      flex: 0 1 auto;
    }
  }
  .time-left {
    font-size: 20pt;
  }
  &.plenty-time {
    outline-color: green;
  }
  &.running-out {
    outline-color: yellow;
  }
  &.almost-done {
    outline-color: red; 
  }

  .card-action {
    display: flex;
    flex-direction: row;
    gap: 6px;

    .action-row {
      flex: 1;
      display: flex;
      flex-direction: column;
      justify-content: space-between;

      div {
        flex: 0 1 auto;
      }
      a {
        margin: 4px;
      }
      .inc-dec-buttons {
        display: flex;
        justify-content: space-between;
        a {
          flex: 0 1 1em;
        }
      }
    }
    .time-setters {
      display: flex;
      flex-direction: row;
      flex-wrap: wrap;
      a {
        flex: 1 1 calc(50% - 8px);
        width: calc(50% - 8px);
      }
    }
  }
}
</style>