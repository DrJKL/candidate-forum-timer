<template>
  <div class="candidate-card card blue-grey z-depth-2">
    <div class="card-content white-text">
      <div class="card-title">{{candidate.name}}</div>
      <div>
        {{candidate.timer.getTimeLeft()}} {{candidate.timer.isTimeUp ? 'over' :
        'remaining'}}
      </div>
      <div class="spacer"></div>
      <div>
        <b-progress :value="progressPercent" size="is-large" type="is-info"></b-progress>
      </div>
    </div>
    <div class="card-action rows">
      <a
        href="#"
        class="btn startstop col"
        v-on:click.prevent="candidate.timer.toggleTimer();"
      >{{candidate.timer.isRunning() ? 'Stop': 'Start'}}</a>
      <div class="spacer col"></div>
      <div class="col">
      <a href="#" class="btn" v-on:click.prevent="candidate.timer.addTime()">
        <i class="material-icons">add</i>
      </a>
      <a href="#" class="btn" v-on:click.prevent="candidate.timer.removeTime()">
        <i class="material-icons">remove</i>
      </a>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Vue, Prop } from "vue-property-decorator";
import { Candidate } from "./candidates";

@Component({})
export default class CandidateCard extends Vue {
  @Prop({ required: true })
  candidate!: Candidate;

  get progressPercent() {
    return this.candidate.timer.progressPercent;
  }
}
</script>

<style lang="scss" scoped>
.card-content .timer {
    width: 100%;
    height: 1em;
    background-color: blanchedalmond;
}

.candidate-card .card-content {
    display: flex;
    flex-direction: column;
}

.candidate-card .card-title {
    overflow: hidden;
    word-wrap: normal;
    white-space: nowrap;
}

.candidate-card .card-action {
    display: flex;
}
.candidate-card .card-action > * {
    flex: 0 1 auto;
}
.candidate-card .card-action > .spacer {
    flex-grow: 1;
}

.time-up.progress {
    background-color: red;
}

.candidate-card .progress {
    height: 8px;
}

.startstop.btn {
    width: 9em;
}
</style>