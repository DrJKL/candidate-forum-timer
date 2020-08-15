<template>
  <div class="candidate-card card blue-grey z-depth-2">
    <div class="card-content white-text">
      <div class="card-title">{{candidate.name}}</div>
      <div>
        {{candidate.timer.getTimeLeft()}} {{candidate.timer.isTimeUp ? 'over' :
        'remaining'}}
      </div>
      <div class="spacer"></div>
      <div v-bind:class="{'time-up': candidate.timer.isTimeUp}">
        <b-progress
          :value="candidate.timer.isTimeUp ? undefined : progressPercent"
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
          v-on:click.prevent="candidate.timer.toggleTimer();"
        >{{candidate.timer.isRunning() ? 'Stop': 'Start'}}</a>
        <div class="inc-dec-buttons">
          <a href="#" class="btn" v-on:click.prevent="candidate.timer.addTime()">
            <i class="material-icons">add</i>
          </a>
          <a href="#" class="btn" v-on:click.prevent="candidate.timer.removeTime()">
            <i class="material-icons">remove</i>
          </a>
        </div>
      </div>
      <div class="action-row time-setters">
        <a href="#" class="btn" v-on:click.prevent="candidate.timer.setTime(0,'s')">0</a>
        <a href="#" class="btn" v-on:click.prevent="candidate.timer.setTime(30,'s')">30</a>
        <a href="#" class="btn" v-on:click.prevent="candidate.timer.setTime(60,'s')">60</a>
        <a href="#" class="btn" v-on:click.prevent="candidate.timer.setTime(90,'s')">90</a>
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
.candidate-card {
  .card-content {
    display: flex;
    flex-direction: column;
  }
  .card-title {
    overflow: hidden;
    word-wrap: normal;
    white-space: nowrap;
  }
  .card-action {
    display: flex;
    flex-direction: column;
    gap: 6px;

    .action-row {
      flex: 1;
      display: flex;
      justify-content: space-between;
      
      div {
        flex: 0 1 auto;
      }
      .inc-dec-buttons {
        display:flex;
        a {
          flex: 0 1 1em;
        }
      }
    }
  }
}

.startstop.btn {
  width: 9em;
}
</style>