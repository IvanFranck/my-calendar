import React from 'react'
import { DnDContext } from './DnDContext'
import { scrollParent, scrollTop } from 'dom-helpers'
import qsa from 'dom-helpers/cjs/querySelectorAll'

import Selection, {
    getBoundsForNode,
    getEventNodeFromPoint,
} from '../../Selection'
import TimeGridEvent from '../../TimeGridEvent'
import { dragAccessors, eventTimes, pointInColumn } from './common'
import { EventContainerWrapperProps, Event } from './types'

class EventContainerWrapper extends React.Component<EventContainerWrapperProps> {
    static contextType = DnDContext

    state: {
        event: Event | null;
        top: number | null;
        height: number | null;
        [key: string]: any;
    }

    ref: React.RefObject<HTMLDivElement>
    _selector: any
    _initial: Date | null = null

    constructor(...args: any[]) {
        super(...args)
        this.state = {}
        this.ref = React.createRef()
    }

    componentDidMount() {
        this._selectable()
    }

    componentWillUnmount() {
        this._teardownSelectable()
    }

    reset() {
        if (this.state.event)
            this.setState({ event: null, top: null, height: null })
    }

    update(event: Event, { startDate, endDate, top, height }: { startDate: Date; endDate: Date; top: number; height: number }) {
        const { event: lastEvent } = this.state
        if (
            lastEvent &&
            startDate === lastEvent.start &&
            endDate === lastEvent.end
        ) {
            return
        }

        this.setState({ event, top, height })
    }

    handleMove = (point: { x: number; y: number }, bounds: { top: number; left: number; right: number; bottom: number }) => {
        const { slotMetrics: { step, slots } } = this.props
        const { event } = this.context.draggable.dragAndDropAction

        if (!event) return

        const { start, end } = eventTimes(event)
        const { startDate, endDate } = this._calculateDnDEnd(start, end, point, bounds)

        this.update(event, {
            startDate,
            endDate,
            top: point.y - bounds.top,
            height: bounds.bottom - point.y,
        })
    }

    handleResize(point: { x: number; y: number }, bounds: { top: number; left: number; right: number; bottom: number }) {
        const { slotMetrics: { step, slots } } = this.props
        const { event, direction } = this.context.draggable.dragAndDropAction

        if (!event) return

        let { start, end } = eventTimes(event)
        const { startDate, endDate } = this._calculateDnDEnd(start, end, point, bounds)

        this.update(event, {
            startDate,
            endDate,
            top: point.y - bounds.top,
            height: bounds.bottom - point.y,
        })
    }

    handleDropFromOutside = (point: { x: number; y: number }, boundaryBox: { top: number; left: number; right: number; bottom: number }) => {
        const { slotMetrics: { step, slots } } = this.props
        const { onDropFromOutside } = this.context.draggable

        if (!onDropFromOutside) return

        const { startDate, endDate } = this._calculateDnDEnd(null, null, point, boundaryBox)
        onDropFromOutside({ start: startDate, end: endDate, allDay: false })
    }

    handleDragOverFromOutside = (point: { x: number; y: number }, bounds: { top: number; left: number; right: number; bottom: number }) => {
        const { onDragOverFromOutside } = this.context.draggable
        if (!onDragOverFromOutside) return

        onDragOverFromOutside(point, bounds)
    }

    _calculateDnDEnd = (start: Date | null, end: Date | null, point: { x: number; y: number }, bounds: { top: number; left: number; right: number; bottom: number }) => {
        const { slotMetrics: { step, slots } } = this.props
        const { dragAndDropAction } = this.context.draggable
        const { action, direction } = dragAndDropAction

        let startDate = start
        let endDate = end

        if (!startDate || !endDate) {
            const slot = getSlotAtX(bounds, point.x, slots)
            startDate = slot
            endDate = slot
        }

        if (action === 'resize') {
            if (direction === 'RIGHT' || direction === 'LEFT') {
                if (direction === 'RIGHT') {
                    endDate = getSlotAtX(bounds, point.x, slots)
                } else {
                    startDate = getSlotAtX(bounds, point.x, slots)
                }
            } else {
                if (direction === 'DOWN') {
                    endDate = getSlotAtX(bounds, point.y, slots)
                } else {
                    startDate = getSlotAtX(bounds, point.y, slots)
                }
            }
        } else {
            const slot = getSlotAtX(bounds, point.x, slots)
            startDate = slot
            endDate = slot
        }

        return { startDate, endDate }
    }

    updateParentScroll = (parent: HTMLElement, node: HTMLElement) => {
        if (!parent) return

        const { top: nodeTop, bottom: nodeBottom } = getBoundsForNode(node)
        const { top: parentTop, bottom: parentBottom } = getBoundsForNode(parent)

        if (nodeTop < parentTop) {
            parent.scrollTop = scrollTop(parent) - parentTop + nodeTop
        } else if (nodeBottom > parentBottom) {
            parent.scrollTop = scrollTop(parent) + nodeBottom - parentBottom
        }
    }

