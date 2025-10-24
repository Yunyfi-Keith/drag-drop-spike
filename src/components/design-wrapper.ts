import {css, html, LitElement} from 'lit';
import {customElement, property} from 'lit/decorators.js';
import {classMap} from 'lit/directives/class-map.js';
import {NativeDragDropController} from './controllers/nativeDragDropController';

@customElement('design-wrapper')
export class DesignWrapper extends LitElement {

    private dragDropController = new NativeDragDropController(this);
    // private dragDropController = new InteractDragDropController(this);

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
                border-color: #a8a8a8;
            }

            .design-wrapper.drag-over {
                background: #a8a8a8;
            }

            .design-wrapper.drop-top {
                border-top: 3px solid #4CAF50;
            }

            .design-wrapper.drop-bottom {
                border-bottom: 3px solid #4CAF50;
            }

            .design-wrapper.drop-left {
                border-left: 3px solid #4CAF50;
            }

            .design-wrapper.drop-right {
                border-right: 3px solid #4CAF50;
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
        const quadrant = this.dragDropController.dropIndicatorQuadrant;
        const classes = {
            'design-wrapper': true,
            'drag-over': this.dragDropController.isDragOver,
            'drop-top': quadrant === 'upperLeft' || quadrant === 'upperRight',
            'drop-bottom': quadrant === 'lowerLeft' || quadrant === 'lowerRight',
            'drop-left': quadrant === 'upperLeft' || quadrant === 'lowerLeft',
            'drop-right': quadrant === 'upperRight' || quadrant === 'lowerRight'
        };
        return html`
            <div class="${classMap(classes)}">
                <slot></slot>
            </div>
        `;
    }
}


