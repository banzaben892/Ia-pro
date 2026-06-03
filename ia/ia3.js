class IA3 {
  constructor() {
    // Base de variantes pour certaines intentions courantes
    this.variants = {
      greeting: [
        'Ravi de te voir ! Comment se passe ta journée ?',
        'Content de te retrouver 😊 Que puis-je faire pour toi ?',
        'Salut ! Quoi de neuf ?'
      ],
      farewell: [
        'À bientôt ! Prends soin de toi.',
        'Bonne continuation et à très vite 👋',
        'Je reste là si tu as besoin. Bye !'
      ],
      identity: [
        'Moi c’est Mini ChatGPT, ton assistant 100% local. En quoi puis-je t’aider ?',
        'Je suis ton assistant personnel, sans cloud ni mouchard. Cool, non ? 😎'
      ],
      memory_set: [
        'Noté ! Ravi de faire ta connaissance. Tu veux qu’on parle d’un sujet en particulier ?',
        'Bien reçu. Si jamais tu veux que je t’appelle autrement, dis-le moi.'
      ],
      memory_get: [
        'D’après mes souvenirs, tu es {name}. C’est bien ça ?',
        'Je n’oublie jamais un nom : tu t’appelles {name}.'
      ],
      default: [
        'Je vois. Dis-m’en un peu plus.',
        'Intéressant ! Est-ce que tu peux préciser ?',
        'D’accord. Est-ce qu’il y a autre chose que je puisse faire pour toi ?'
      ]
    };
  }

  // Reformule et enrichit la réponse brute
  polish(rawResponse, analysis) {
    const { intent, sentiment, rewritten } = analysis || {};
    let response = rawResponse;

    // --- 1. Personnalisation selon le sentiment ---
    if (sentiment === 'positif') {
      response = this.makeWarmer(response);
    } else if (sentiment === 'négatif') {
      response = this.makeSofter(response);
    }

    // --- 2. Ajout d'emoji contextuel (si pas déjà présent) ---
    const emojiMap = {
      greeting: '👋',
      farewell: '👋',
      identity: '🤖',
      memory_set: '🧠',
      memory_get: '🔍',
      calcul: '🧮',
      heure: '⏰',
      date: '📅',
      aide: '❓',
      merci: '🙏',
      comment_ca_va: '😊'
    };
    const intentKey = intent || '';
    if (emojiMap[intentKey] && !response.includes(emojiMap[intentKey])) {
      response += ' ' + emojiMap[intentKey];
    }

    // --- 3. Ajout d'une relance subtile (une fois sur deux pour rester naturel) ---
    if (Math.random() > 0.5 && intent !== 'farewell' && intent !== 'unknown') {
      response += ' ' + this.pickRandom(this.variants.default);
    }

    // --- 4. Remplacement de motifs (ex: {name}) ---
    // On suppose que le nom est déjà intégré par l'IA2, mais on peut le récupérer si présent
    // (pas nécessaire ici car IA2 a déjà mis le nom)

    // --- 5. Nettoyage final (ponctuation, espaces multiples) ---
    response = response.replace(/\s{2,}/g, ' ').trim();

    return response;
  }

  makeWarmer(text) {
    // Ajoute une touche positive si pas déjà très enthousiaste
    if (!text.match(/😊|😄|😃|👍/)) {
      return text + ' 😊';
    }
    return text;
  }

  makeSofter(text) {
    // Adoucit la réponse
    if (!text.match(/😔|😟|🙁/)) {
      return text + ' Je suis là si tu veux parler.';
    }
    return text;
  }

  pickRandom(arr) {
    return arr[Math.floor(Math.random() * arr.length)];
  }
  }
