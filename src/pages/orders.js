import { LitElement, html, css } from 'lit';

export class OrdersPage extends LitElement {
  static styles = css`
    table {
      width: 100%;
      border-collapse: collapse;
      margin-top: 1rem;
    }

    th,
    td {
      border: 1px solid #ccc;
      padding: 0.5rem;
      text-align: center;
    }

    form {
      margin-bottom: 1rem;
    }

    button {
      cursor: pointer;
    }

    .cancel-button {
      background: none;
      border: none;
      color: red;
      font-weight: bold;
      font-size: 1.2rem;
    }

    .error-message {
      color: red;
      white-space: pre-line;
      margin-bottom: 1rem;
    }

    .empty-state {
      text-align: center;
      margin-top: 2rem;
      color: #666;
      font-size: 1.1rem;
      line-height: 1.6;
    }
  `;

  static properties = {
    orders: { type: Array },
    inputValue: { type: String },
    errorMessage: { type: String },
  };

  constructor() {
    super();
    this.orders = [];
    this.inputValue = '';
    this.errorMessage = '';
  }

  connectedCallback() {
    super.connectedCallback();
    this.fetchOrders();
  }

  async fetchOrders() {
    const userStatus = localStorage.getItem('userStatus');
    const storeId = parseInt(localStorage.getItem('storeId'));

    let url = 'http://localhost:8080/orders';

    if (userStatus !== 'manager') {
      if (!storeId || isNaN(storeId)) {
        this.errorMessage = 'Magasin invalide ou non défini.';
        return;
      }
      url = `http://localhost:8080/orders/${storeId}`;
    }

    try {
      const res = await fetch(url);
      const json = await res.json();
      this.orders = json.data;
    } catch (err) {
      console.error('Erreur lors du fetch des commandes:', err);
    }
  }

  handleInputChange(e) {
    this.inputValue = e.target.value;
    this.errorMessage = '';
  }

  async submitOrder(e) {
    e.preventDefault();

    const ids = this.inputValue
      .split(',')
      .map((id) => parseInt(id.trim()))
      .filter((n) => !isNaN(n));

    if (ids.length === 0) return;

    const storeId = parseInt(localStorage.getItem('storeId'));
    if (isNaN(storeId)) {
      this.errorMessage = 'Aucun magasin sélectionné.';
      return;
    }

    try {
      const res = await fetch('http://localhost:8080/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ids, store_id: storeId }),
      });

      const json = await res.json();

      if (json.status === 'success') {
        this.inputValue = '';
        this.errorMessage = '';
        await this.fetchOrders();
      } else {
        this.errorMessage = json.errors
          ? json.errors.join('\n')
          : json.message || 'Erreur inconnue';
      }
    } catch (err) {
      this.errorMessage = 'Erreur de communication avec le serveur.';
      console.error("Erreur lors de l'ajout de commande:", err);
    }
  }

  async cancelOrder(orderId) {
    try {
      await fetch(`http://localhost:8080/orders/${orderId}`, {
        method: 'PUT',
      });
      await this.fetchOrders();
    } catch (err) {
      console.error(
        `Erreur lors de l'annulation de la commande ${orderId}:`,
        err
      );
    }
  }

  render() {
    return html`
      <h2>Commandes</h2>

      ${this.errorMessage
        ? html`<div class="error-message">${this.errorMessage}</div>`
        : ''}

      <form @submit=${this.submitOrder}>
        <label>
          Produits (ex: 1,1,2,2,2):
          <input
            type="text"
            .value=${this.inputValue}
            @input=${this.handleInputChange}
            required
          />
        </label>
        <button type="submit">Ajouter commande</button>
      </form>

      ${this.orders.length === 0
        ? html`
            <div class="empty-state">
              <p>📦 Aucune commande n’a encore été passée.</p>
              <p>Ajoutez des produits ci-dessus pour commencer une commande.</p>
            </div>
          `
        : html`
            <table>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Produits</th>
                  <th>Prix Total</th>
                  <th>Statut</th>
                  <th>Utilisateur</th>
                  <th>Magasin</th>
                  <th>Annuler</th>
                </tr>
              </thead>
              <tbody>
                ${this.orders.map(
                  (order) => html`
                    <tr>
                      <td>${order.id}</td>
                      <td>${order.products.join(', ')}</td>
                      <td>${order.total_price.toFixed(2)}</td>
                      <td>${order.status}</td>
                      <td>${order.user_id}</td>
                      <td>${order.store_id}</td>
                      <td>
                        ${order.status.toLowerCase() !== 'cancelled'
                          ? html`<button
                              class="cancel-button"
                              @click=${() => this.cancelOrder(order.id)}
                              title="Annuler"
                            >
                              ✕
                            </button>`
                          : html`<span style="color: gray;">–</span>`}
                      </td>
                    </tr>
                  `
                )}
              </tbody>
            </table>
          `}
    `;
  }
}

customElements.define('orders-page', OrdersPage);
