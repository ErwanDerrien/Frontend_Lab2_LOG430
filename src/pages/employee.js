import { LitElement, html, css } from "lit";

export class EmployeeDashboard extends LitElement {
  static styles = css`
    .dashboard {
      font-family: "Arial", sans-serif;
      max-width: 800px;
      margin: 2rem auto;
      padding: 2rem;
      box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
      border-radius: 8px;
      background: #f9f9f9;
    }

    h2 {
      color: #333;
      text-align: center;
      margin-bottom: 2rem;
    }

    .button-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(100px, 1fr));
      gap: 1rem;
    }

    button {
      padding: 1rem;
      border: none;
      border-radius: 6px;
      background: #4285f4;
      color: white;
      font-size: 1rem;
      cursor: pointer;
      transition: all 0.3s ease;
    }

    button:hover {
      background: #3367d6;
      transform: translateY(-2px);
    }

    .primary {
      background: #4285f4;
    }
    .secondary {
      background: #34a853;
    }
    .warning {
      background: #fbbc05;
    }
    .danger {
      background: #ea4335;
    }
    .info {
      background: #673ab7;
    }
  `;

  render() {
    return html`
      <div class="dashboard">
        <h2>Tableau de bord employé</h2>

        <div class="button-grid">
          <button
            class="primary"
            @click=${() => this.navigateTo("/products")}
          >
            <i>🔍</i> Produits
          </button>

          <button
            class="secondary"
            @click=${() => this.navigateTo("/orders")}
          >
            <i>🏖️</i> Commandes
          </button>
        </div>
      </div>
    `;
  }

  _handleClick(action) {
    console.log(`Action sélectionnée: ${action}`);
    // Ajoutez ici la logique pour chaque bouton
    this.dispatchEvent(
      new CustomEvent("action-selected", {
        detail: { action },
        bubbles: true,
        composed: true,
      })
    );
  }

  navigateTo(path) {
    // Solution 1: Changement d'URL simple
    window.history.pushState({}, "", path);

    // Solution 2: Avec un event personnalisé (si vous utilisez un routeur)
    this.dispatchEvent(
      new CustomEvent("navigate", {
        detail: { path },
        bubbles: true,
        composed: true,
      })
    );

    // Solution 3: Rechargement complet si nécessaire
    window.location.href = path;
  }
}

customElements.define("employee-dashboard", EmployeeDashboard);
