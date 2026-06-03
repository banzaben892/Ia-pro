class IA3 {
  constructor() {
    this.variants = {
      bonjour: ['Ravi de te voir ! Comment se passe ta journée ?', 'Content de te retrouver 😊'],
      au_revoir: ['À bientôt ! Prends soin de toi.', 'Bonne continuation 👋'],
      default: ['Je vois. Dis-m\'en un peu plus.', 'Intéressant ! Est-ce que tu peux préciser ?', 'D\'accord. Autre chose ?']
    };
  }

  polish(rawResponse, analysis) {
    if (!analysis) return rawResponse;

    const { intent, sentiment } = analysis;
    let response = rawResponse;

    if (sentiment === 'positif') response += ' 😊';
    else if (sentiment === 'négatif') response += ' Je suis là si tu veux parler.';

    const emojiMap = {
      'bonjour': '👋', 'au_revoir': '👋', 'identite': '🤖',
      'memory_set': '🧠', 'memory_get': '🔍',
      'calcul': '🧮', 'heure': '⏰', 'date': '📅', 'aide': '❓', 'merci': '🙏'
    };
    if (emojiMap[intent] && !response.includes(emojiMap[intent])) {
      response += ' ' + emojiMap[intent];
    }

    if (Math.random() > 0.5 && intent !== 'au_revoir' && intent !== 'unknown') {
      response += ' ' + this.pickRandom(this.variants.default);
    }

    return response.replace(/\s{2,}/g, ' ').trim();
  }

  pickRandom(arr) {
    return arr[Math.floor(Math.random() * arr.length)];
  }
}
