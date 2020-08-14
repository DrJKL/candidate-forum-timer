<template>
  <main class="container">
    <div class="row">
      <div v-for="candidate of allCandidates" :key="candidate.name" class="col s4">
        <candidate-card :candidate="candidate"></candidate-card>
        
      </div>
    </div>
  </main>
</template>
<script lang="ts">
import { Component, Vue, Prop } from "vue-property-decorator";
import moment from "moment";
import { allCandidates as listOfCandidates } from "./candidates";
import CandidateCard from "./candidate-card.vue";

@Component({
  components: { CandidateCard },
})
export default class App extends Vue {
  allCandidates = listOfCandidates;
}
</script>
<style lang="sass" scoped>

</style>