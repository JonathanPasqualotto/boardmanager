/**
 * Arquivo responsável pelas interações da Home Institucional do Board Manager.
 * Variáveis e funções nomeadas em PT-BR para facilitar a manutenção.
 */

document.addEventListener('DOMContentLoaded', () => {
    inicializarMenuMobile();
    inicializarNavegacaoSuave();
});

/**
 * Controla a abertura e fechamento do menu em dispositivos móveis.
 */
function inicializarMenuMobile() {
    const botaoMenuMobile = document.getElementById('botaoMenuMobile');
    const menuNavegacao = document.getElementById('menuNavegacao');
    
    if (!botaoMenuMobile || !menuNavegacao) return;

    botaoMenuMobile.addEventListener('click', () => {
        // Alterna a classe 'ativo' que desloca o menu para a visualização via CSS
        menuNavegacao.classList.toggle('ativo');
        
        // Alterna o ícone entre hambúrguer (abrir) e X (fechar)
        const icone = botaoMenuMobile.querySelector('i');
        if (menuNavegacao.classList.contains('ativo')) {
            icone.classList.remove('fa-bars');
            icone.classList.add('fa-xmark');
        } else {
            icone.classList.remove('fa-xmark');
            icone.classList.add('fa-bars');
        }
    });

    // Fecha o menu automaticamente quando um link interno é clicado
    const linksMenu = menuNavegacao.querySelectorAll('a');
    linksMenu.forEach(link => {
        link.addEventListener('click', () => {
            menuNavegacao.classList.remove('ativo');
            const icone = botaoMenuMobile.querySelector('i');
            icone.classList.remove('fa-xmark');
            icone.classList.add('fa-bars');
        });
    });
}

/**
 * Cria a animação de rolagem suave (smooth scroll) ao clicar nos links do menu.
 * Melhora a experiência de usuário (UX) focada em leitura.
 */
function inicializarNavegacaoSuave() {
    const linksInternos = document.querySelectorAll('a[href^="#"]');
    
    linksInternos.forEach(link => {
        link.addEventListener('click', function(evento) {
            const destinoDoLink = this.getAttribute('href');
            
            // Ignora se for apenas "#" ou um link quebrado
            if (destinoDoLink === '#') return;
            
            const elementoDestino = document.querySelector(destinoDoLink);
            
            if (elementoDestino) {
                evento.preventDefault();
                
                // Pega a altura do cabeçalho fixo para compensar a rolagem
                const alturaCabecalho = document.getElementById('cabecalho').offsetHeight;
                
                // Calcula a posição exata da seção na tela
                const posicaoDoElemento = elementoDestino.getBoundingClientRect().top;
                const offsetPosicao = posicaoDoElemento + window.pageYOffset - alturaCabecalho;
                
                window.scrollTo({
                    top: offsetPosicao,
                    behavior: 'smooth'
                });
            }
        });
    });
}