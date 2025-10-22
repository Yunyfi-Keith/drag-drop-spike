import {css, html, LitElement} from 'lit';
import {customElement} from 'lit/decorators.js';

@customElement('design-wrapper')
export class DesignWrapper extends LitElement {

    static styles =
        css`
            .design-wrapper {
                padding: 10px;
                background: #2c2c2c;
                border: 2px solid #2c2c2c;
                transition: all 0.3s cubic-bezier(0.4, 0.0, 0.2, 1);
            }

            slot {
                display: block;
                border: 2px solid #ff6600;
                padding: 5px;
            }
        `;

    render() {
        return html`
            <div draggable="true" class="design-wrapper">
                <slot></slot>
            </div>
        `;
    }
}


