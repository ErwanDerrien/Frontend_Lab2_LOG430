import { LitElement, html } from 'lit';

export class ProductsPage extends LitElement {
  render() {
    return html`
      <h1 style="color: blue">Page Produits</h1>
      <p>Contenu spécifique à cette page</p>
    `;
  }
}

customElements.define('products-page', ProductsPage);