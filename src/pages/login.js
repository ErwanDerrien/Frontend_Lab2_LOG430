import { LitElement, html } from 'lit';

export class Login extends LitElement {
  static properties = {
    username: { type: String },
    password: { type: String },
    storeId: { type: Number },
    role: { type: String },
    isLoading: { type: Boolean },
    errorMessage: { type: String },
  };

  constructor() {
    super();
    this.username = 'employee';
    this.password = 'test';
    this.storeId = 1;
    this.role = 'employee'; // 'employee' ou 'manager'
    this.isLoading = false;
    this.errorMessage = '';
  }

  handleInput(e) {
    const { name, value } = e.target;

    if (name === 'role') {
      this.role = value;
      // Quand on change de rôle, ajuste storeId
      this.storeId = value === 'manager' ? 0 : 1;
    } else if (name === 'storeId') {
      // Se met à jour seulement si role = employee
      if (this.role === 'employee') {
        this.storeId = Number(value);
      }
    } else {
      this[name] = value;
    }

    this.requestUpdate();
  }

  async handleSubmit(e) {
    e.preventDefault();

    if (this.role === 'employee' && (this.storeId < 1 || this.storeId > 5)) {
      this.errorMessage = 'Veuillez sélectionner un magasin valide (1-5)';
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';
    this.requestUpdate();

    try {
      const response = await fetch('http://localhost:8080/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: this.username,
          password: this.password,
          store_id: this.storeId,
        }),
        credentials: 'include',
        mode: 'cors',
      });

      if (!response.ok) {
        throw new Error((await response.text()) || 'Échec de la connexion');
      }

      const data = await response.json();
      console.log('Login successful:', data);

      if (data.status === 'employee' || data.status === 'manager') {
        localStorage.setItem('userStatus', data.status);
        localStorage.setItem('storeId', this.storeId.toString());

        this.dispatchEvent(
          new CustomEvent('login-success', {
            detail: {
              status: data.status,
              storeId: Number(this.storeId),
            },
            bubbles: true,
            composed: true,
          })
        );
      } else {
        throw new Error('Rôle utilisateur non reconnu.');
      }
    } catch (error) {
      this.errorMessage = error.message.includes('Failed to fetch')
        ? 'Erreur de connexion au serveur'
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
          <div class="form-group radio-group">
            <label>
              <input
                type="radio"
                name="role"
                value="employee"
                ?checked=${this.role === 'employee'}
                @change=${this.handleInput}
              />
              Employé
            </label>
            <label>
              <input
                type="radio"
                name="role"
                value="manager"
                ?checked=${this.role === 'manager'}
                @change=${this.handleInput}
              />
              Gestionnaire
            </label>
          </div>

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

          ${this.role === 'employee'
            ? html`
                <div class="form-group">
                  <label for="storeId">Magasin (1-5):</label>
                  <select
                    id="storeId"
                    name="storeId"
                    .value=${this.storeId}
                    @change=${this.handleInput}
                    required
                    ?disabled=${this.isLoading}
                  >
                    ${[1, 2, 3, 4, 5].map(
                      (num) =>
                        html`<option value=${num}>Magasin ${num}</option>`
                    )}
                  </select>
                </div>
              `
            : ''}
          ${this.errorMessage
            ? html`<div class="error">${this.errorMessage}</div>`
            : ''}

          <button type="submit" ?disabled=${this.isLoading}>
            ${this.isLoading ? 'Connexion en cours...' : 'Se connecter'}
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

        .radio-group {
          display: inline-flex;
          gap: 2rem;
          margin-bottom: 1rem;
          align-items: center;
        }

        label {
          font-weight: 500;
          cursor: pointer;
          user-select: none;
        }

        input[type='text'],
        input[type='password'],
        select {
          width: 100%;
          padding: 0.75rem;
          border: 1px solid #ddd;
          border-radius: 4px;
          font-size: 1rem;
        }

        input[type='radio'] {
          margin-right: 0.5rem;
          cursor: pointer;
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

customElements.define('login-page', Login);
