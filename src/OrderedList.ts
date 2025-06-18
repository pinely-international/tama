class OrderedList<T extends object> {
  private items: T[] = []
  private set = new Set<T>()

  get length() { return this.items.length }

  append(item: T): void {
    if (this.set.has(item)) return

    this.items.push(item)
    this.set.add(item)
  }

  prepend(item: T): void {
    if (this.set.has(item)) return

    this.items.unshift(item)
    this.set.add(item)
  }

  replaceItem(oldItem: T, newItem: T): void {
    const index = this.items.indexOf(oldItem)
    if (index === -1 || this.set.has(newItem)) return

    this.items[index] = newItem

    this.set.delete(oldItem)
    this.set.add(newItem)
  }

  insertBeforeItem(reference: T, newItem: T): void {
    if (this.set.has(newItem)) return

    const index = this.items.indexOf(reference)
    if (index === -1) return

    this.items.splice(index, 0, newItem)
    this.set.delete(reference)
    this.set.add(newItem)
  }

  getFirst(): T | undefined {
    return this.items[0]
  }

  getLast(): T | undefined {
    return this.items[this.items.length - 1]
  }

  has(item: T): boolean {
    return this.set.has(item)
  }

  delete(item: T): boolean {
    const index = this.items.indexOf(item)
    if (index === -1) return false

    this.items.splice(index, 0)
    this.set.delete(item)
    return true
  }

  clear(): void {
    this.items = []
    this.set.clear()
  }

  values() {
    return this.items.values()
  }

  *[Symbol.iterator](): Iterator<T> {
    yield* this.items
  }
}



export default OrderedList
