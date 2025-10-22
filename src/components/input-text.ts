import {css, html, LitElement} from 'lit';
import {customElement, property} from 'lit/decorators.js';

@customElement('input-text')
export class InputText extends LitElement {

    @property({attribute: true})
    accessor label: string = null;

    @property({attribute: true})
    accessor value: string = null;

    static styles =
        css`
        `;

    render() {
        return html`
            <div>
                <p>${this.label}</p>
                <input
                        id="my-id"
                        type="text"
                        .value="${this.value}"
                >
                </input>
            </div>
        `;
    }
}


