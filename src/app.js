import { LitElement, html } from 'lit';
import { Router } from '@lit-labs/router';
import './pages/login.js';
import './pages/employee.js';
import './pages/products.js';
import './pages/orders.js';
import './pages/home.js';

class AppRouter extends LitElement {
  static properties = {
    isLoggedIn: { type: Boolean },
  };

  #router;

  constructor() {
    super();
    this.isLoggedIn = localStorage.getItem('userStatus') === 'employee';

    this.#router = new Router(this, [
      {
        path: '/',
        render: () => html`<home-page></home-page>`,
      },
      {
        path: '/login',
        render: () => html`
          <login-page @login-success=${this._onLoginSuccess}></login-page>
        `,
      },
      {
        path: '/employee-dashboard',
        render: () =>
          this._requireAuth(
            () => html`<employee-dashboard></employee-dashboard>`
          ),
      },
      {
        path: '/products',
        render: () =>
          this._requireAuth(() => html`<products-page></products-page>`),
      },
      {
        path: '/orders',
        render: () =>
          this._requireAuth(() => html`<orders-page></orders-page>`),
      },
    ]);

    window.addEventListener('popstate', () => this.requestUpdate());
  }

  render() {
    return html`
      <nav>
        <a href="/" @click=${this._navigate}>Accueil</a>
        ${!this.isLoggedIn
          ? html`| <a href="/login" @click=${this._navigate}>Login</a>`
          : html`
              |
              <a href="/employee-dashboard" @click=${this._navigate}
                >Dashboard</a
              >
              | <a href="/products" @click=${this._navigate}>Produits</a> |
              <a href="/orders" @click=${this._navigate}>Commandes</a> |
              <button @click=${this._logout}>Se déconnecter</button>
            `}
      </nav>
      ${this.#router.outlet()}
    `;
  }

  _navigate(e) {
    e.preventDefault();
    const path = new URL(e.target.href).pathname;
    this.#router.goto(path);
    history.pushState({}, '', path);
    this.requestUpdate();
  }

  _requireAuth(renderFn) {
    const isLoggedIn = localStorage.getItem('userStatus') === 'employee';
    if (!isLoggedIn) {
      this.#router.goto('/login');
      return html``;
    }
    return renderFn();
  }

  _onLoginSuccess(e) {
    const status = e.detail.status;
    localStorage.setItem('userStatus', status);
    this.isLoggedIn = true;
    this.#router.goto('/employee-dashboard');
    this.requestUpdate();
  }

  _logout() {
    localStorage.removeItem('userStatus');
    this.isLoggedIn = false;
    this.#router.goto('/login');
    this.requestUpdate();
  }
}

customElements.define('app-router', AppRouter);
