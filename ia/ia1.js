class IA1 {
  constructor() {
    this.synonyms = {
      'bonjour': ['salut', 'hello', 'coucou', 'yo', 'wesh', 'bonsoir', 'bjr'],
      'au_revoir': ['bye', 'a+', 'tchao', 'ciao', 'adieu'],
      'nom': ['blase', 'blaze', 'surnom', 'pseudo'],
      'identite': ['qui es-tu', 'tu es qui', 'ton role'],
      'comment_ca_va': ['ca va', 'comment vas-tu', 'tu vas bien', 'la forme'],
      'merci': ['thanks', 'thx'],
      'aide': ['help', 'au secours', 'que sais-tu faire'],
      'calcul': ['calcule', 'combien fait', 'resultat'],
      'heure': ['quelle heure', 'horaire'],
      'date': ['quel jour', 'aujourd\'hui']
    };
    this.stopWords = new Set(['le','la','les','un','une','des','de','du','à','au','aux',
      'ce','cet','cette','ces','est','sont','suis','es','sommes','êtes',
      'je','tu','il','elle','on','nous','vous','ils','elles',
      'me','te','se','moi','toi','lui','leur','y','en',
      'que','qui','quoi','dont','où','comment','pourquoi','quand',
      'et','ou','mais','donc','car','ni','or',
      'ne','pas','plus','jamais','rien','tout','très','trop','c\'est','c','est']);
  }

  stem(word) {
    const lower = word.toLowerCase();
    const suffixes = ['er','ir','re','é','ée','és','ées','ez','ais','ait','aient','ions','iez',
                      'ant','ante','ants','antes','ment','tion','sion','isme','able','ible'];
    for (let suf of suffixes) {
      if (lower.endsWith(suf) && lower.length > suf.length + 2) {
        return lower.slice(0, -suf.length);
      }
    }
    if (lower.endsWith('s') && lower.length > 3) return lower.slice(0, -1);
    return lower;
  }

  normalizeWord(word) {
    let w = word.toLowerCase().trim();
    w = w.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
    return this.stem(w);
  }

  detectIntent(tokens) {
    const normalized = tokens.map(t => this.normalizeWord(t));
    const phrase = normalized.join('');
    const rawPhrase = tokens.join(' ').toLowerCase();

    for (let [intent, variants] of Object.entries(this.synonyms)) {
      for (let v of variants) {
        const cleanV = v.replace(/\s+/g, '').toLowerCase();
        if (phrase.includes(cleanV)) return intent;
      }
    }

    if (/comment\s+(je\s+)?(m'appelle|mon\s+nom)/i.test(rawPhrase)) return 'memory_get';
    if (/je\s+(m'appelle|suis|nom\s+est)/i.test(rawPhrase)) return 'memory_set';
    if (/qui\s+(es.tu|tu\s+es)/i.test(rawPhrase)) return 'identite';
    if (/\?/.test(rawPhrase)) return 'question';
    return 'unknown';
  }

  rewriteQuery(text, intent) {
    const map = {
      'bonjour': 'Bonjour / Salutation',
      'au_revoir': 'Dire au revoir',
      'nom': 'Demander le nom',
      'identite': 'Qui es-tu ?',
      'comment_ca_va': 'Comment ça va ?',
      'merci': 'Remercier',
      'aide': 'Demander de l\'aide',
      'calcul': 'Faire un calcul',
      'heure': 'Demander l\'heure',
      'date': 'Demander la date',
      'memory_get': 'Quel est mon nom ?',
      'memory_set': 'Je te dis mon nom'
    };
    return map[intent] || text;
  }

  analyse(text) {
    const cleaned = text.trim();
    const tokens = cleaned.split(/\s+/);
    const contentWords = tokens.filter(w => !this.stopWords.has(w.toLowerCase()));

    const intent = this.detectIntent(contentWords.length > 0 ? contentWords : tokens);
    const rewritten = this.rewriteQuery(cleaned, intent);

    let entities = {};
    if (intent === 'memory_set') {
      const match = cleaned.match(/(?:je\s+(?:m'appelle|suis)|mon\s+nom\s+(?:est|c'est))\s+([a-zA-Zàâäéèêëîïôöùûüç\-]+)/i);
      if (match) entities.name = match[1];
    }

    const positive = ['bien','super','génial','cool','heureux','content','top','parfait'];
    const negative = ['mal','triste','nul','pas bien','horrible','affreux'];
    let sentiment = 'neutre';
    const lowerContent = contentWords.map(w => w.toLowerCase());
    if (positive.some(w => lowerContent.includes(w))) sentiment = 'positif';
    else if (negative.some(w => lowerContent.includes(w))) sentiment = 'négatif';

    return { intent, entities, sentiment, rewritten };
  }
        }
