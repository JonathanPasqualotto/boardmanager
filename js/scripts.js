
document.addEventListener('DOMContentLoaded', () => {
    inicializarMenuMobile();
    inicializarNavegacaoSuave();
    carregarEventosDinamicamente();
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

const dadosEventos = `[
    {
        "imagem": "imagens/ndtv.webp",
        "titulo": "Aprender futebol fica mais fácil com jogo de estratégia",
        "descricao": "Confira nossa participação e todos os detalhes desta reportagem completa diretamente no portal ND Mais.",
        "link": "https://ndmais.com.br/futebol/desabamento-atinge-central-de-gas-e-provoca-evacuacao-em-chapeco/"
    },
    {
        "imagem": "https://www.unoesc.edu.br/wp-content/uploads/2026/06/CAPAS-UNOESC-2026-06-10T165919.674.jpg",
        "titulo": "Destaque Acadêmico no Curso de Educação Física da Unoesc",
        "descricao": "O Board Manager™ tem se provado uma poderosa ferramenta de aprendizagem. No contexto acadêmico da Unoesc, o jogo foi utilizado para integrar o esporte à estratégia, estimulando ativamente o raciocínio tático e cognitivo dos futuros profissionais de Educação Física.",
        "link": "https://www.unoesc.edu.br/blog/jogo-board-manager-estimula-raciocinio-estrategico-no-curso-de-educacao-fisica-da-unoesc/"
    },
    {
        "imagem": "../imagens/uceff.webp",
        "titulo": "A CIÊNCIA DO JOGO CHEGOU À ACADEMIA!",
        "descricao": "Nesta última terça-feira (05/05), o Board Manager™ deu um passo histórico em sua trajetória científica. Estivemos na UCEFF apresentando nossa metodologia e as propriedades cognitivas do sistema para os acadêmicos de Psicologia.",
        "link": "https://www.instagram.com/p/DYAuH2VFRsr/?utm_source=ig_web_copy_link&igsh=MzRlODBiNWFlZA=="
    },    
    {
        "imagem": "../imagens/gremio.webp",
        "titulo": "Somando forças pelo futuro do futebol.",
        "descricao": "Ontem tivemos uma oportunidade valiosa de aprendizado e troca de experiências. Por intermédio do nosso colega Vinícius Brancher, aqui de Chapecó, pudemos apresentar a metodologia do Board Manager para quem vive o dia a dia da formação de elite no @gremio.",
        "link": "https://www.instagram.com/p/DXHCDR0lYik/?img_index=1"
    },    
    {
        "imagem": "../imagens/bordtopia.webp",
        "titulo": "A ciência encontra a estratégia! ",
        "descricao": "Tivemos o privilégio de realizar um encontro de validação técnica com @afonsowurzius CEO da @boardtopiaoficial.",
        "link": "https://www.instagram.com/p/DTbO5_1ET52/?img_index=2"
    },    
    {
        "imagem": "../imagens/amaoeste.webp",
        "titulo": "Gratidão e propósito na AMA Oeste.",
        "descricao": "Hoje o nosso sentimento é de profunda gratidão. Fomos recebidos com um carinho imenso pela Carol (Psicóloga) na @amaoeste , em Chapecó, para uma manhã de trocas muito especiais sobre o futuro e a inclusão.",
        "link": "https://www.instagram.com/p/DXHfuz6kSUB/"
    },    
    {
        "imagem": "../imagens/bompastor.webp",
        "titulo": "O domingo na E.E.B. Bom Pastor provou que o futuro do futebol é inteligente!",
        "descricao": "Ao lado do auditor @jonathanfilipe, acompanhei de perto dezenas de jovens talentos dominando a matriz 9x16 do Board Manager.",
        "link": "https://www.instagram.com/p/DXWv2XCjchk/"
    }            
]`;

function carregarEventosDinamicamente() {
    const containerEventos = document.getElementById('container-eventos');
    
    // Trava de segurança caso a div não seja encontrada
    if (!containerEventos) return; 

    try {
        // Converte o texto JSON em objetos manipuláveis do JavaScript
        const listaDeEventos = JSON.parse(dadosEventos);
        let htmlGerado = '';

        // Monta o template (Bootstrap 5) para cada evento cadastrado
        listaDeEventos.forEach(evento => {
            htmlGerado += `
                <article class="card h-100 shadow-sm border border-light rounded-4 overflow-hidden cartao-evento scale-hover transition-hover">
                    
                    ${evento.imagem && evento.imagem.trim() !== "" ? `
                    <div class="bg-secondary position-relative" style="height: 200px;">
                        <img src="${evento.imagem}" alt="${evento.descricao || 'Decrição do evento'}" title="${evento.titulo || 'Imagem do evento'}" loading="lazy" class="w-100 h-100 object-fit-cover">
                    </div>
                    ` : ''}
                    
                    <div class="card-body d-flex flex-column p-4">
                        
                        ${evento.titulo && evento.titulo.trim() !== "" ? `
                        <h3 class="card-title font-titulos fs-5 fw-bold text-dark mb-3">${evento.titulo}</h3>
                        ` : ''}
                        
                        ${evento.descricao && evento.descricao.trim() !== "" ? `
                        <p class="card-text text-secondary mb-4 flex-grow-1">${evento.descricao}</p>
                        ` : ''}
                        
                        ${evento.link && evento.link.trim() !== "" ? `
                        <a href="${evento.link}" target="_blank" rel="noopener noreferrer" class="btn btn-outline-success fw-bold mt-auto w-100">Ver detalhes</a>
                        ` : ''}
                        
                    </div>
                </article>
            `;
        });

        // Injeta os cartões preenchidos diretamente no HTML
        containerEventos.innerHTML = htmlGerado;

    } catch (erro) {
        // Log para manutenção em caso de falha de parsing no JSON
        console.error("Falha ao carregar lista de eventos:", erro);
        containerEventos.innerHTML = '<p class="text-danger">Não foi possível carregar os eventos no momento.</p>';
    }
}