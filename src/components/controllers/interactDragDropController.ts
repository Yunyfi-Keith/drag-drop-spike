import {ReactiveController, ReactiveControllerHost} from 'lit';
import interact from 'interactjs';
import * as uuid from 'uuid';

export interface DragDropHost extends ReactiveControllerHost {
    id: string;
    name?: string;
}

export class InteractDragDropController implements ReactiveController {
    private host: DragDropHost;
    private _isDragOver = false;
    private interactable: ReturnType<typeof interact> | null = null;

    constructor(host: DragDropHost) {
        this.host = host;
        host.addController(this);
    }

    get isDragOver(): boolean {
        return this._isDragOver;
    }

    hostConnected() {
        // Generate UUID if not already set
        if (!this.host.id) {
            this.host.id = uuid.v4();
        }

        const element = this.host as unknown as HTMLElement;
        // // element.setAttribute('draggable', 'true');
        // // Make sure the element is positioned for drag to work properly
        // if (getComputedStyle(element).position === 'static') {
        //     element.style.position = 'relative';
        //     debugger;
        // }

        // Initialize interact.js on the element
        this.interactable = interact(element)
            .draggable({
                // Enable inertial throwing
                // // Keep the element within the area of its parent
                // modifiers: [
                //     interact.modifiers.restrictRect({
                //         restriction: 'parent',
                //         endOnly: true
                //     })
                // ],
                // Enable autoScroll
                // autoScroll: true,

                listeners: {
                    start: this.onDragStart,
                    move: this.onDragMove,
                    end: this.onDragEnd
                }
            })
            .dropzone({
                // Only accept elements matching this CSS selector
                accept: '[id]',
                // Require a 75% element overlap for a drop to be possible
               // overlap: 0.75,
                overlap: 0.1,
                // Check function for more control
                checker: (
                    dragEvent,
                    event,
                    dropped,
                    dropzone,
                    dropElement,
                    draggable,
                    draggableElement
                ) => {
                    // Prevent dropping on self
                    return dropElement !== draggableElement;
                },
                listeners: {
                    enter: this.onDropzoneEnter,
                    leave: this.onDropzoneLeave,
                    drop: this.onDrop
                }
            });
    }

    hostDisconnected() {
        // Clean up interact.js instance
        if (this.interactable) {
            this.interactable.unset();
            this.interactable = null;
        }
    }

    private onDragStart = (event: any) => {
        // const element = event.target as HTMLElement;
        //
        // // Store the element ID for later retrieval
        // element.dataset.dragId = this.host.id;
        //
        // // Add visual feedback
        // element.style.opacity = '0.5';

        console.log('dragstart', `${this.host.name}`, event);
    };

    private onDragMove = (event: any) => {
        const target = event.target as HTMLElement;

        // Keep the dragged position in the data-x/data-y attributes
        const x = (parseFloat(target.getAttribute('data-x') || '0')) + event.dx;
        const y = (parseFloat(target.getAttribute('data-y') || '0')) + event.dy;

        // Translate the element
        target.style.transform = `translate(${x}px, ${y}px)`;

        // Update the position attributes
        target.setAttribute('data-x', x.toString());
        target.setAttribute('data-y', y.toString());

       // console.log('drag', `${target.localName} (${target.textContent})`, event);
    };

    private onDragEnd = (event: any) => {
        const element = event.target as HTMLElement;

        // Reset visual feedback
        element.style.opacity = '';

        console.log('dragend', `${element.localName}`, event);
    };

    private onDropzoneEnter = (event: any) => {
        const dropzoneElement = event.target as HTMLElement;
        const draggableElement = event.relatedTarget as HTMLElement;

        // Check if this is the host element
        if (dropzoneElement === (this.host as unknown as HTMLElement)) {
            this._isDragOver = true;
            this.host.requestUpdate();
            console.log(`dropzone enter - ${this.host.name || 'unnamed'}`);
        }
    };

    private onDropzoneLeave = (event: any) => {
        const dropzoneElement = event.target as HTMLElement;

        if (dropzoneElement === (this.host as unknown as HTMLElement)) {
            this._isDragOver = false;
            this.host.requestUpdate();
            console.log(`dropzone leave - ${this.host.name || 'unnamed'}`);
        }
    };

    private onDrop = (event: any) => {
        const dropzoneElement = event.target as HTMLElement;
        const draggedElement = event.relatedTarget as HTMLElement;

        if (dropzoneElement === (this.host as unknown as HTMLElement)) {
            this._isDragOver = false;
            this.host.requestUpdate();

            console.log(`DROPPED - ${this.host.name || 'unnamed'}`);

            // Check if the drop target is the dragged element itself or a descendant
            if (draggedElement === dropzoneElement || draggedElement.contains(dropzoneElement)) {
                console.warn('Cannot drop a parent into its own child');
                return;
            }

            // Reset the dragged element's position
            draggedElement.style.transform = '';
            draggedElement.removeAttribute('data-x');
            draggedElement.removeAttribute('data-y');

            // Move the element to the drop zone
            draggedElement.remove();
            dropzoneElement.appendChild(draggedElement);
        }
    };
}