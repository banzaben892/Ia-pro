class IA2 {
  constructor(memory) {
    this.memory = memory;
    // Contexte à court terme
    this.lastTopic = null;
  }

  // Petite capacité de calcul simple
  compute(expression) {
    // N'autorise que des opérations de base pour la sécurité
    const sanitized = expression.replace(/[^0-9+\-*/.() ]/g, '');
    try {
      // eval est sûr ici car on a nettoyé
      const result = Function('"use strict"; return (' + sanitized + ')')();
      return result;
    } catch (e) {
      return null;
    }
  }

  process(analysis) {
    const { intent, entities, sentiment, rewritten } = analysis;

    // Mise à jour du contexte
    if (intent !== 'unknown') {
      this.lastTopic = intent;
    }

    // --- Traitement par intention ---

    // 1. Salutations
    if (intent === 'greeting') {
      const name = this.memory.userName;
      const base = name ? `Rebonjour ${name} 👋` : 'Bonjour 👋';
      // Variante selon le moment de la journée (locale)
      const hour = new Date().getHours();
      let greeting = base;
      if (hour < 12) greeting = name ? `Bonjour ${name} ☀️` : 'Bonjour ☀️';
      else if (hour < 18) greeting = name ? `Bon après-midi ${name} 🌤️` : 'Bon après-midi 🌤️';
      else greeting = name ? `Bonsoir ${name} 🌙` : 'Bonsoir 🌙';
      return greeting + ' Que puis-je faire pour toi ?';
    }

    // 2. Dire au revoir
    if (intent === 'au revoir') {
      return 'Au revoir ! Passe une belle journée 😊';
    }

    // 3. Identité du bot
    if (intent === 'qui es-tu' || intent === 'identity') {
      return 'Je suis Mini ChatGPT, un assistant local et hors-ligne. Je peux discuter, retenir ton nom, faire des calculs simples et plus encore !';
    }

    // 4. Demander le nom
    if (intent === 'nom' || intent === 'memory_get') {
      if (this.memory.userName) {
        return `Tu t'appelles ${this.memory.userName} 😊`;
      } else {
        return 'Je ne connais pas encore ton nom. Dis-moi « je m’appelle [ton prénom] » pour que je le retienne.';
      }
    }

    // 5. Enregistrer le nom
    if (intent === 'memory_set' && entities.name) {
      this.memory.setUserName(entities.name);
      return `Enchanté ${entities.name} 👋 Je m’en souviendrai. Veux-tu que je t’appelle autrement ?`;
    }

    // 6. Comment ça va
    if (intent === 'comment ca va') {
      const reponses = [
        'Je vais bien, merci ! Et toi ?',
        'Tout fonctionne parfaitement de mon côté 😄',
        'Ça gaz ! Et toi, comment te sens-tu ?'
      ];
      return reponses[Math.floor(Math.random() * reponses.length)];
    }

    // 7. Remerciements
    if (intent === 'merci') {
      return 'Avec plaisir ! N’hésite pas si tu as besoin d’autre chose 😊';
    }

    // 8. Aide
    if (intent === 'aide') {
      return 'Voici ce que je sais faire :\n• Retenir ton nom\n• Discuter (salutations, humeur)\n• Calculer (ex: 3+5)\n• Donner la date et l’heure\n• Comprendre des synonymes\nEssaie par exemple : « calcule 12 * 3 » ou « il est quelle heure ? »';
    }

    // 9. Calculs (détecté via la reformulation ou des mots-clés)
    if (rewritten && rewritten.includes('calcul')) {
      // Extraction de l'expression mathématique
      const calcMatch = rewritten.match(/[\d+\-*/.() ]+/);
      if (calcMatch) {
        const expr = calcMatch[0].trim();
        const result = this.compute(expr);
        if (result !== null) {
          return `Le résultat de ${expr} est ${result}.`;
        }
      }
      return 'Désolé, je n’ai pas compris le calcul. Tu peux écrire par exemple « calcule 5+3 ».';
    }

    // 10. Heure / date
    if (rewritten && (rewritten.includes('heure') || rewritten.includes('date'))) {
      const maintenant = new Date();
      if (rewritten.includes('heure')) {
        const heure = maintenant.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
        return `Il est ${heure}.`;
      }
      if (rewritten.includes('date')) {
        const date = maintenant.toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
        return `Nous sommes le ${date}.`;
      }
    }

    // 11. Question inconnue (fallback intelligent)
    const fallbacks = [
      'Je ne suis pas sûr de comprendre. Peux-tu reformuler ?',
      'Désolé, je n’ai pas encore appris à répondre à cela. Essaie de me parler de ton nom, ou demande-moi l’heure.',
      'Je suis encore en apprentissage. Tu peux me dire « aide » pour voir ce que je sais faire.'
    ];
    return fallbacks[Math.floor(Math.random() * fallbacks.length)];
  }
}
