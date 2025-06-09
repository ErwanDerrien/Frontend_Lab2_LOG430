import { LitElement, html } from 'lit';
import { Router } from '@lit-labs/router';
import './login/login.js';
import './dashboards/employee.js';
import './products/products.js'
import './orders/orders.js'


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
      path: '/products-page',
      render: () => html`<products-page></products-page>`
    },
    { 
      path: '/orders',
      render: () => html`<orders-page></orders-page>`
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
        <a href="/products-page" @click=${this._navigate}>Products Page</a>
        <a href="/orders" @click=${this._navigate}>Orders Page</a>
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