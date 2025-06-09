import { LitElement, html, css } from 'lit';

export class ProductsRestockPage extends LitElement {
  static styles = css`
    :host {
      display: block;
      padding: 20px;
      max-width: 800px;
      margin: 0 auto;
    }

    .header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 20px;
    }

    button {
      padding: 10px 20px;
      background-color: #4285f4;
      color: white;
      border: none;
      border-radius: 4px;
      cursor: pointer;
    }

    button:hover {
      background-color: #3367d6;
    }

    table {
      width: 100%;
      border-collapse: collapse;
      margin-top: 10px;
    }

    th,
    td {
      border: 1px solid #ddd;
      padding: 8px;
      text-align: left;
    }

    th {
      background-color: #f2f2f2;
    }

    .error {
      color: red;
      margin-top: 10px;
    }
  `;

  static properties = {
    products: { type: Array },
    isLoading: { type: Boolean },
    error: { type: String },
  };

  constructor() {
    super();
    this.products = [];
    this.isLoading = false;
    this.error = '';
  }

  connectedCallback() {
    super.connectedCallback();
    this.loadCentralProducts(); // charge produits avec store_id === 0
  }

  render() {
    return html`
      <div class="header">
        <h1 style="color: blue">Produits du Stock Central</h1>
        <button @click=${this.handleRestock} ?disabled=${this.isLoading}>
          ${this.isLoading ? 'En cours...' : 'Réapprovisionner'}
        </button>
      </div>

      ${this.error ? html`<div class="error">${this.error}</div>` : ''}

      ${this.products.length > 0
        ? html`
            <table>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Nom</th>
                  <th>Catégorie</th>
                  <th>Prix</th>
                  <th>Stock</th>
                  <th>Magasin</th>
                </tr>
              </thead>
              <tbody>
                ${this.products.map(
                  (product) => html`
                    <tr>
                      <td>${product.id}</td>
                      <td>${product.name}</td>
                      <td>${product.category}</td>
                      <td>${product.price}</td>
                      <td>${product.stock_quantity}</td>
                      <td>${product.store_id}</td>
                    </tr>
                  `
                )}
              </tbody>
            </table>
          `
        : html`<p>Aucun produit à afficher</p>`}
    `;
  }

  async loadCentralProducts() {
    this.isLoading = true;
    this.error = '';

    try {
      const response = await fetch('http://localhost:8080/products/0', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        mode: 'cors',
      });

      if (!response.ok) {
        throw new Error('Erreur lors du chargement des produits');
      }

      const data = await response.json();

      if (data.status === 'success') {
        this.products = data.data || [];
      } else {
        throw new Error(data.message || 'Erreur inconnue');
      }
    } catch (err) {
      this.error = err.message;
      this.products = [];
    } finally {
      this.isLoading = false;
    }
  }

  async handleRestock() {
    this.isLoading = true;
    this.error = '';

    const storeId = localStorage.getItem('storeId');

    try {
      const response = await fetch(`http://localhost:8080/products/store/${storeId}/restock`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        mode: 'cors',
      });

      if (!response.ok) {
        throw new Error('Erreur lors du réapprovisionnement');
      }

      await this.loadCentralProducts();
    } catch (err) {
      this.error = err.message;
    } finally {
      this.isLoading = false;
    }
  }
}

customElements.define('products-restock-page', ProductsRestockPage);
