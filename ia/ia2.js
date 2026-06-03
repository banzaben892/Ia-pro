class IA2 {
  constructor(memory) {
    this.memory = memory;
    this.lastTopic = null;
  }

  compute(expression) {
    const sanitized = expression.replace(/[^0-9+\-*/.() ]/g, '');
    if (!sanitized.trim()) return null;
    try {
      const result = Function('"use strict"; return (' + sanitized + ')')();
      return result;
    } catch (e) {
      return null;
    }
  }

  process(analysis) {
    const { intent, entities, sentiment, rewritten } = analysis;

    if (intent !== 'unknown') this.lastTopic = intent;

    // Salutations
    if (intent === 'bonjour') {
      const name = this.memory.userName;
      const hour = new Date().getHours();
      let greet = name ? `Rebonjour ${name}` : 'Bonjour';
      if (hour < 12) greet += ' ☀️';
      else if (hour < 18) greet += ' 🌤️';
      else greet += ' 🌙';
      return greet + ' ! Que puis-je faire pour toi ?';
    }

    // Au revoir
    if (intent === 'au_revoir') {
      return 'Au revoir ! Passe une belle journée 😊';
    }

    // Identité
    if (intent === 'identite') {
      return 'Je suis Mini ChatGPT, ton assistant 100% local et hors-ligne. Je peux retenir ton nom, faire des calculs, donner l\'heure, et plus encore !';
    }

    // Demander le nom
    if (intent === 'nom' || intent === 'memory_get') {
      if (this.memory.userName) {
        return `Tu t'appelles ${this.memory.userName} 😊`;
      } else {
        return 'Je ne connais pas encore ton nom. Dis-moi « je m\'appelle [ton prénom] ».';
      }
    }

    // Enregistrer le nom
    if (intent === 'memory_set' && entities.name) {
      this.memory.setUserName(entities.name);
      return `Enchanté ${entities.name} 👋 Je m'en souviendrai !`;
    }

    // Comment ça va
    if (intent === 'comment_ca_va') {
      const reps = ['Je vais bien, merci ! Et toi ?', 'Tout roule ! 😄', 'Ça gaz ! Et toi ?'];
      return reps[Math.floor(Math.random() * reps.length)];
    }

    // Merci
    if (intent === 'merci') {
      return 'Avec plaisir ! N\'hésite pas si tu as besoin d\'autre chose 😊';
    }

    // Aide
    if (intent === 'aide') {
      return 'Voici ce que je sais faire :\n• Retenir ton nom\n• Discuter\n• Calculer (ex: 3+5)\n• Donner l\'heure et la date\n• Comprendre des synonymes\nEssaie : « calcule 12*3 » ou « il est quelle heure ? »';
    }

    // Calcul
    if (intent === 'calcul') {
      const exprMatch = rewritten.match(/[\d\s+\-*/.()]+/);
      if (exprMatch) {
        const expr = exprMatch[0].trim();
        const result = this.compute(expr);
        if (result !== null) return `Le résultat de ${expr} est ${result}.`;
      }
      return 'Je n\'ai pas compris le calcul. Exemple : « calcule 5+3 »';
    }

    // Heure
    if (intent === 'heure') {
      const h = new Date().toLocaleTimeString('fr-FR', { hour:'2-digit', minute:'2-digit' });
      return `Il est ${h}.`;
    }

    // Date
    if (intent === 'date') {
      const d = new Date().toLocaleDateString('fr-FR', { weekday:'long', day:'numeric', month:'long', year:'numeric' });
      return `Nous sommes le ${d}.`;
    }

    // Fallback
    const fallbacks = [
      'Je ne suis pas sûr de comprendre. Peux-tu reformuler ?',
      'Désolé, je n\'ai pas encore appris à répondre à cela. Tape « aide » pour voir ce que je sais faire.',
      'Je suis encore en apprentissage ! Essaie de me parler de ton nom, ou demande-moi l\'heure.'
    ];
    return fallbacks[Math.floor(Math.random() * fallbacks.length)];
  }
}
