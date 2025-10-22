import {css, html, LitElement} from 'lit';
import {customElement, property} from 'lit/decorators.js';

@customElement('content-box')
export class ContextBox extends LitElement {

    @property({attribute: true})
    accessor contents: string = null;

    static styles =
        css`
        `;

    render() {
        return html`
            <div>
                <slot></slot>
            </div>
        `;
    }
}


