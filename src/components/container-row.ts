import {css, html, LitElement} from 'lit';
import {customElement, property} from 'lit/decorators.js';


@customElement('container-column')
export class ContainerRow extends LitElement {

    @property({attribute: true})
    accessor title: string = null;

    static styles = css`
    `;

    render() {
        return html`
            <div>
                <h2>${this.title}</h2>
                <slot></slot>
            </div>
        `;
    }
}
