import { State, StateOrPlain } from "@denshya/reactive"

class Pagination {
  page: State<number>
  pageSize: State<number>

  constructor(private readonly firstPage = 1, pageSize = 10) {
    this.page = new State(firstPage)
    this.pageSize = new State(pageSize)
  }

  select<T>(items: T[]): T[] {
    const page = this.page.current
    const pageSize = this.pageSize.current

    return items.slice(pageSize * (page - 1), pageSize * page)
  }
  select$<T>(items: StateOrPlain<T[]>): State<T[]> {
    return State.combine([items, this.page, this.pageSize], items => this.select(items))
  }

  seek(total: number): Seek {
    const totalPages = Math.ceil(total / this.pageSize.get())
    return {
      totalPages,
      next: () => this.page.set(page => clamp(page + 1, this.firstPage, totalPages)),
      previous: () => this.page.set(page => clamp(page - 1, this.firstPage, totalPages)),
    }
  }
}

export default Pagination


function clamp(value: number, min: number, max: number): number {
  if (value < min) return min
  if (value > max) return max

  return value
}

interface Seek {
  totalPages: number

  next(): void
  previous(): void
}
