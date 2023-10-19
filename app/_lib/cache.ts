import React from 'react'

export function cache<F extends Function>(fn: F): F
export function cache<F extends Function>(name: string, fn: F): F
export function cache<F extends Function>(nameOrFn: F | string, fn?: F): F {
  const name = typeof nameOrFn === 'function' ? nameOrFn.name : nameOrFn
  const cached = React.cache(fn ?? (nameOrFn as F))
  Object.defineProperty(cached, 'name', { value: name, writable: false })
  return cached as F
}
