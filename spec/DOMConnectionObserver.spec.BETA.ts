import "./dom"

import { describe, it, expect, vi, beforeEach, afterEach } from 'bun:test'
import { DOMConnectionObserver } from "@/DOMConnectionObserver"

describe('DOMConnectionObserver', () => {
  let container: HTMLElement

  beforeEach(() => {
    container = document.createElement('div')
    document.body.appendChild(container)
  })

  afterEach(() => {
    document.body.removeChild(container)
  })

  it('should create an instance with a callback', () => {
    const callback = vi.fn()
    const observer = new DOMConnectionObserver(callback)
    expect(observer).toBeDefined()
  })

  it('should observe a node and call callback when connected', () => {
    const callback = vi.fn()
    const observer = new DOMConnectionObserver(callback)
    const element = document.createElement('div')

    observer.observe(element)
    container.appendChild(element)

    // Initial observation - element becomes connected
    expect(callback).toHaveBeenCalled()
    const lastCall = callback.mock.calls[callback.mock.calls.length - 1]
    expect(lastCall[0][0].isConnected).toBe(true)
    expect(lastCall[0][0].target).toBe(element)
  })

  it('should call callback when node is disconnected', () => {
    const callback = vi.fn()
    const observer = new DOMConnectionObserver(callback)
    const element = document.createElement('div')

    container.appendChild(element)
    observer.observe(element)

    callback.mockClear()
    container.removeChild(element)

    expect(callback).toHaveBeenCalled()
    const lastCall = callback.mock.calls[callback.mock.calls.length - 1]
    expect(lastCall[0][0].isConnected).toBe(false)
  })

  it('should not call callback if connection state does not change', () => {
    const callback = vi.fn()
    const observer = new DOMConnectionObserver(callback)
    const element = document.createElement('div')

    observer.observe(element)
    const initialCallCount = callback.mock.calls.length

    // Trigger mutation on disconnected node
    element.textContent = 'test'

    expect(callback.mock.calls.length).toBe(initialCallCount)
  })

  it('should support multiple callbacks on the same node', () => {
    const callback1 = vi.fn()
    const callback2 = vi.fn()
    const observer1 = new DOMConnectionObserver(callback1)
    const observer2 = new DOMConnectionObserver(callback2)
    const element = document.createElement('div')

    observer1.observe(element)
    observer2.observe(element)
    container.appendChild(element)

    expect(callback1).toHaveBeenCalled()
    expect(callback2).toHaveBeenCalled()
  })

  it('should unobserve a node and stop calling callback', () => {
    const callback = vi.fn()
    const observer = new DOMConnectionObserver(callback)
    const element = document.createElement('div')

    container.appendChild(element)
    observer.observe(element)

    callback.mockClear()
    observer.unobserve(element)

    container.removeChild(element)

    expect(callback).not.toHaveBeenCalled()
  })

  it('should return DOMConnectionObserverEntry with correct shape', () => {
    const callback = vi.fn()
    const observer = new DOMConnectionObserver(callback)
    const element = document.createElement('div')

    observer.observe(element)
    container.appendChild(element)

    expect(callback).toHaveBeenCalled()
    const entries = callback.mock.calls[0][0]

    expect(Array.isArray(entries)).toBe(true)
    expect(entries[0]).toHaveProperty('isConnected')
    expect(entries[0]).toHaveProperty('target')
    expect(typeof entries[0].isConnected).toBe('boolean')
    expect(entries[0].target).toBe(element)
  })

  it('should handle deep DOM tree connections', () => {
    const callback = vi.fn()
    const observer = new DOMConnectionObserver(callback)
    const parent = document.createElement('div')
    const child = document.createElement('div')

    parent.appendChild(child)
    observer.observe(child)

    callback.mockClear()
    container.appendChild(parent)

    expect(callback).toHaveBeenCalled()
    expect(callback.mock.calls[0][0][0].isConnected).toBe(true)
  })

  it('should handle text nodes', () => {
    const callback = vi.fn()
    const observer = new DOMConnectionObserver(callback)
    const textNode = document.createTextNode('test')

    observer.observe(textNode)
    container.appendChild(textNode)

    expect(callback).toHaveBeenCalled()
  })
})
