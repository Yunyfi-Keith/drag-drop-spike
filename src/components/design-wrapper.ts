import {css, html, LitElement} from 'lit';
import {customElement, property} from 'lit/decorators.js';
import {NativeDragDropController} from './controllers/nativeDragDropController';

@customElement('design-wrapper')
export class DesignWrapper extends LitElement {

    private dragDropController = new NativeDragDropController(this);

    static styles =
        css`
            .design-wrapper {
                position: relative;

                padding: 10px;
                //background: #2c2c2c;
                border: 2px dashed transparent;
                transition: all 0.3s cubic-bezier(0.4, 0.0, 0.2, 1);
            }

            .design-wrapper:hover {
                border-color: #d3d3d3;
            }

            .design-wrapper.drag-over {
                background: #f0f0f0;
            }
            
            .design-wrapper::before {
                content: '';
                position: absolute;
                top: 0px;
                left: 0px;
                width: 16px;
                height: 16px;
                background-image: radial-gradient(circle, #999 1.5px, transparent 1.5px),
                radial-gradient(circle, #999 1.5px, transparent 1.5px),
                radial-gradient(circle, #999 1.5px, transparent 1.5px),
                radial-gradient(circle, #999 1.5px, transparent 1.5px),
                radial-gradient(circle, #999 1.5px, transparent 1.5px),
                radial-gradient(circle, #999 1.5px, transparent 1.5px);
                background-size: 6px 6px;
                background-position: 0 0, 6px 0, 0 6px, 6px 6px, 0 12px, 6px 12px;
                background-repeat: no-repeat;
                cursor: grab;
                opacity: 0.5;
            }

            .design-wrapper:hover::before {
                opacity: 1;
            }

            slot {

            }
        `;

    @property({attribute: true})
    accessor name: string = null;

    render() {
        return html`
            <div class="design-wrapper ${this.dragDropController.isDragOver ? 'drag-over' : ''}">
                <slot></slot>
            </div>
        `;
    }
}


