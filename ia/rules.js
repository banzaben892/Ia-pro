const Rules = {
  greetings: ['bonjour', 'salut', 'hello', 'coucou', 'yo'],
  farewells: ['au revoir', 'bye', 'salut', 'à plus'],
  identityQuestions: ['qui es-tu', 'tu es quoi', 'ton nom'],
  memoryTriggers: ['je m\'appelle', 'mon nom est', 'je suis'],
  memoryRecall: ['comment je m\'appelle', 'quel est mon nom', 'tu te souviens de moi'],
  getResponse(intent, entities, memory) {
    switch (intent) {
      case 'greeting':
        const name = memory.userName;
        return name ? `Rebonjour ${name} 👋` : 'Bonjour 👋 comment puis-je t\'aider ?';
      case 'farewell':
        return 'Au revoir ! Passe une bonne journée 😊';
      case 'identity':
        return 'Je suis Mini ChatGPT, un assistant local et hors-ligne.';
      case 'memory_set':
        return `Enchanté ${entities.name} 👋 Je m\'en souviendrai.`;
      case 'memory_get':
        return memory.userName ? `Tu t'appelles ${memory.userName}.` : 'Je ne connais pas encore ton nom.';
      default:
        return 'Je ne suis pas sûr de comprendre. Peux-tu reformuler ?';
    }
  }
};
