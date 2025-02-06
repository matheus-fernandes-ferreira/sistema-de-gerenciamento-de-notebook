const container = document.getElementById("notestatus");
const quantidadeElement = document.querySelector(".formInputHome1 p"); // Selecione o elemento de quantidade

let quantidade = 0; // Variável para armazenar a quantidade de notebooks selecionados

for (let i = 1; i <= 20; i++) { // Começar de 1, incluindo o "01"
  const div = document.createElement("div");
  div.classList.add("radio-inputs");

  const label = document.createElement("label");

  const input = document.createElement("input");
  input.classList.add("radio-input");
  input.type = "checkbox";
  input.name = "engine"; // Todos os inputs terão o mesmo nome para comportamento de rádio
  input.value = i; // Definindo o valor corretamente, por exemplo "1", "2", etc.

  const spanTile = document.createElement("span");
  spanTile.classList.add("radio-tile");

  const spanIcon = document.createElement("span");
  spanIcon.classList.add("radio-icon");

  const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  svg.setAttribute("xmlns", "http://www.w3.org/2000/svg");
  svg.setAttribute("viewBox", "0 0 640 512");
  svg.innerHTML =
    '<path d="M128 32C92.7 32 64 60.7 64 96l0 256 64 0 0-256 384 0 0 256 64 0 0-256c0-35.3-28.7-64-64-64L128 32zM19.2 384C8.6 384 0 392.6 0 403.2C0 445.6 34.4 480 76.8 480l486.4 0c42.4 0 76.8-34.4 76.8-76.8c0-10.6-8.6-19.2-19.2-19.2L19.2 384z"/>';

  spanIcon.appendChild(svg);

  const spanLabel = document.createElement("span");
  spanLabel.classList.add("radio-label");
  spanLabel.textContent = i.toString().padStart(2, "0"); // Exibe números como "01", "02", etc.

  spanTile.appendChild(spanIcon);
  spanTile.appendChild(spanLabel);

  label.appendChild(input);
  label.appendChild(spanTile);

  div.appendChild(label);

  container.appendChild(div);

  // Adiciona o evento de mudança para atualizar a quantidade
  input.addEventListener("change", function() {
    if (input.checked) {
     quantidade++; // Incrementa a quantidade se o checkbox for selecionado
    } else {
      quantidade --; // Decrementa se o checkbox for desmarcado
    }
    quantidadeElement.textContent = quantidade; // Atualiza o número exibido em "Quantidade"
  });
}

// Obtém o elemento onde a data será exibida
const dataElemento = document.querySelector("#maindireita p");

// Cria uma nova instância de Date para obter a data e hora atuais
const dataAtual = new Date();

// Formata a data e hora no formato desejado (ex: 28/01/2025 14:30)
const dataFormatada = dataAtual.toLocaleString("pt-BR", {
  year: 'numeric',
  month: 'long', // Mês completo (ex: janeiro)
  day: 'numeric',
});

// Adiciona a data formatada ao parágrafo
dataElemento.innerHTML = `Notebooks Disponíveis dia ${dataFormatada} .`;