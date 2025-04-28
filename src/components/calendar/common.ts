import React from 'react'
import { Event } from './types'

function createFactory(Component: React.ComponentType<any>) {
  return (props: any, children: React.ReactNode) => React.createElement(Component, props, children)
}

function nest(...Components: React.ComponentType<any>[]) {
  const factories = Components.filter(Boolean).map(createFactory)
  const Nest = ({ children, ...props }: { children: React.ReactNode; [key: string]: any }) =>
    factories.reduceRight((child, factory) => factory(props, child), children)
  
  return Nest
}

export function mergeComponents(components: Record<string, React.ComponentType<any>> = {}, addons: Record<string, React.ComponentType<any>>) {
  const keys = Object.keys(addons)
  const result = { ...components }
  
  keys.forEach((key) => {
    result[key] = components[key]
      ? nest(components[key], addons[key])
      : addons[key]
  })
  return result
}

export const dragAccessors = {
  start: (event: Event) => event.start,
  end: (event: Event) => event.end,
}

export const eventTimes = (event: Event) => ({
  start: dragAccessors.start(event),
  end: dragAccessors.end(event),
})

export const pointInBox = (point: { x: number; y: number }, box: { top: number; left: number; right: number; bottom: number }) => {
  const { x, y } = point
  const { top, left, right, bottom } = box
  
  return x >= left && x <= right && y >= top && y <= bottom
}

export const pointInColumn = (point: { x: number; y: number }, column: { left: number; right: number }) => {
  const { x } = point
  const { left, right } = column
  
  return x >= left && x <= right
} 