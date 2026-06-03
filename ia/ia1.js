class IA1 {
  constructor() {
    // Dictionnaire de synonymes (racine normalisée -> mots possibles)
    this.synonyms = {
      'bonjour': ['salut', 'hello', 'coucou', 'yo', 'wesh', 'bonsoir', 'bjr'],
      'au revoir': ['bye', 'a+', 'a plus', 'tchao', 'ciao', 'adieu'],
      'nom': ['nom', 'blase', 'blaze', 'surnom', 'pseudo', 'identité'],
      'qui es-tu': ['qui es tu', 'tu es qui', 'c\'est qui toi', 't\'es quoi', 'ton rôle'],
      'comment ca va': ['ca va', 'ça va', 'comment vas-tu', 'tu vas bien', 'la forme'],
      'merci': ['merci', 'thanks', 'thx', 'remerciement'],
      'aide': ['aide', 'help', 'au secours', 'que sais-tu faire']
    };

    // Stop words français (à ignorer pendant l'analyse)
    this.stopWords = new Set([
      'le','la','les','un','une','des','de','du','à','au','aux',
      'ce','cet','cette','ces','est','sont','suis','es','sommes','êtes',
      'je','tu','il','elle','on','nous','vous','ils','elles',
      'me','te','se','moi','toi','lui','nous','vous','leur','y','en',
      'que','qui','quoi','dont','où','comment','pourquoi','quand',
      'et','ou','mais','donc','car','ni','or',
      'ne','pas','plus','jamais','rien','tout','très','trop'
    ]);
  }

  // Stemming français ultra-simple (coupe les terminaisons courantes)
  stem(word) {
    const lower = word.toLowerCase();
    // Suppression des suffixes verbaux/nominaux communs
    const suffixes = ['er', 'ir', 're', 'é', 'ée', 'és', 'ées', 'ez', 'ais', 'ait', 'aient', 'ions', 'iez',
                      'ant', 'ante', 'ants', 'antes', 'ment', 'tion', 'sion', 'isme', 'able', 'ible'];
    for (let suf of suffixes) {
      if (lower.endsWith(suf) && lower.length > suf.length + 2) {
        return lower.slice(0, -suf.length);
      }
    }
    // Supprime le 's' du pluriel
    if (lower.endsWith('s') && lower.length > 3) return lower.slice(0, -1);
    return lower;
  }

  // Normalisation d'un mot : minuscule, stem, suppression accents basique
  normalizeWord(word) {
    let w = word.toLowerCase().trim();
    // Remplacer les caractères accentués par leur version sans accent (simpliste)
    w = w.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
    return this.stem(w);
  }

  // Détection de l'intention en utilisant les synonymes
  detectIntentWithSynonyms(tokens) {
    const normalizedTokens = tokens.map(t => this.normalizeWord(t));
    const phrase = normalizedTokens.join(' ');

    // Vérifier chaque groupe de synonymes
    for (let [intent, variants] of Object.entries(this.synonyms)) {
      for (let v of variants) {
        // Vérifier si le variant est présent dans la phrase normalisée
        if (phrase.includes(v.replace(/\s+/g, ''))) { // on ignore les espaces dans les variants multi-mots
          return intent;
        }
        // Sinon vérifier mot par mot
        if (normalizedTokens.includes(v.replace(/\s+/g, ''))) {
          return intent;
        }
      }
    }

    // Détection basée sur des patterns plus généraux (sans synonymes)
    if (/comment (je )?(m'appelle|mon nom)/i.test(phrase)) return 'memory_get';
    if (/je (m'appelle|suis|nom est)/i.test(phrase)) return 'memory_set';
    if (/qui (es-tu|tu es)/i.test(phrase)) return 'identity';

    // Si on a détecté un "?", c'est peut-être une question => fallback
    if (phrase.includes('?')) return 'question';

    return 'unknown';
  }

  // Reformulation automatique de la question (query rewriting)
  rewriteQuery(text, intent) {
    // Si l'intention est détectée, on peut reformuler pour clarifier
    switch (intent) {
      case 'greeting':
        return 'Bonjour / Salutation';
      case 'au revoir':
        return 'Dire au revoir';
      case 'nom':
        return 'Demander le nom';
      case 'qui es-tu':
        return 'Qui es-tu ?';
      case 'comment ca va':
        return 'Comment ça va ?';
      case 'merci':
        return 'Remercier';
      case 'aide':
        return 'Demander de l\'aide';
      case 'memory_get':
        return 'Quel est mon nom ?';
      case 'memory_set':
        return 'Je te dis mon nom';
      case 'identity':
        return 'Qui es-tu ?';
      default:
        return text; // retourne le texte original si non reconnu
    }
  }

  // Méthode principale d'analyse
  analyse(text) {
    // Nettoyage de base
    let cleaned = text.trim();

    // Tokenisation et suppression des stop words pour l'analyse
    let tokens = cleaned.split(/\s+/);
    let contentWords = tokens.filter(w => !this.stopWords.has(w.toLowerCase()));

    // Détection d'intention avec synonymes
    const intent = this.detectIntentWithSynonyms(contentWords);

    // Reformulation interne (utile pour logs ou debug)
    const rewritten = this.rewriteQuery(cleaned, intent);

    // Extraction d'entités (nom) améliorée
    let entities = {};
    if (intent === 'memory_set') {
      // Pattern plus flexible : "je m'appelle X", "mon nom est X", "je suis X" (avec mots optionnels)
      const namePattern = /(?:je\s+(?:m'appelle|suis)|mon\s+nom\s+(?:est|c'est))\s+([a-zA-Zàâäéèêëîïôöùûüç\-]+)/i;
      const match = cleaned.match(namePattern);
      if (match) entities.name = match[1];
    }

    // Analyse de sentiment simple (comme avant, mais sur contentWords)
    const positive = ['bien', 'super', 'génial', 'cool', 'heureux', 'content', 'top', 'parfait'];
    const negative = ['mal', 'triste', 'nul', 'pas bien', 'horrible', 'affreux'];
    let sentiment = 'neutre';
    const lowerContent = contentWords.map(w => w.toLowerCase());
    if (positive.some(w => lowerContent.includes(w))) sentiment = 'positif';
    else if (negative.some(w => lowerContent.includes(w))) sentiment = 'négatif';

    return {
      intent,
      entities,
      sentiment,
      rewritten, // on transmet la reformulation (utile pour IA2 si nécessaire)
    };
  }
}
