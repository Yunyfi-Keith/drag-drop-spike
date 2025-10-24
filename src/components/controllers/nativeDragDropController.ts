import {ReactiveController, ReactiveControllerHost} from 'lit';
import * as uuid from 'uuid';

export interface DragDropHost extends ReactiveControllerHost, HTMLElement {
    id: string;
    name?: string;
}

const DataDesignElementDraggingAttribute = 'data-design-element-dragging';

enum Quadrant {
    UpperLeft = 'upperLeft',
    UpperRight = 'upperRight',
    LowerLeft = 'lowerLeft',
    LowerRight = 'lowerRight'
}

export class NativeDragDropController implements ReactiveController {
    private readonly _hostElement: DragDropHost;
    private _isDragOver = false;
    private _dropIndicatorQuadrant: Quadrant | null = null;

    constructor(host: DragDropHost) {
        this._hostElement = host;
        host.addController(this);
    }

    get isDragOver(): boolean {
        return this._isDragOver;
    }

    get dropIndicatorQuadrant(): Quadrant | null {
        return this._dropIndicatorQuadrant;
    }

    hostConnected() {
        // Generate UUID if not already set
        // TODO this is a smell
        if (!this._hostElement.id) {
            this._hostElement.id = uuid.v4();
        }

        this._hostElement.setAttribute('draggable', 'true');

        // Add event listeners
        this._hostElement.addEventListener('dragstart', this._onDragStart, {passive: false});
        this._hostElement.addEventListener('drag', this._onDrag);
        this._hostElement.addEventListener('dragend', this._onDragEnd);
        this._hostElement.addEventListener('dragover', this._onDragOver);
        this._hostElement.addEventListener('dragleave', this._onDragLeave);
        this._hostElement.addEventListener('drop', this._onDrop);
    }

    hostDisconnected() {
        const element = this._hostElement as unknown as HTMLElement;

        // Remove event listeners
        element.removeEventListener('dragstart', this._onDragStart);
        element.removeEventListener('drag', this._onDrag);
        element.removeEventListener('dragend', this._onDragEnd);
        element.removeEventListener('dragover', this._onDragOver);
        element.removeEventListener('dragleave', this._onDragLeave);
        element.removeEventListener('drop', this._onDrop);
    }

    private _onDragStart = (evt: DragEvent) => {
        // This fires for all hosts using this controller.
        // ✅ Only kick off the logic for the instance that is being dragged
        if (this._hostElement === evt.target) {
            // Set a data attribute on the host so we can find the things being dragged during 'dropover' event handling.
            this._hostElement.setAttribute(DataDesignElementDraggingAttribute, 'true');
            evt.dataTransfer.effectAllowed = 'move';
            evt.dataTransfer.setData('text/plain', this._hostElement.id);
            console.log(evt.type, `${(evt.target as HTMLElement).localName}`, evt);
        }
    };

    private _onDrag = (evt: DragEvent) => {
        // console.log(evt.type, `${(evt.target as HTMLElement).localName}`, evt);
    };

    private _onDragEnd = (evt: DragEvent) => {
        // Always fires, even for unsuccessful drops
        this._hostElement.removeAttribute(DataDesignElementDraggingAttribute);
    };

    /**
     * This fires for all hosts using this controller, this may include child elements of the initiating host (nested elements).
     * @param e
     */
    private _onDragOver = (e: DragEvent) => {
        const elementRaisingDragoverEvent = e.target as HTMLElement;
        const draggedElement = this._getDraggedElement()

        // We need to ignore some cases:

        // ❌ If we're dragging over itself, we don't want to enter 'isDragOver' because we can't drop into itself.
        if (draggedElement === elementRaisingDragoverEvent) {
          //  console.log(`case 1 - ${this._hostElement.name }`);
            e.stopPropagation(); // stop parents reacting
            return
        }

        // ❌ When dragging over a child, we don't want to enter 'isDragOver' because ultimately we can't drop a parent element into a child.
        if (draggedElement.contains(this._hostElement)) {
          //  console.log(`case 2 - ${this._hostElement.name }`);
            e.stopPropagation(); // stop parents reacting
            return
        }

        // Call event.preventDefault(), which enables this to receive drop events.
        // https://developer.mozilla.org/en-US/docs/Web/API/HTMLElement/dragover_event
        e.preventDefault();
        // Stop parent nodes also handling this, don't want multiple elements in 'drag over' state.
        e.stopPropagation();
        this._isDragOver = true;
        this._onDragOverHighlightDropIndicatorBorder(e)
        this._hostElement.requestUpdate();
        console.log(`dragover - ${this._hostElement.name || 'unnamed'}`);
    };


