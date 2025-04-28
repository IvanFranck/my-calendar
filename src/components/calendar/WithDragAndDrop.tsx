import React from 'react'
import clsx from 'clsx'

import { accessor } from './propTypes'
import EventWrapper from './EventWrapper'
import EventContainerWrapper from './eventContainerWrapper'
import WeekWrapper from './weekWrapper'
import { mergeComponents } from './common'
import { DnDContext } from './DnDContext'
import { CalendarProps, DragAndDropAction, Event } from './types'

export default function withDragAndDrop(Calendar: React.ComponentType<any>) {
    class DragAndDropCalendar extends React.Component<CalendarProps> {
        static defaultProps = {
            ...Calendar.defaultProps,
            draggableAccessor: null,
            resizableAccessor: null,
            resizable: true,
        }

        state: {
            interacting: boolean;
            event: Event | null;
            action: 'move' | 'resize' | null;
            direction: 'UP' | 'DOWN' | 'LEFT' | 'RIGHT' | null;
        }

        constructor(...args: any[]) {
            super(...args)

            this.state = {
                interacting: false,
                event: null,
                action: null,
                direction: null
            }
        }

        getDnDContextValue() {
            return {
                draggable: {
                    onStart: this.handleInteractionStart,
                    onEnd: this.handleInteractionEnd,
                    onBeginAction: this.handleBeginAction,
                    onDropFromOutside: this.props.onDropFromOutside,
                    dragFromOutsideItem: this.props.dragFromOutsideItem,
                    draggableAccessor: this.props.draggableAccessor,
                    resizableAccessor: this.props.resizableAccessor,
                    dragAndDropAction: this.state as DragAndDropAction,
                },
            }
        }

        defaultOnDragOver = (event: React.DragEvent) => {
            event.preventDefault()
        }

        handleBeginAction = (event: Event, action: 'move' | 'resize', direction?: 'UP' | 'DOWN' | 'LEFT' | 'RIGHT') => {
            this.setState({ event, action, direction })
            const { onDragStart } = this.props
            if (onDragStart) onDragStart({ event, action, direction })
        }

        handleInteractionStart = () => {
            if (this.state.interacting === false) this.setState({ interacting: true })
        }

        handleInteractionEnd = (interactionInfo: any) => {
            const { action, event } = this.state
            if (!action) return

            this.setState({
                action: null,
                event: null,
                interacting: false,
                direction: null,
            })

            if (interactionInfo == null) return

            interactionInfo.event = event
            const { onEventDrop, onEventResize } = this.props
            if (action === 'move' && onEventDrop) onEventDrop(interactionInfo)
            if (action === 'resize' && onEventResize) onEventResize(interactionInfo)
        }

        render() {
            const { selectable, elementProps, components, ...props } = this.props
            const { interacting } = this.state

            delete props.onEventDrop
            delete props.onEventResize
            props.selectable = selectable ? 'ignoreEvents' : false

            this.components = mergeComponents(components, {
                eventWrapper: EventWrapper,
                eventContainerWrapper: EventContainerWrapper,
                weekWrapper: WeekWrapper,
            })

            const elementPropsWithDropFromOutside = this.props.onDropFromOutside
                ? {
                    ...elementProps,
                    onDragOver: this.props.onDragOver || this.defaultOnDragOver,
                }
                : elementProps

            props.className = clsx(
                props.className,
                'rbc-addons-dnd',
                !!interacting && 'rbc-addons-dnd-is-dragging'
            )

            const context = this.getDnDContextValue()
            return (
                <DnDContext.Provider value={context}>
                    <Calendar
                        {...props}
                        elementProps={elementPropsWithDropFromOutside}
                        components={this.components}
                    />
                </DnDContext.Provider>
            )
        }
    }

    return DragAndDropCalendar
} 