import {css, html, LitElement} from 'lit';
import {customElement, property} from 'lit/decorators.js';


@customElement('container-page')
export class ContainerPage extends LitElement {

    @property({attribute: true})
    accessor title: string = null;

    static styles = css`
        .page {
            margin: 5px;
        }
        
        h2 {
            text-align: center;
        }
    `;

    render() {
        return html`
            <div class="page">
                <h2>${this.title}</h2>
                <slot></slot>
            </div>
        `;
    }
}
