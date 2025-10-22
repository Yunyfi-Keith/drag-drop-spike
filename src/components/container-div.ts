import {css, html, LitElement} from 'lit';
import {customElement, property} from 'lit/decorators.js';


@customElement('container-div')
export class ContainerDiv extends LitElement {

    static styles = css`
    `;

    render() {
        return html`
            <div>
                <slot></slot>
            </div>
        `;
    }
}
