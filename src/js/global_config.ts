import { Candidate } from './candidates';
import moment from 'moment';
import { addUniqueItem } from './list_management';
import { reactive } from 'vue';
import { z } from 'zod';

const images = import.meta.glob('../assets/*.png', {
  import: 'default',
  query: '?url',
  eager: true,
});

/**
 * DEFAULT: Set the time for everyone at once
 * BUDGET: Set a total time and keep a running clock per person.
 */
const TIMER_MODES = ['DEFAULT', 'BUDGET'] as const;

export type TimerMode = typeof TIMER_MODES[number];
export interface EventTime {
  hours: number;
  minutes: number;
  seconds: number;
  paddingMinutes: number;
}


export const Question = z.object({
  topic: z.string(),
  preamble: z.string(),
  displayText: z.string(),
});
export type Question = z.infer<typeof Question>;
export const Questions = z.array(Question);

export declare interface EventInfo {
  logoUrl: string;
  orgTitle: string;
  eventTitle: string;
  candidatesList: readonly string[];
  questions: Question[];
  mode: TimerMode;
  totalTime: EventTime;
}

const DEFAULT_QUESTIONS: Question[] = [
  {
    topic: 'Fun - Color',
    preamble: 'You know the rainbow? With all the different stripes?',
    displayText: 'What is your favorite color?'
  },
  {
    topic: 'Fun - Biology',
    preamble: 'Plants and Fungi are cool and all, but...',
    displayText: 'What is your favorite animal?'
  },
  {
    topic: 'Housing',
    preamble: 'The rent is too damn high.',
    displayText: 'What steps can the City do in the next 4 years to alleviate the harms of our Housing Crisis?'
  },
];

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
            <span>MVCC</span>
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
      ...DEFAULT_QUESTIONS
    ],
    mode: 'DEFAULT',
    totalTime: {
      hours: 1,
      minutes: 30,
      seconds: 0,
      paddingMinutes: 10,
    }

  };
  get candidates() {
    return this.eventInfo.candidatesList.map((name) => new Candidate(name));
  }
  set candidates(newCandidates: Candidate[]) {
    this.eventInfo.candidatesList = newCandidates.map(
      (candidate) => candidate.name
    );
  }
  get mode() { return this.eventInfo.mode; }

  changeMode(mode: TimerMode) {
    this.eventInfo.mode = mode;
    saveConfig();
  }

  addQuestion(newQuestion: Question) {
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
  updateTotalTime(totalTime: EventTime) {
    this.updateInfo({ totalTime });
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

function timeToSeconds(time: EventTime) {
  const { hours, minutes } = time;
  return (hours * 60 * 60) + (minutes * 60);
}
export function secondsToTime(totalSeconds: number): EventTime {
  totalSeconds = Math.round(totalSeconds);
  var hours = Math.floor(totalSeconds / (60 * 60));

  var divisor_for_minutes = totalSeconds % (60 * 60);
  var minutes = Math.floor(divisor_for_minutes / 60);

  var divisor_for_seconds = divisor_for_minutes % 60;
  var seconds = Math.ceil(divisor_for_seconds);

  return { hours, minutes, seconds, paddingMinutes: 0 };
}
export function timeFormatter(time: EventTime, withSeconds = false) {
  const { hours, minutes, seconds } = time;

  const secondsSegment = withSeconds ? ` ${seconds} seconds` : '';

  return `${hours} Hours ${minutes} minutes${secondsSegment}`;
}

export function timePerCandidate(totalTimeTmp: EventTime, numberCandidates: number) {
  const totalTime = timeToSeconds(totalTimeTmp);
  const paddingTime = totalTimeTmp.paddingMinutes * 60;
  const timeWithoutPadding = totalTime - paddingTime;
  return timeWithoutPadding / (numberCandidates ?? 1);
}

export function questionsToJSON(questions: Question[]): string {
  const stringForm = JSON.stringify(questions, null, 2);
  return stringForm;
}

export function downloadQuestions(questions: Question[]) {
  const questionsJson = questionsToJSON(questions);
  download(questionsJson, 'questions.json', 'application/json');
}

function download(content: string, fileName: string, contentType: string) {
  var a = document.createElement("a");
  var file = new Blob([content], { type: contentType });
  a.href = URL.createObjectURL(file);
  a.download = fileName;
  a.click();
}
