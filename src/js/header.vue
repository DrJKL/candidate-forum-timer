<template>
  <header class="is-primary is-bold">
    <div class="">
      <div class="our-header">
        <div class="logo-img">
          <img :src="logoUrl" alt="Organization logo" />
        </div>
        <div class="header-text">
          <h1 class="title" v-html="eventTitle">
            <!-- Unknown Event -->
          </h1>
          <h2 class="subtitle">
            Hosted by
            <span>{{ orgTitle }}</span>
          </h2>
        </div>
        <div class="spacer"></div>
        <div class="buttons box">
          <div class="global-controls">
            <a
              class="btn shuffle-button"
              :disabled="isShuffling"
              @click.prevent="shuffleCandidates()"
            >
              Shuffle
              <i class="material-icons left">shuffle</i>
            </a>
            <div class="controls-spacer"></div>
            <div class="switch gallery-mode-switch">
              <label>
                <input
                  type="checkbox"
                  :disabled="isShuffling"
                  v-model="galleryMode"
                  @click="updateGalleryMode()"
                />
                <span class="lever"></span>
                {{ currentModeName }}
              </label>
            </div>
          </div>

          <div class="time-setters-global">
            <a
              href="#"
              class="btn"
              v-for="time in [30, 60, 90, 120]"
              :key="time"
              @click.prevent="setTime(time)"
            >
              {{ time }}
              <i class="material-icons left">timer</i>
            </a>
          </div>
          <div class="candidate-navigation">
            <a
              href="#"
              class="btn prev-button"
              @click.prevent="focusChange(-1)"
              :disabled="!prevEnabled"
            >
              Prev
              <i class="material-icons left">navigate_before</i>
            </a>
            <span class="current-focus-number">{{ focusedCandidate + 1 }}</span>
            <a
              href="#"
              class="btn next-button"
              @click.prevent="focusChange(1)"
              :disabled="!nextEnabled"
            >
              Next
              <i class="material-icons right">navigate_next</i>
            </a>
          </div>
        </div>
      </div>
    </div>
  </header>
</template>
<script lang="ts">
import { Component, Vue, Prop, Emit, Watch } from "vue-property-decorator";
import moment from "moment";
import { Candidate } from "./candidates";
import { globalConfig, Config } from "./global_config";

@Component({})
export default class Header extends Vue {
  @Prop()
  candidatesList?: Candidate[];

  @Prop()
  galleryMode?: boolean;

  @Prop()
  isShuffling?: boolean;

  @Prop()
  focusedCandidate?: number;

  @Prop()
  numberCandidates?: number;

  config = globalConfig;

  @Emit()
  shuffleCandidates() {}

  @Emit()
  focusChange(num: -1 | 1) {
    return num;
  }

  @Emit("update:galleryMode")
  updateGalleryMode() {
    return !this.galleryMode;
  }

  @Watch("config", { deep: true, immediate: true })
  configChanged(newConfig: Config) {
    this.$forceUpdate();
  }

  get logoUrl() {
    return globalConfig.eventInfo.logoUrl;
  }
  get eventTitle() {
    return globalConfig.eventInfo.eventTitle;
  }
  get orgTitle() {
    return globalConfig.eventInfo.orgTitle;
  }
  get currentModeName() {
    return this.galleryMode ? "All Candidates" : "Question Time!";
  }

  setTime(time: number) {
    this.candidatesList
      ?.map((candidate) => candidate.timer)
      .forEach((timer) => {
        timer.toggleTimer(false);
        timer.setTime(time, "s");
      });
  }

  get prevEnabled() {
    return this.focusedCandidate !== undefined && this.focusedCandidate > 0;
  }
  get nextEnabled() {
    return (
      this.focusedCandidate !== undefined &&
      this.numberCandidates !== undefined &&
      this.focusedCandidate < this.numberCandidates - 1
    );
  }
}
</script>
<style lang="scss" scoped>
header {
  width: 100%;
}

.our-header {
  display: flex;
  align-items: center;
  > div {
    flex: 0 0 auto;
  }
  > div.logo-img {
    transition: transform 0.5s ease-in-out;
    margin-right: 2em;
    img {
      height: 5em;
      width: auto;
    }
  }
  .header-text {
    transition: transform 0.5s ease-in-out;
    flex-shrink: 1;
    padding-right: 1em;
  }
  .spacer {
    flex: 1;
  }
  .buttons {
    display: grid;
    grid-template: repeat(3, 1fr) / 1fr;
    gap: 4px;
    user-select: none;
    padding-bottom: 0.5rem;
    > div {
      flex: 0 1 auto;
      // margin-bottom: 8px;
      display: flex;
      justify-content: space-between;
      width: 100%;
      > * {
        flex: 0 1 auto;
        margin-right: 4px;
      }
    }
    .current-focus-number {
      font-weight: bold;
      align-self: center;
    }
    .global-controls {
      display: grid;
      grid-template: 1fr / 2fr 1fr 2fr;
      .gallery-mode-switch {
        label {
          width: 100%;
          text-align: right;
        }
      }
    }
  }
  .title /deep/ span,
  .subtitle /deep/ span {
    display: inline-block;
  }
}
</style>