const memory = new Memory();
const ia1 = new IA1();
const ia2 = new IA2(memory);
const ia3 = new IA3();

const chatMessages = document.getElementById('chatMessages');
const userInput = document.getElementById('userInput');

const history = Storage.load('chatHistory', []);
history.forEach(msg => addMessageToChat(msg.text, msg.sender, msg.isRewritten));

function addMessageToChat(text, sender, isRewritten = false) {
  if (!text) return;
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

function sendMessage() {
  const text = userInput.value.trim();
  if (!text) return;

  addMessageToChat(text, 'user');
  userInput.value = '';

  history.push({ text, sender: 'user' });
  Storage.save('chatHistory', history);

  try {
    const analysis = ia1.analyse(text);
    const rawResponse = ia2.process(analysis);
    const finalResponse = ia3.polish(rawResponse, analysis);

    if (analysis.rewritten && analysis.rewritten !== text) {
      addMessageToChat(analysis.rewritten, 'bot', true);
      history.push({ text: analysis.rewritten, sender: 'bot', isRewritten: true });
    }

    setTimeout(() => {
      addMessageToChat(finalResponse, 'bot');
      history.push({ text: finalResponse, sender: 'bot' });
      Storage.save('chatHistory', history);
    }, 600 + Math.random() * 400);
  } catch (err) {
    console.error('Erreur lors du traitement :', err);
    addMessageToChat('Oups, une erreur est survenue. Recharge la page.', 'bot');
  }
}

userInput.addEventListener('keypress', (e) => {
  if (e.key === 'Enter') sendMessage();
});

userInput.focus();
