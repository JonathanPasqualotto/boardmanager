// Carrega o EmailJS e inicializa
document.addEventListener("DOMContentLoaded", function () {

    // Carrega a biblioteca EmailJS dinamicamente
    const script = document.createElement("script");
    script.src = "https://cdn.jsdelivr.net/npm/@emailjs/browser@4/dist/email.min.js";
    script.onload = function () {
        emailjs.init({
            publicKey: "iAqh4FvuztSWkhI7Q",
            blockHeadless: true,
            blockList: {
                list: ["foo@emailjs.com", "bar@emailjs.com"],
                watchVariable: "boardmanagerfutebol@gmail.com",
            },
            limitRate: {
                id: "app",
                throttle: 10000, // 1 requisição a cada 10s
            },
        });

    };
    document.head.appendChild(script);

    // Adiciona evento ao formulário quando o DOM estiver carregado
    const form = document.getElementById("pre_venda");
    if (form) {
        form.addEventListener("submit", function (event) {
            event.preventDefault(); // Impede o envio padrão


            emailjs.sendForm("service_8bjarow", "template_7h1961s", "#pre_venda").then(
                (response) => {
                    if (response.status === 200){
                        // window.location.href = window.location.href;
                    }
                },
                (error) => {
                    console.log("FAILED...", error);
                }
            );

            emailjs.sendForm("service_8bjarow","template_y2pb60g", "#pre_venda").then(
                (response) => {
                    if (response.status === 200){
                        window.location.href = window.location.href;
                    }
                },
                (error) => {
                    console.log("FAILED...", error);
                }
            )

        });
    }
});