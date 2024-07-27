import { Candidate } from './candidates';
import moment from 'moment';
import { addUniqueItem } from './list_management';
import { reactive } from 'vue';

const images = import.meta.glob('../assets/*.png', {
  import: 'default',
  query: '?url',
  eager: true,
});

export declare interface EventInfo {
  logoUrl: string;
  orgTitle: string;
  eventTitle: string;
  candidatesList: readonly string[];
  questions: string[];
}

export class Config {
  timeLimitTotal = moment.duration(90, 's');
  timeGranularity = 100;
  timeDelta = moment.duration(1, 's');
  eventInfo: EventInfo = {
    //
    logoUrl: `${images['../assets/just_homes_logo.png']}`,
    // images['lwv-logo'],
    //
    orgTitle: 'Mountain View Mobile Home Alliance',
    // "the League of Women Voters",
    //
    eventTitle: `<span>2024</span>
            <span>Mountain View</span>
            <span>City Council</span>
            <span>Candidate Forum</span>`,
    candidatesList: [
      'Chris Clark',
      'Devon Conley',
      'Emily Ann Ramos',
      'Erik Poicon',
      'IdaRose Sylvester',
      'José Gutiérrez',
      'John McAlister',
      'Nicholas Hargis',
      'Pat Showalter',
    ],
    questions: [
      'What is your favorite color?',
      'What is your favorite animal?',
      'What steps can the City do in the next 4 years to alleviate the harms of our Housing Crisis?',
    ],
  };
  get candidates() {
    return this.eventInfo.candidatesList.map((name) => new Candidate(name));
  }
  set candidates(newCandidates: Candidate[]) {
    this.eventInfo.candidatesList = newCandidates.map(
      (candidate) => candidate.name
    );
  }

  addQuestion(newQuestion: string) {
    const uniqueQuestions = addUniqueItem(
      newQuestion,
      this.eventInfo.questions
    );
    this.eventInfo.questions = uniqueQuestions;
    saveConfig();
  }
  updateOrg(orgTitle: string) {
    this.updateInfo({ orgTitle });
  }
  updateEvent(eventTitle: string) {
    this.updateInfo({ eventTitle });
  }
  updateLogo(logoUrl: string) {
    this.updateInfo({ logoUrl });
  }

  updateInfo(newInfo: Partial<EventInfo>) {
    this.eventInfo = { ...this.eventInfo, ...newInfo };
    saveConfig();
  }
}
export const globalConfig = reactive(new Config());

const CONFIG_KEY = 'saved_candidate_config';

export function restoreConfig() {
  console.log('Restoring config');
  const savedConfig = localStorage.getItem(CONFIG_KEY);
  if (!savedConfig) {
    console.log('Initializing Default Config');
    globalConfig.eventInfo = new Config().eventInfo;
    console.log('Info', globalConfig.eventInfo);
    return;
  }
  const parsedConfig = JSON.parse(savedConfig);
  console.log(parsedConfig);
  Object.assign(globalConfig.eventInfo, parsedConfig);
  console.log(globalConfig.eventInfo);
}
export function saveConfig() {
  console.log('saving');
  localStorage.setItem(CONFIG_KEY, JSON.stringify(globalConfig.eventInfo));
  console.log(globalConfig.eventInfo);
}
export function actuallyResetConfig() {
  localStorage.removeItem(CONFIG_KEY);
  restoreConfig();
}
