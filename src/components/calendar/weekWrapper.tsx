import React from 'react'
import EventRow from '../../EventRow'
import Selection, { getBoundsForNode } from '../../Selection'
import { eventSegments } from '../../utils/eventLevels'
import { getSlotAtX, pointInBox } from '../../utils/selection'
import { dragAccessors, eventTimes } from './common'
import { DnDContext } from './DnDContext'
import { WeekWrapperProps, Event } from './types'

class WeekWrapper extends React.Component<WeekWrapperProps> {
    static contextType = DnDContext

    state: {
        segment: any;
        [key: string]: any;
    }

    ref: React.RefObject<HTMLDivElement>

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
        if (this.state.segment) this.setState({ segment: null })
    }

    update(event: Event, start: Date, end: Date) {
        const segment = eventSegments(
            { ...event, end, start, __isPreview: true },
            this.props.slotMetrics.range,
            dragAccessors,
            this.props.localizer
        )

        const { segment: lastSegment } = this.state
        if (
            lastSegment &&
            segment.span === lastSegment.span &&
            segment.left === lastSegment.left &&
            segment.row === lastSegment.row
        ) {
            return
        }

        this.setState({ segment })
    }

    handleMove = (point: { x: number; y: number }, bounds: { top: number; left: number; right: number; bottom: number }, draggedEvent: Event) => {
        const { slotMetrics: { step, slots } } = this.props

        const { segment } = this.state
        if (!segment) return

        const { start, end } = eventTimes(draggedEvent)
        const { startDate, endDate } = this._calculateDnDEnd(start, end, point, bounds)

        this.update(draggedEvent, startDate, endDate)
    }

    handleDropFromOutside = (point: { x: number; y: number }, bounds: { top: number; left: number; right: number; bottom: number }) => {
        const { slotMetrics: { step, slots } } = this.props
        const { onDropFromOutside } = this.context.draggable

        if (!onDropFromOutside) return

        const { startDate, endDate } = this._calculateDnDEnd(null, null, point, bounds)
        onDropFromOutside({ start: startDate, end: endDate, allDay: true })
    }

    handleDragOverFromOutside = (point: { x: number; y: number }, node: HTMLElement) => {
        const { onDragOverFromOutside } = this.context.draggable
        if (!onDragOverFromOutside) return

        const bounds = getBoundsForNode(node)
        if (pointInBox(point, bounds)) {
            onDragOverFromOutside(point, bounds)
        }
    }

    handleResize(point: { x: number; y: number }, bounds: { top: number; left: number; right: number; bottom: number }) {
        const { slotMetrics: { step, slots } } = this.props
        const { event, direction } = this.context.draggable.dragAndDropAction

        if (!event) return

        let { start, end } = eventTimes(event)
        const { startDate, endDate } = this._calculateDnDEnd(start, end, point, bounds)

        this.update(event, startDate, endDate)
    }

    _selectable = () => {
        const { selectable, slotMetrics } = this.props
        const { resourceId, rtl } = this.props

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
                    onSelecting({ start: startDate, end: endDate, resourceId, slots: slotMetrics.slots, bounds })
                ) {
                    this._initial = startDate
                    return
                }
            }

            if (startDate !== this._initial || endDate !== this._initial) {
                this._initial = startDate
                onSelectSlot && onSelectSlot({ start: startDate, end: endDate, resourceId, slots: slotMetrics.slots, bounds })
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
                        resourceId,
                        slots: slotMetrics.slots,
                        bounds,
                    })
                    if (updateSelection) {
                        onSelectSlot && onSelectSlot({ start: startDate, end: endDate, resourceId, slots: slotMetrics.slots, bounds })
                    }
                } else {
                    onSelectSlot && onSelectSlot({ start: startDate, end: endDate, resourceId, slots: slotMetrics.slots, bounds })
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
                this.props.onSelectSlot && this.props.onSelectSlot({ start: startDate, end: endDate, resourceId, slots: slotMetrics.slots, bounds })
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

        const { segment } = this.state
        if (!segment) return

        this.reset()
        this.context.draggable.onEnd({
            start: segment.event.start,
            end: segment.event.end,
            allDay: true,
        })
    }

    _teardownSelectable = () => {
        if (!this._selector) return
        this._selector.teardown()
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

    render() {
        const { children } = this.props
        const { interacting } = this.context.draggable.dragAndDropAction

        return (
            <div ref={this.ref} className={interacting ? 'rbc-addons-dnd-is-dragging' : ''}>
                {children}
            </div>
        )
    }
}

export default WeekWrapper 