    _selectable = () => {
        const { selectable, slotMetrics } = this.props
        const { resource } = this.props

        const node = this.ref.current
        if (!node) return

        const selector = (this._selector = new Selection(() => node, {
            longPressThreshold: this.props.longPressThreshold,
        }))

        const maybeSelect = (box: { top: number; left: number; right: number; bottom: number }, bounds: { top: number; left: number; right: number; bottom: number }) => {
            const { onSelecting, onSelectSlot } = this.props
            const { startDate, endDate } = this._calculateDnDEnd(null, null, box, bounds)

            if (onSelecting) {
                if (
                    (startDate !== this._initial || endDate !== this._initial) &&
                    onSelecting({ start: startDate, end: endDate, resource, slots: slotMetrics.slots, bounds })
                ) {
                    this._initial = startDate
                    return
                }
            }

            if (startDate !== this._initial || endDate !== this._initial) {
                this._initial = startDate
                onSelectSlot && onSelectSlot({ start: startDate, end: endDate, resource, slots: slotMetrics.slots, bounds })
            }
        }

        const handleInteractionEnd = () => {
            const { onSelecting, onSelectSlot } = this.props
            const { dragAndDropAction } = this.context.draggable

            if (!dragAndDropAction.action) {
                const { bounds, box } = this._selector.getData()
                const { startDate, endDate } = this._calculateDnDEnd(null, null, box, bounds)

                if (onSelecting) {
                    const updateSelection = onSelecting({
                        start: startDate,
                        end: endDate,
                        resource,
                        slots: slotMetrics.slots,
                        bounds,
                    })
                    if (updateSelection) {
                        onSelectSlot && onSelectSlot({ start: startDate, end: endDate, resource, slots: slotMetrics.slots, bounds })
                    }
                } else {
                    onSelectSlot && onSelectSlot({ start: startDate, end: endDate, resource, slots: slotMetrics.slots, bounds })
                }
            }

            this._initial = null
        }

        const handleMove = (point: { x: number; y: number }, bounds: { top: number; left: number; right: number; bottom: number }) => {
            const { dragAndDropAction } = this.context.draggable
            if (!dragAndDropAction.action) {
                const { startDate, endDate } = this._calculateDnDEnd(null, null, point, bounds)
                if (startDate !== this._initial || endDate !== this._initial) {
                    this._initial = startDate
                    this._selector.update(point, bounds)
                }
            }
        }

        const handleInteractionStart = (point: { x: number; y: number }) => {
            this._initial = null
            this._selector.start(point)
        }

        selector.on('selecting', maybeSelect)
        selector.on('selectStart', handleInteractionStart)
        selector.on('beforeSelect', handleInteractionStart)
        selector.on('click', (point: { x: number; y: number }, bounds: { top: number; left: number; right: number; bottom: number }) => {
            const { dragAndDropAction } = this.context.draggable
            if (!dragAndDropAction.action) {
                const { startDate, endDate } = this._calculateDnDEnd(null, null, point, bounds)
                this._initial = startDate
                this.props.onSelectSlot && this.props.onSelectSlot({ start: startDate, end: endDate, resource, slots: slotMetrics.slots, bounds })
            }
        })
        selector.on('dropFromOutside', this.handleDropFromOutside)
        selector.on('dragOverFromOutside', this.handleDragOverFromOutside)
        selector.on('move', handleMove)
        selector.on('moveUp', handleMove)
        selector.on('moveDown', handleMove)
        selector.on('moveLeft', handleMove)
        selector.on('moveRight', handleMove)
        selector.on('interactionEnd', handleInteractionEnd)
        selector.on('interactionEnd', this.handleInteractionEnd)
    }

    handleInteractionEnd = () => {
        const { dragAndDropAction } = this.context.draggable
        if (!dragAndDropAction.action) return

        const { event, top, height } = this.state
        if (!event) return

        this.reset()
        this.context.draggable.onEnd({
            start: event.start,
            end: event.end,
            allDay: false,
        })
    }

    _teardownSelectable = () => {
        if (!this._selector) return
        this._selector.teardown()
    }

    renderContent() {
        const { event, top, height } = this.state
        const { children } = this.props

        if (!event) return children

        return React.cloneElement(children as React.ReactElement, {
            event,
            style: {
                ...(children as React.ReactElement).props.style,
                top: `${top}px`,
                height: `${height}px`,
            },
        })
    }

    render() {
        const { children } = this.props
        const { interacting } = this.context.draggable.dragAndDropAction

        return (
            <div ref={this.ref} className={interacting ? 'rbc-addons-dnd-is-dragging' : ''}>
                {this.renderContent()}
            </div>
        )
    }
}

export default EventContainerWrapper 