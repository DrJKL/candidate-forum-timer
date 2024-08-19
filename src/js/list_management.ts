import type { Question } from "./global_config";

export function addUniqueItem(
  newItem: Question,
  existingItems: readonly Question[]
): Question[] {
  const processedQuestion = preProcessQuestion(newItem);
  if (!processedQuestion) {
    return [...existingItems];
  }
  return [...new Set([newItem, ...existingItems.filter(item => item.displayText !== processedQuestion.displayText)])];
}

function preProcessQuestion(question: Question): Question | undefined {
  if (!question) {
    return undefined;
  }
  const { displayText, preamble, topic } = question;
  const trimmedText = displayText.replaceAll(/\\n/g, '\n').trim();
  const trimmedPreamble = preamble.replaceAll(/\\n/g, '\n').trim();
  const trimmedTopic = topic.replaceAll(/\\n/g, '\n').trim();
  return { topic: trimmedTopic, preamble: trimmedPreamble, displayText: trimmedText };
}
