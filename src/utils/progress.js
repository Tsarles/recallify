export function getQuizProgress(score, wrong, total) {
  const answered = Math.max(0, score + wrong);
  return {
    answered,
    remaining: Math.max(0, total - answered),
    progressPct: total > 0 ? Math.min(100, Math.round((answered / total) * 100)) : 0,
    accuracyPct: answered > 0 ? Math.round((score / answered) * 100) : 0,
  };
}
