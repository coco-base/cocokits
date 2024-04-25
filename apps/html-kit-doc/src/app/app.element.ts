import './app.element.scss';

export class AppElement extends HTMLElement {
  public static observedAttributes = [];

  connectedCallback() {
    this.innerHTML = `
     <h1>
        <span> Hello there, </span>
        Welcome html-kit-doc 👋
      </h1>
    `;
  }
}
customElements.define('app-root', AppElement);
