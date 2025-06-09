import { LitElement, html, css } from 'lit';

export class ManagerDashboard extends LitElement {
  static properties = {
    reportData: { type: Object },
    loading: { type: Boolean },
    error: { type: String },
  };

  constructor() {
    super();
    this.reportData = null;
    this.loading = true;
    this.error = null;
  }

  connectedCallback() {
    super.connectedCallback();
    this._fetchReport();
  }

  async _fetchReport() {
    this.loading = true;
    this.error = null;
    try {
      const response = await fetch('http://localhost:8080/orders/report', {
        method: 'GET',
        credentials: 'include',
        mode: 'cors',
      });

      if (!response.ok) {
        throw new Error((await response.text()) || 'Échec de la récupération');
      }

      const data = await response.json();
      this.reportData = data.data.detailed_report;
    } catch (error) {
      this.error = error.message.includes('Failed to fetch')
        ? 'Erreur de connexion au serveur'
        : error.message;
    } finally {
      this.loading = false;
      this.requestUpdate();
    }
  }

  render() {
    if (this.loading) return html`<p>Chargement du tableau de bord...</p>`;
    if (this.error) return html`<p>Erreur : ${this.error}</p>`;
    if (!this.reportData) return html`<p>Aucune donnée disponible.</p>`;

    const sales = this.reportData.sales_by_store;
    const stock = this.reportData.remaining_stock;

    return html`
      <div class="dashboard">
        <h2>Tableau de bord du gestionnaire</h2>

        <section>
          <h3>Chiffre d'affaires par magasin</h3>
          <table>
            <thead>
              <tr>
                <th>ID Magasin</th>
                <th>Commandes complétées</th>
                <th>Commandes annulées</th>
                <th>Total commandes</th>
                <th>Revenu total ($)</th>
              </tr>
            </thead>
            <tbody>
              ${sales.map(
                (store) => html`
                  <tr>
                    <td>${store.store_id}</td>
                    <td>${store.completed_orders}</td>
                    <td>${store.cancelled_orders}</td>
                    <td>${store.total_orders}</td>
                    <td>${store.total_revenue.toFixed(2)}</td>
                  </tr>
                `
              )}
            </tbody>
          </table>
        </section>

        <section>
          <h3>Alertes de stock par magasin</h3>
          ${stock.map(
            (entry) => html`
              <div class="store-stock">
                <h4>Magasin #${entry.store_id} - Stock total : ${entry.total_stock}</h4>
                <ul>
                  ${entry.products_detail.map(
                    (product) =>
                      product.stock < 15
                        ? html`<li class="low-stock">
                            ⚠️ ${product.name} (${product.category}) : ${product.stock} unités
                          </li>`
                        : html`<li>${product.name} (${product.category}) : ${product.stock} unités</li>`
                  )}
                </ul>
              </div>
            `
          )}
        </section>
      </div>
    `;
  }

  static styles = css`
    .dashboard {
      padding: 1.5rem;
      max-width: 1000px;
      margin: auto;
      font-family: sans-serif;
    }

    h2 {
      text-align: center;
      margin-bottom: 2rem;
    }

    table {
      width: 100%;
      border-collapse: collapse;
      margin-bottom: 2rem;
    }

    th,
    td {
      border: 1px solid #ccc;
      padding: 0.75rem;
      text-align: center;
    }

    th {
      background-color: #f0f0f0;
    }

    section {
      margin-bottom: 2rem;
    }

    .store-stock {
      margin-bottom: 1.5rem;
      padding: 1rem;
      border: 1px solid #ddd;
      border-radius: 8px;
      background-color: #fafafa;
    }

    .low-stock {
      color: #b30000;
      font-weight: bold;
    }

    ul {
      list-style-type: none;
      padding-left: 1rem;
    }

    li {
      margin: 0.5rem 0;
    }
  `;
}

customElements.define('manager-dashboard', ManagerDashboard);
