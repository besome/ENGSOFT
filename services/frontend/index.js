function newBook(book) {
    const div = document.createElement('div');
    div.className = 'column is-4';
    div.innerHTML = `
        <div class="card is-shady">
            <div class="card-image">
                <figure class="image is-4by3">
                    <img
                        src="${book.photo}"
                        alt="${book.name}"
                        class="modal-button"
                    />
                </figure>
            </div>
            <div class="card-content">
                <div class="content book" data-id="${book.id}">
                    <div class="book-meta">
                        <p class="is-size-4">R$${book.price.toFixed(2)}</p>
                        <p class="is-size-6">Disponível em estoque: 5</p>
                        <h4 class="is-size-3 title">${book.name}</h4>
                        <p class="subtitle">${book.author}</p>
                    </div>
                    <div class="field has-addons">
                        <div class="control">
                            <input class="input" type="text" placeholder="Digite o CEP" />
                        </div>
                        <div class="control">
                            <a class="button button-shipping is-info" data-id="${book.id}"> Calcular Frete </a>
                        </div>
                    </div>
                    <button class="button button-buy is-success is-fullwidth">Comprar</button>
                </div>
            </div>
        </div>`;
    return div;
}

async function SearchProductByID(id) {
    try {
        const response = await fetch(`http://localhost:3000/product/${id}`);
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || 'Erro ao buscar o livro');
        }
        const product = await response.json();
        
        // Exibe os dados do produto de forma mais amigável
        swal({
            title: product.name || "Livro sem nome",
            text: `
                ID: ${id}
                Autor: ${product.author || "Não informado"}
                Preço: R$ ${product.price?.toFixed(2) || "0,00"}
                Estoque: ${product.stock || "0"}
                ${product.description ? "\nDescrição: " + product.description : ""}
            `,
            icon: product.photo ? undefined : "info",
            content: {
                element: "img",
                attributes: {
                    src: product.photo || "https://via.placeholder.com/150",
                    alt: `Capa de ${product.name}`,
                    style: "max-width: 100%; max-height: 200px;"
                }
            },
            button: "Fechar"
        });
    } catch (err) {
        console.error('Falha na requisição:', err);
        swal('Erro', 'Não foi possível carregar o livro', 'error');
    }
}

function calculateShipping(id, cep) {
    fetch('http://localhost:3000/shipping/' + cep)
        .then((data) => {
            if (data.ok) {
                return data.json();
            }
            throw data.statusText;
        })
        .then((data) => {
            swal('Frete', `O frete é: R$${data.value.toFixed(2)}`, 'success');
        })
        .catch((err) => {
            swal('Erro', 'Erro ao consultar frete', 'error');
            console.error(err);
        });
}

document.addEventListener('DOMContentLoaded', function () {
    const books = document.querySelector('.books');

    fetch('http://localhost:3000/products')
        .then((data) => {
            if (data.ok) {
                return data.json();
            }
            throw data.statusText;
        })
        .then((data) => {
            if (data) {
                data.forEach((book) => {
                    books.appendChild(newBook(book));
                });

                document.querySelectorAll('.button-shipping').forEach((btn) => {
                    btn.addEventListener('click', (e) => {
                        const id = e.target.getAttribute('data-id');
                        const cep = document.querySelector(`.book[data-id="${id}"] input`).value;
                        calculateShipping(id, cep);
                    });
                });

                document.querySelectorAll('.button-buy').forEach((btn) => {
                    btn.addEventListener('click', (e) => {
                        swal('Compra de livro', 'Sua compra foi realizada com sucesso', 'success');
                    });
                });
            }
        })
        .catch((err) => {
            swal('Erro', 'Erro ao listar os produtos', 'error');
            console.error(err);
        });

         // Elementos do DOM
    const searchInput = document.getElementById('search-input');
    const searchButton = document.getElementById('search-button');

    // Função para disparar a busca
    const handleSearch = () => {
        const id = searchInput.value.trim();
        if (id) {
            SearchProductByID(id); // Chama sua função existente
        } else {
            swal('Aviso', 'Digite um ID válido', 'info'); // SweetAlert para feedback
        }
    };

    // Evento de clique no botão
    searchButton.addEventListener('click', handleSearch);

    // Evento de "Enter" no input
    searchInput.addEventListener('keyup', (e) => {
        if (e.key === 'Enter') {
            handleSearch();
        }
    });
});
