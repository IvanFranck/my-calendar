import React from 'react'
import { DnDContextValue } from './types'

export const DnDContext = React.createContext<DnDContextValue>({
  draggable: {
    onStart: () => {},
    onEnd: () => {},
    onBeginAction: () => {},
    draggableAccessor: null,
    resizableAccessor: null,
    dragAndDropAction: {
      interacting: false,
      event: null,
      action: null,
      direction: null
    }
  }
}) 