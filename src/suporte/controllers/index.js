document.addEventListener("DOMContentLoaded", function () {
    const formulario = document.getElementById("formulario-suporte");

    formulario.addEventListener("submit", function (event) {
        event.preventDefault(); // Impede o recarregamento da página

        // Captura os valores dos campos do formulário
        const inventario = document.querySelector("input[name='inventario']").value.trim();
        const sintese = document.querySelector("input[name='sintese']").value.trim();
        const tipoSolicitacao = document.getElementById("tipo-solicitacao").value;
        const subServico = document.getElementById("subservico").value;
        const descricaoProblema = document.getElementById("descricao-problema").value.trim();

        // Verifica se todos os campos foram preenchidos
        if (!sintese || !tipoSolicitacao || !subServico || !descricaoProblema) {
            alert("Por favor, preencha todos os campos obrigatórios.");
            return;
        }
        console.log(tipoSolicitacao);
        
    }
}