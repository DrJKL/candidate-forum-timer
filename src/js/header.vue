<template>
  <header class="is-primary is-bold">
    <div class="">
      <div class="our-header">
        <div class="logo-img">
          <img :src="logoUrl" alt="Organization logo" />
        </div>
        <div class="header-text">
          <h1
            id="event-title"
            class="title event-title"
            @keydown.enter.prevent="blurElement"
            @keydown.esc.prevent="blurElement">
            <span v-html="eventTitle"></span>
          </h1>
          <h2 class="subtitle">
            Hosted by
            <span
              id="org-title"
              class="org-title"
              @keydown.enter.prevent="blurElement"
              @keydown.esc.prevent="blurElement"
              >{{ orgTitle }}</span
            >
          </h2>
        </div>
        <div class="spacer"></div>
        <div class="buttons box">
          <div class="global-actions">
            <a
              class="btn reset-button"
              :disabled="isShuffling"
              @click.prevent="resetTimers()">
              Reset
              <i class="material-icons left">restart_alt</i>
            </a>
            <a
              class="btn shuffle-button"
              :disabled="isShuffling"
              @click.prevent="shuffleCandidates()">
              Shuffle
              <i class="material-icons left">shuffle</i>
            </a>
          </div>
          <a
            class="btn gallery-mode-switch global-controls"
            :disabled="isShuffling"
            @click="updateGalleryMode()">
            {{ currentModeName }}
            <i class="material-icons right">{{ currentModeIcon }} </i>
          </a>

          <div class="time-setters-global">
            <a
              href="#"
              class="btn"
              v-for="time in [60, 90, 120, 180]"
              :key="time"
              @click.prevent="setTime(time)">
              {{ time }}
              <i class="material-icons left">timer</i>
            </a>
          </div>
          <div class="candidate-navigation">
            <a
              href="#"
              class="btn prev-button"
              @click.prevent="focusChange(-1)"
              :disabled="!prevEnabled || null">
              Prev
              <i class="material-icons left">navigate_before</i>
            </a>
            <a
              href="#"
              class="btn next-button"
              @click.prevent="focusChange(1)"
              :disabled="!nextEnabled || null">
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
import { Component, Vue, Prop, Emit, Watch, toNative } from 'vue-facing-decorator';
import { Candidate } from './candidates';
import { globalConfig, Config } from './global_config';
import { blurElement } from './common';

@Component({})
 class Header extends Vue {
  @Prop()
  candidatesList?: Candidate[];

  @Prop()
  galleryMode?: boolean;

  @Prop()
  isShuffling?: true|null;

  @Prop()
  focusedCandidate?: number;

  @Prop()
  numberCandidates?: number;

  config = globalConfig;
  blurElement = blurElement;

  @Emit()
  shuffleCandidates() {}

  @Emit()
  resetTimers() {}

  @Emit()
  focusChange(num: -1 | 1) {
    return num;
  }

  @Emit('update:galleryMode')
  updateGalleryMode() {
    return !this.galleryMode;
  }

  @Watch('config', { deep: true, immediate: true })
  configChanged(newConfig: Config) {
    // this.$forceUpdate();
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
    return this.galleryMode ? 'All Candidates' : 'Question Time!';
  }

  get currentModeIcon() {
    return this.galleryMode ? 'groups' : 'person';
  }

  setTime(time: number) {
    this.candidatesList
      ?.map((candidate) => candidate.timer)
      .forEach((timer) => {
        timer.toggleTimer(false);
        timer.setTime(time, 's');
      });
  }

  get prevEnabled() {
    return this.focusedCandidate !== undefined && this.focusedCandidate > 0 || null;
  }
  get nextEnabled() {
    return (
      this.focusedCandidate !== undefined &&
      this.numberCandidates !== undefined &&
      this.focusedCandidate < this.numberCandidates - 1
    ) || null;
  }
}
export default toNative(Header);
</script>
<style lang="scss" scoped>
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

    .title :deep( span),
    .subtitle :deep( span) {
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
      font-size: clamp(32px, 10vw, 2rem);
      font-weight: 600;
      margin: 0 0 1.5rem;
    }
    .subtitle {
      color: #4a4a4a;
      margin: -1.25rem 0 0;
      font-size: 1.25rem;
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
    grid-template: 1fr / 1fr 2fr 2fr;
    grid-auto-flow: row;
    grid-template-areas:
      'global-actions time-setters-global global-controls'
      'global-actions time-setters-global candidate-navigation';
    padding: 1.25rem 1.25rem 0.5rem;
    transition: all 1s ease-in-out;
    user-select: none;

    > div {
      width: 100%;
    }
    .btn {
      display: flex;
      flex-direction: row-reverse;
      justify-content: space-between;
    }

    .time-setters-global {
      @include header-button-grid;
      grid-area: time-setters-global;
      grid-template: 1fr 1fr / 1fr 1fr;
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
