import { LitElement, html } from 'lit';
import { Router } from '@lit-labs/router';
import './login/login.js';
import './dashboards/employee.js';
import './products/search-products.js'


class AppRouter extends LitElement {
  #router = new Router(this, [
    { 
      path: '/',
      render: () => html`<h1>Accueil</h1>`
    },
    { 
      path: '/login',
      render: () => html`<login-page></login-page>`
    },
    { 
      path: '/employee-dashboard',
      render: () => html`<employee-dashboard-page></employee-dashboard-page>`
    },
    { 
      path: '/search-products-page',
      render: () => html`<search-products-page></search-products-page>`
    }
  ]);

  constructor() {
    super();
    window.addEventListener('popstate', () => this.requestUpdate());
  }

  render() {
    return html`
      <nav>
        <a href="/" @click=${this._navigate}>Accueil</a> |
        <a href="/login" @click=${this._navigate}>Login</a> |
        <a href="/employee-dashboard" @click=${this._navigate}>Employee Dashboard</a>
        <a href="/search-products-page" @click=${this._navigate}>Search Products Page</a>
      </nav>
      ${this.#router.outlet()}
    `;
  }

  _navigate(e) {
    e.preventDefault();
    history.pushState({}, '', e.target.href);
    this.#router.goto(e.target.pathname);
    this.requestUpdate();
  }
}

customElements.define('app-router', AppRouter);