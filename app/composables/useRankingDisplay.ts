/**
 * Composable for inverting ranking scores back for display.
 *
 * The backend inverts rank scores (activeCount + 1 - avgRank) so that
 * higher scores sort better for denseRank. This composable reverses
 * that inversion so judges/admins see intuitive rank values
 * (1 = best, N = worst).
 */
export function useRankingDisplay(participants: Ref<any[]>) {
  const activeParticipantCount = computed(() =>
    participants.value.filter(
      (p) => p.participant_status === 'active' && !p.eliminated_at_segment,
    ).length,
  )

  /**
   * Invert a single category's ranking score back to the original average rank.
   * Backend: invertedScore = activeCount + 1 - avgRank
   * Display: avgRank = activeCount + 1 - invertedScore
   */
  function displayRankScore(invertedScore: number): number {
    return activeParticipantCount.value + 1 - invertedScore
  }

  /**
   * Invert a segment total (sum of inverted category averages) back to
   * the average original rank across scored categories.
   *
   * Backend: total = sum_i(activeCount + 1 - catAvg_i)
   *        = numScored * (activeCount + 1) - sum(catAvgs)
   * Display: avgRank = sum(catAvgs) / numScored
   *        = (activeCount + 1) - (total / numScored)
   */
  function displaySegmentAvgRank(invertedTotal: number, numScoredCategories: number): number {
    if (numScoredCategories === 0) return 0
    return activeParticipantCount.value + 1 - invertedTotal / numScoredCategories
  }

  return {
    activeParticipantCount,
    displayRankScore,
    displaySegmentAvgRank,
  }
}
