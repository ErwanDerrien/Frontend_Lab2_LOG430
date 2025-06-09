import { LitElement, html, css } from "lit";

export class HomePage extends LitElement {
  static properties = {
    isLoggedIn: { type: Boolean },
  };

  static styles = css`
    :host {
      display: block;
      font-family: Arial, sans-serif;
      text-align: center;
      padding: 40px 20px;
      background-color: #f9f9f9;
      color: #333;
    }

    h1 {
      font-size: 2.5rem;
      margin-bottom: 1rem;
      color: #2c3e50;
    }

    p {
      font-size: 1.2rem;
      max-width: 600px;
      margin: 0 auto 2rem;
    }

    .highlight {
      font-weight: bold;
      color: #4285f4;
    }

    a.login-button {
      display: inline-block;
      padding: 12px 24px;
      background-color: #4285f4;
      color: white;
      border-radius: 6px;
      text-decoration: none;
      font-size: 1rem;
      transition: background-color 0.3s ease;
    }

    a.login-button:hover {
      background-color: #3367d6;
    }
  `;

  constructor() {
    super();
    this.isLoggedIn = localStorage.getItem("userStatus") === "employee";
  }

  render() {
    return html`
      <h1>Bienvenue dans le système de caisse</h1>
      <p>
        Ce logiciel vous permet de
        <span class="highlight">gérer les produits, les ventes</span> et de
        suivre votre inventaire en temps réel.
      </p>
      ${!this.isLoggedIn
        ? html`
            <a href="/login" class="login-button">Se connecter</a>
            <p>Veuillez vous connecter pour accéder aux fonctionnalités.</p>
          `
        : html``}
    `;
  }
}

customElements.define("home-page", HomePage);
