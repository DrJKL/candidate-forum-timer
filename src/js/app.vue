<template>
  <main class="container">
    <div class="row">
      <div v-for="candidate of allCandidates" :key="candidate.name" class="col s4">
        <div class="candidate-card card blue-grey z-depth-2">
          <div class="card-content white-text">
            <div class="card-title">{{candidate.name}}</div>
            <div>
              {{candidate.timer.getTimeLeft()}} {{candidate.timer.isTimeUp() ? 'over' :
              'remaining'}}
            </div>
            <div class="spacer"></div>
            <div>
              <div class="progress" v-bind:class="{'time-up': candidate.timer.isTimeUp()}">
                <div
                  class="determinate"
                  v-bind:style="{width: candidate.timer.getProgressPercent()}"
                ></div>
              </div>
            </div>
          </div>
          <div class="card-action">
            <a
              href="#"
              class="btn startstop"
              v-on:click.prevent="candidate.timer.toggleTimer();"
            >{{candidate.timer.isRunning() ? 'Stop': 'Start'}} Timer</a>
            <div class="spacer"></div>

            <a href="#" class="btn" v-on:click.prevent="candidate.timer.addTime()">
              <i class="material-icons">add</i>
            </a>
            <a href="#" class="btn" v-on:click.prevent="candidate.timer.removeTime()">
              <i class="material-icons">remove</i>
            </a>
          </div>
        </div>
      </div>
    </div>
  </main>
</template>
<script lang="ts">
import { Component, Vue, Prop } from "vue-property-decorator";
import moment from "moment";
import { allCandidates as listOfCandidates } from "./candidates";

@Component({})
export default class App extends Vue {
  allCandidates = listOfCandidates;
}
</script>
<style lang="sass" scoped>

</style>