/**
 * SM2 Service - Algorithme de répétition espacée
 */
export class SM2Service {
  /**
   * Calculer le prochain intervalle de révision
   * @param {Object} card - Carte à réviser
   * @param {number} quality - Qualité de la réponse (0-5)
   * @returns {Object} Nouvelles valeurs SM2
   */
  static calculate(card, quality) {
    let { interval, repetition, easeFactor } = card
    
    if (quality < 3) {
      // Réponse incorrecte - recommencer
      repetition = 0
      interval = 0
    } else {
      // Réponse correcte
      if (repetition === 0) {
        interval = 1
      } else if (repetition === 1) {
        interval = 6
      } else {
        interval = Math.round(interval * easeFactor)
      }
      repetition++
    }
    
    // Ajuster le facteur de facilité
    easeFactor = Math.max(
      1.3,
      easeFactor + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02))
    )
    
    // Calculer la prochaine date de révision
    const nextReview = new Date()
    nextReview.setDate(nextReview.getDate() + interval)
    
    return {
      interval,
      repetition,
      easeFactor: Math.round(easeFactor * 100) / 100,
      nextReview: nextReview.toISOString(),
      lastReview: new Date().toISOString()
    }
  }

  /**
   * Convertir une réponse utilisateur en qualité SM2
   * @param {'again'|'hard'|'good'|'easy'} answer
   * @returns {number} Qualité (0-5)
   */
  static answerToQuality(answer) {
    const mapping = {
      'again': 0,  // Complètement oublié
      'hard': 2,   // Difficile
      'good': 4,   // Correct
      'easy': 5    // Très facile
    }
    return mapping[answer] ?? 3
  }
}
