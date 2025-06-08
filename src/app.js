import { LitElement, html } from 'lit';
import { Router } from '@lit-labs/router';
import './products/products.js';

class AppRouter extends LitElement {
  #router = new Router(this, [
    { 
      path: '/',
      render: () => html`<h1>Accueil</h1>`
    },
    { 
      path: '/products',
      render: () => html`<products-page></products-page>`
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
        <a href="/products" @click=${this._navigate}>Produits</a>
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