    private _onDragOverHighlightDropIndicatorBorder(event: DragEvent) {
        const draggedElement = this._getDraggedElement();
        const hostsFirstChild = this._hostElement.shadowRoot;
        let quadrant = this._getCursorQuadrantRelativeToElementBounds(event, this._hostElement);
        this._dropIndicatorQuadrant = quadrant;
        console.log(`Cursor at (${event.clientX}, ${event.clientY}) in quadrant: ${quadrant}`);
    }

    private _getCursorQuadrantRelativeToElementBounds(event: DragEvent, relativeToElement: HTMLElement): Quadrant {
        let hostElementBounds = relativeToElement.getBoundingClientRect();

        // Calculate quadrant boundaries
        const midX = hostElementBounds.left + hostElementBounds.width / 2;
        const midY = hostElementBounds.top + hostElementBounds.height / 2;

        // Determine which quadrant the cursor is in
        const isLeft = event.clientX < midX;
        const isUpper = event.clientY < midY;

        if (isUpper && isLeft) {
            return Quadrant.UpperLeft;
        } else if (isUpper && !isLeft) {
            return Quadrant.UpperRight;
        } else if (!isUpper && isLeft) {
            return Quadrant.LowerLeft;
        } else {
            return Quadrant.LowerRight;
        }
    }

    private _onDragLeave = (e: DragEvent) => {
        this._tryEndDragState();
    };

    private _onDrop = (e: DragEvent) => {
        e.preventDefault();

        const droppedOnElement = e.target as HTMLElement;
        let dropIsOnHostOrChild = this._hostElement === droppedOnElement || this._hostElement.contains(droppedOnElement);

        if (dropIsOnHostOrChild) {

            e.stopPropagation()

            console.log(`DROPPED - ${this._hostElement.name || 'unnamed'}`);

            const draggedElement = this._getDraggedElement(e);

            // Check if the drop target is the dragged element itself or a descendant
            if (draggedElement === this._hostElement || draggedElement.contains(this._hostElement)) {
                console.warn('Cannot drop a parent into its own child');
                return;
            }

            draggedElement.remove();

            const insertBefore = this._dropIndicatorQuadrant === Quadrant.UpperLeft || this._dropIndicatorQuadrant === Quadrant.LowerLeft

            if (insertBefore) {
                this._hostElement.insertBefore(draggedElement, this._hostElement.firstChild);
            } else {
                this._hostElement.appendChild(draggedElement);
            }
        }
        this._tryEndDragState();
    };

    private _tryEndDragState() {
        if (this._isDragOver) {
            this._isDragOver = false;
            this._dropIndicatorQuadrant = null;
            this._hostElement.requestUpdate();
        }
    }

    private _getDraggedElement(): HTMLElement;
    private _getDraggedElement(e: DragEvent) : HTMLElement;
    private _getDraggedElement(...args: DragEvent[]): HTMLElement {
        if (args.length > 0) {
            const dragEvent = args[0];
            if (dragEvent.type !== 'drop') {
                throw new Error('This method is only supported during drop events');
            }
            // You can only read from the data transfer store during dragStart and drop events:
            // https://developer.mozilla.org/en-US/docs/Web/API/HTML_Drag_and_Drop_API/Drag_data_store#protected_mode
            const draggedItemId = dragEvent.dataTransfer.getData('text/plain');
            return document.getElementById(draggedItemId);
        }

        // Get the dragged element using a query, the e.dataTransfer.getData('text/plain') is 'protected', thus empty, when handing the dragover event.
        // https://developer.mozilla.org/en-US/docs/Web/API/HTML_Drag_and_Drop_API/Drag_data_store#protected_mode
        return document.querySelector(`[${DataDesignElementDraggingAttribute}="true"]`);
    }
}