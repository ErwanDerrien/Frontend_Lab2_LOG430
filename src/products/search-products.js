import { LitElement, html, css } from "lit";

export class SearchProductsPage extends LitElement {
  static styles = css`
    :host {
      display: block;
      padding: 20px;
      max-width: 800px;
      margin: 0 auto;
    }

    .search-container {
      margin-bottom: 20px;
      display: flex;
      gap: 10px;
    }

    input {
      padding: 10px;
      font-size: 16px;
      flex-grow: 1;
      border: 1px solid #ccc;
      border-radius: 4px;
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
      margin-top: 20px;
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
    searchTerm: { type: String },
    products: { type: Array },
    isLoading: { type: Boolean },
    error: { type: String },
  };

  constructor() {
    super();
    this.searchTerm = "";
    this.products = [];
    this.isLoading = false;
    this.error = "";
  }

  connectedCallback() {
    super.connectedCallback();
    this.loadAllProducts(); // Charge tous les produits au chargement de la page
  }

  render() {
    return html`
      <h1 style="color: blue">Recherche de Produits</h1>

      <div class="search-container">
        <input
          type="text"
          .value=${this.searchTerm}
          @input=${(e) => (this.searchTerm = e.target.value)}
          placeholder="Entrez un terme de recherche..."
          ?disabled=${this.isLoading}
          @keyup=${(e) => e.key === "Enter" && this.handleSearch()}
        />
        <button @click=${this.handleSearch} ?disabled=${this.isLoading}>
          ${this.isLoading ? "Recherche..." : "Rechercher"}
        </button>
      </div>

      ${this.error ? html`<div class="error">${this.error}</div>` : ""}
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
                    </tr>
                  `
                )}
              </tbody>
            </table>
          `
        : html`<p>Aucun produit à afficher</p>`}
    `;
  }

  async handleSearch() {
    if (!this.searchTerm.trim()) {
      await this.loadAllProducts(); // Si recherche vide, charge tous les produits
      return;
    }

    this.isLoading = true;
    this.error = "";

    try {
      const response = await fetch(
        `http://localhost:8080/products/${encodeURIComponent(this.searchTerm)}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          mode: "cors",
        }
      );

      if (!response.ok) {
        throw new Error("Erreur lors de la recherche");
      }

      const data = await response.json();

      if (data.status === "success") {
        this.products = data.data || [];
      } else {
        throw new Error(data.message || "Erreur inconnue");
      }
    } catch (err) {
      this.error = err.message;
      this.products = [];
    } finally {
      this.isLoading = false;
    }
  }

  async loadAllProducts() {
    this.isLoading = true;
    this.error = "";

    try {
      const response = await fetch("http://localhost:8080/products", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        mode: "cors",
      });

      if (!response.ok) {
        throw new Error("Erreur lors du chargement des produits");
      }

      const data = await response.json();

      if (data.status === "success") {
        this.products = data.data || [];
      } else {
        throw new Error(data.message || "Erreur inconnue");
      }
    } catch (err) {
      this.error = err.message;
      this.products = [];
    } finally {
      this.isLoading = false;
    }
  }
}

customElements.define("search-products-page", SearchProductsPage);
