import { LitElement, html } from "lit";

export class LoginPage extends LitElement {
  static properties = {
    username: { type: String },
    password: { type: String },
    isLoading: { type: Boolean },
    errorMessage: { type: String },
  };

  constructor() {
    super();
    this.username = "manager";
    this.password = "test";
    this.isLoading = false;
    this.errorMessage = "";
  }

  handleInput(e) {
    this[e.target.name] = e.target.value;
    this.requestUpdate();
  }

  async handleSubmit(e) {
    e.preventDefault();
    this.isLoading = true;
    this.errorMessage = "";
    this.requestUpdate();

    try {
      const response = await fetch("http://localhost:8080/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: this.username,
          password: this.password,
        }),
        credentials: "include",
        mode: "cors"
      });

      if (!response.ok) {
        throw new Error((await response.text()) || "Échec de la connexion");
      }

      const data = await response.json();
      console.log("Login successful:", data);
    } catch (error) {
      this.errorMessage = error.message.includes("Failed to fetch")
        ? "Erreur de connexion au serveur"
        : error.message;
    } finally {
      this.isLoading = false;
      this.requestUpdate();
    }
  }

  render() {
    return html`
      <div class="login-container">
        <h2>Connexion</h2>

        <form @submit=${this.handleSubmit}>
          <div class="form-group">
            <label for="username">Nom d'utilisateur:</label>
            <input
              type="text"
              id="username"
              name="username"
              .value=${this.username}
              @input=${this.handleInput}
              required
              ?disabled=${this.isLoading}
            />
          </div>

          <div class="form-group">
            <label for="password">Mot de passe:</label>
            <input
              type="password"
              id="password"
              name="password"
              .value=${this.password}
              @input=${this.handleInput}
              required
              ?disabled=${this.isLoading}
            />
          </div>

          ${this.errorMessage
            ? html`<div class="error">${this.errorMessage}</div>`
            : ""}

          <button type="submit" ?disabled=${this.isLoading}>
            ${this.isLoading ? "Connexion en cours..." : "Se connecter"}
          </button>
        </form>
      </div>

      <style>
        .login-container {
          max-width: 400px;
          margin: 2rem auto;
          padding: 2rem;
          border: 1px solid #e0e0e0;
          border-radius: 8px;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        }

        h2 {
          text-align: center;
          color: #333;
          margin-bottom: 1.5rem;
        }

        .form-group {
          margin-bottom: 1rem;
        }

        label {
          display: block;
          margin-bottom: 0.5rem;
          font-weight: 500;
        }

        input {
          width: 100%;
          padding: 0.75rem;
          border: 1px solid #ddd;
          border-radius: 4px;
          font-size: 1rem;
        }

        button {
          width: 100%;
          padding: 0.75rem;
          background-color: #4285f4;
          color: white;
          border: none;
          border-radius: 4px;
          font-size: 1rem;
          cursor: pointer;
          margin-top: 1rem;
        }

        button:disabled {
          background-color: #cccccc;
          cursor: not-allowed;
        }

        .error {
          color: #d32f2f;
          margin: 1rem 0;
          text-align: center;
        }
      </style>
    `;
  }
}

customElements.define("login-page", LoginPage);
