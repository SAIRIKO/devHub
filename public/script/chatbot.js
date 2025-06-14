// Função para adicionar mensagens ao chat
function addMessage(content, isUser) {
  const messagesDiv = document.getElementById('response');
  const messageElement = document.createElement('div');
  messageElement.className = `message ${isUser ? 'user-message' : 'bot-message'}`;
  messageElement.innerHTML = content;
  messagesDiv.appendChild(messageElement);

  // Mostra o botão de limpar se houver mensagens
  updateClearButton();
  messagesDiv.scrollTop = messagesDiv.scrollHeight;
}

// Controla a visibilidade do botão Limpar
function updateClearButton() {
  const clearBtn = document.getElementById('clearButton');
  const hasMessages = document.querySelectorAll('.message').length > 0;
  clearBtn.classList.toggle('visible', hasMessages);
}

// Função para limpar o chat
function clearChat() {
  document.getElementById('response').innerHTML = '';
  updateClearButton();
}
async function sendMessage() {
  const input = document.getElementById('userInput');
  const userInput = input.value.trim();

  if (!userInput) return;

  addMessage(userInput, true);
  input.value = '';

  try {
    console.log("[DEBUG] Enviando mensagem:", userInput);

    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': 'Bearer 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',
        'HTTP-Referer': window.location.href,
        'X-Title': 'DevHub',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: "deepseek/deepseek-r1:free",
        messages: [{ role: 'user', content: userInput }]
      })
    });

    console.log("[DEBUG] Status da resposta:", response.status);

    if (!response.ok) {
      const errorDetails = await response.json();
      console.error("[DEBUG] Erro completo:", errorDetails);
      throw new Error(errorDetails.error?.message || "Erro na API");
    }

    const data = await response.json();
    console.log("[DEBUG] Resposta completa:", data);

    const resposta = data.choices[0].message.content;
    addMessage(resposta, false);

  } catch (error) {
    console.error("[DEBUG] Erro capturado:", error);
    addMessage(`❌ Erro: ${error.message}`, false);
  }
}

// Event Listeners
document.getElementById('clearButton').addEventListener('click', clearChat);
document.getElementById('userInput').addEventListener('keypress', (e) => {
  if (e.key === 'Enter') sendMessage();
});