// Initialisation des modules
const memory = new Memory();
const ia1 = new IA1();
const ia2 = new IA2(memory);
const ia3 = new IA3();

// Éléments du DOM
const chatMessages = document.getElementById('chatMessages');
const userInput = document.getElementById('userInput');

// Charger l'historique depuis le localStorage au démarrage
const history = Storage.load('chatHistory', []);
history.forEach(msg => addMessageToChat(msg.text, msg.sender, msg.isRewritten));

// Fonction pour ajouter un message à l'interface
function addMessageToChat(text, sender, isRewritten = false) {
  const msgDiv = document.createElement('div');
  msgDiv.className = `message ${sender}`;
  if (isRewritten) {
    msgDiv.style.fontStyle = 'italic';
    msgDiv.style.opacity = '0.7';
    msgDiv.textContent = '🧠 ' + text;
  } else {
    msgDiv.textContent = text;
  }
  chatMessages.appendChild(msgDiv);
  chatMessages.scrollTop = chatMessages.scrollHeight;
}

// Fonction principale d'envoi de message
function sendMessage() {
  const text = userInput.value.trim();
  if (!text) return;

  // Afficher le message utilisateur
  addMessageToChat(text, 'user');
  userInput.value = '';

  // Sauvegarder dans l'historique
  history.push({ text, sender: 'user' });
  Storage.save('chatHistory', history);

  // --- Chaîne de traitement IA ---
  // 1. Analyse NLP (IA1)
  const analysis = ia1.analyse(text);

  // 2. Raisonnement (IA2)
  const rawResponse = ia2.process(analysis);

  // 3. Polissage (IA3) - on lui passe l'analyse complète
  const finalResponse = ia3.polish(rawResponse, analysis);

  // Optionnel : afficher la reformulation si elle est différente du texte original
  if (analysis.rewritten && analysis.rewritten !== text) {
    addMessageToChat(analysis.rewritten, 'bot', true); // true indique que c'est une reformulation
    history.push({ text: analysis.rewritten, sender: 'bot', isRewritten: true });
  }

  // Simuler un délai pour un effet "typing"
  setTimeout(() => {
    addMessageToChat(finalResponse, 'bot');
    history.push({ text: finalResponse, sender: 'bot' });
    Storage.save('chatHistory', history);
  }, 600 + Math.random() * 400);
}

// Envoyer avec la touche Entrée
userInput.addEventListener('keypress', (e) => {
  if (e.key === 'Enter') sendMessage();
});

// Focus automatique sur l'input au chargement
userInput.focus();
