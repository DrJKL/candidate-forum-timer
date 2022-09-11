export function addUniqueItem(
  newItem: string,
  existingItems: readonly string[]
): string[] {
  const processedQuestion = preProcessQuestion(newItem);
  if (!processedQuestion) {
    return [...existingItems];
  }
  return [...new Set([newItem, ...existingItems])];
}

function preProcessQuestion(question: string): string {
  if (!question || question === '.') {
    return '';
  }
  return question.replaceAll(/\\n/g, '\n').trim();
}
