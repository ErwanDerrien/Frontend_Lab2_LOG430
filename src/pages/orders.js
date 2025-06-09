import { LitElement, html, css } from "lit";

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
  `;

  static properties = {
    orders: { type: Array },
    inputValue: { type: String },
    errorMessage: { type: String },
  };

  constructor() {
    super();
    this.orders = [];
    this.inputValue = "";
    this.errorMessage = "";
  }

  connectedCallback() {
    super.connectedCallback();
    this.fetchOrders();
  }

  async fetchOrders() {
    try {
      const res = await fetch("http://localhost:8080/orders");
      const json = await res.json();
      this.orders = json.data;
    } catch (err) {
      console.error("Erreur lors du fetch des commandes:", err);
    }
  }

  handleInputChange(e) {
    this.inputValue = e.target.value;
    this.errorMessage = ""; // Clear error on input change
  }

  async submitOrder(e) {
    e.preventDefault();

    const ids = this.inputValue
      .split(",")
      .map((id) => parseInt(id.trim()))
      .filter((n) => !isNaN(n));

    if (ids.length === 0) return;

    try {
      const res = await fetch("http://localhost:8080/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ids }),
      });

      const json = await res.json();

      if (json.status === "success") {
        this.inputValue = "";
        this.errorMessage = "";
        await this.fetchOrders();
      } else {
        // Affiche les erreurs retournées par le backend
        this.errorMessage = json.errors
          ? json.errors.join("\n")
          : json.message || "Erreur inconnue";
      }
    } catch (err) {
      this.errorMessage = "Erreur de communication avec le serveur.";
      console.error("Erreur lors de l'ajout de commande:", err);
    }
  }

  async cancelOrder(orderId) {
    try {
      await fetch(`http://localhost:8080/orders/${orderId}`, {
        method: "PUT",
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
        : ""}

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

      <table>
        <thead>
          <tr>
            <th>ID</th>
            <th>Produits</th>
            <th>Prix Total</th>
            <th>Statut</th>
            <th>Utilisateur</th>
            <th>Annuler</th>
          </tr>
        </thead>
        <tbody>
          ${this.orders.map(
            (order) => html`
              <tr>
                <td>${order.id}</td>
                <td>${order.products.join(", ")}</td>
                <td>${order.total_price.toFixed(2)}</td>
                <td>${order.status}</td>
                <td>${order.user_id}</td>
                <td>
                  ${order.status.toLowerCase() !== "cancelled"
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
    `;
  }
}

customElements.define("orders-page", OrdersPage);
