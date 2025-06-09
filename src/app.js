import { LitElement, html } from 'lit';
import { Router } from '@lit-labs/router';
import './pages/login.js';
import './pages/employee.js';
import './pages/manager.js';
import './pages/products.js';
import './pages/products-restock.js';
import './pages/orders.js';
import './pages/home.js';

class AppRouter extends LitElement {
  static properties = {
    userStatus: { type: String },
  };

  #router;

  constructor() {
    super();
    this.userStatus = localStorage.getItem('userStatus') || null;

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
          this._requireRole(
            'employee',
            () => html`<employee-dashboard></employee-dashboard>`
          ),
      },
      {
        path: '/products',
        render: () =>
          this._requireRole(
            ['employee', 'manager'],
            () => html`<products-page></products-page>`
          ),
      },
      {
        path: '/products-restock',
        render: () =>
          this._requireRole(
            ['employee'],
            () => html`<products-restock-page></products-restock-page>`
          ),
      },
      {
        path: '/orders',
        render: () =>
          this._requireRole(
            ['employee', 'manager'],
            () => html`<orders-page></orders-page>`
          ),
      },
      {
        path: '/manager-dashboard',
        render: () =>
          this._requireRole(
            'manager',
            () => html`<manager-dashboard></manager-dashboard>`
          ),
      },
    ]);

    window.addEventListener('popstate', () => this.requestUpdate());
  }

  render() {
    return html`
      <nav>
        <a href="/" @click=${this._navigate}>Accueil</a>
        ${!this.userStatus
          ? html`| <a href="/login" @click=${this._navigate}>Login</a>`
          : html`
              ${this.userStatus === 'employee'
                ? html`
                    |
                    <a href="/employee-dashboard" @click=${this._navigate}
                      >Dashboard Employé</a
                    >
                    |
                    <a href="/products" @click=${this._navigate}>Produits</a> |
                    <a href="/products-restock" @click=${this._navigate}>Réapprovisionnement</a> |
                    <a href="/orders" @click=${this._navigate}>Commandes</a>
                  `
                : this.userStatus === 'manager'
                ? html`
                    |
                    <a href="/manager-dashboard" @click=${this._navigate}
                      >Dashboard Gestionnaire</a
                    >
                    |
                    <a href="/products" @click=${this._navigate}>Produits</a> |
                    <a href="/orders" @click=${this._navigate}>Commandes</a>
                  `
                : ''}
              | <button @click=${this._logout}>Se déconnecter</button>
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

  _requireRole(allowedRoles, renderFn) {
    const currentStatus = localStorage.getItem('userStatus');
    const roles = Array.isArray(allowedRoles) ? allowedRoles : [allowedRoles];

    if (!roles.includes(currentStatus)) {
      this.#router.goto('/login');
      return html``;
    }

    return renderFn();
  }

  _onLoginSuccess(e) {
    const status = e.detail.status;
    localStorage.setItem('userStatus', status);
    this.userStatus = status;

    const defaultPath =
      status === 'manager' ? '/manager-dashboard' : '/employee-dashboard';
    this.#router.goto(defaultPath);
    this.requestUpdate();
  }

  _logout() {
    localStorage.removeItem('userStatus');
    this.userStatus = null;
    this.#router.goto('/');
    this.requestUpdate();
  }
}

customElements.define('app-router', AppRouter);
