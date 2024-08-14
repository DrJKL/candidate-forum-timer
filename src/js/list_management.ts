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
  const { displayText } = question;
  if (!question) {
    return undefined;
  }
  const trimmedText = displayText.replaceAll(/\\n/g, '\n').trim();
  return { ...question, displayText: trimmedText };
}
