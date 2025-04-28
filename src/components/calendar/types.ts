import { ReactNode } from 'react';
import { DateLocalizer } from 'react-big-calendar';

export type Accessor = string | ((event: any) => any);

export interface Event {
  id: number;
  title: string;
  start: Date;
  end: Date;
  allDay?: boolean;
  isDraggable?: boolean;
  __isPreview?: boolean;
  sourceResource?: any;
  [key: string]: any;
}

export interface DragAndDropAction {
  interacting: boolean;
  event: Event | null;
  action: 'move' | 'resize' | null;
  direction: 'UP' | 'DOWN' | 'LEFT' | 'RIGHT' | null;
}

export interface DraggableContext {
  onStart: () => void;
  onEnd: (interactionInfo: any) => void;
  onBeginAction: (event: Event, action: 'move' | 'resize', direction?: 'UP' | 'DOWN' | 'LEFT' | 'RIGHT') => void;
  onDropFromOutside?: (info: { start: Date; end: Date; allDay: boolean }) => void;
  dragFromOutsideItem?: () => Event | null;
  draggableAccessor: Accessor | null;
  resizableAccessor: Accessor | null;
  dragAndDropAction: DragAndDropAction;
}

export interface DnDContextValue {
  draggable: DraggableContext;
}

export interface CalendarProps {
  onEventDrop?: (info: { event: Event; start: Date; end: Date; isAllDay: boolean }) => void;
  onEventResize?: (info: { event: Event; start: Date; end: Date }) => void;
  onDragStart?: (info: { event: Event; action: 'move' | 'resize'; direction?: 'UP' | 'DOWN' | 'LEFT' | 'RIGHT' }) => void;
  onDragOver?: (event: React.DragEvent) => void;
  onDropFromOutside?: (info: { start: Date; end: Date; allDay: boolean }) => void;
  dragFromOutsideItem?: () => Event | null;
  draggableAccessor?: Accessor;
  resizableAccessor?: Accessor;
  selectable?: boolean | 'ignoreEvents';
  resizable?: boolean;
  localizer: DateLocalizer;
  events: Event[];
  defaultDate?: Date;
  defaultView?: string;
  eventPropGetter?: (event: Event) => { className?: string; [key: string]: any };
  components?: {
    eventWrapper?: React.ComponentType<any>;
    eventContainerWrapper?: React.ComponentType<any>;
    weekWrapper?: React.ComponentType<any>;
    [key: string]: React.ComponentType<any> | undefined;
  };
  elementProps?: Record<string, any>;
  className?: string;
  [key: string]: any;
}

export interface EventWrapperProps {
  type: 'date' | 'time';
  event: Event;
  draggable?: boolean;
  allDay?: boolean;
  isRow?: boolean;
  continuesPrior?: boolean;
  continuesAfter?: boolean;
  isDragging?: boolean;
  isResizing?: boolean;
  resource?: number;
  resizable?: boolean;
  children: ReactNode;
}

export interface EventContainerWrapperProps {
  accessors: Record<string, any>;
  components: Record<string, React.ComponentType<any>>;
  getters: Record<string, any>;
  localizer: DateLocalizer;
  slotMetrics: {
    range: { start: Date; end: Date };
    [key: string]: any;
  };
  resource?: any;
}

export interface WeekWrapperProps {
  isAllDay?: boolean;
  slotMetrics: {
    range: { start: Date; end: Date };
    [key: string]: any;
  };
  accessors: Record<string, any>;
  getters: Record<string, any>;
  components: Record<string, React.ComponentType<any>>;
  resourceId?: any;
  rtl?: boolean;
  localizer: DateLocalizer;
}

export interface InteractionInfo {
  event: Event;
  start: Date;
  end: Date;
  isAllDay?: boolean;
} 