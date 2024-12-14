class Price {
  /**
   * @argument locale default `"EN"`
   */
  static format(value: number, locale = "EN", options?: Intl.NumberFormatOptions): string {
    try {
      return value.toLocaleString(locale, { ...DEFAULT_PRICE_OPTIONS, ...options })
    } catch (error) {
      if (import.meta.env.MODE === "production") {
        if (error instanceof Error) {
          if (error.message.includes("tag") || error.message.includes("locale")) {
            return "Invalid language tag"
          }

          return "Invalid currency code"
        }
      }

      throw error
    }
  }

  /**
   * @returns price value without currency sign
   */
  static parseValue(value: string): number {
    return Number(value.replace(/[^\d.,]/g, "").replace(",", "."))
  }
}

export default Price


const DEFAULT_PRICE_OPTIONS: Intl.NumberFormatOptions = {
  style: "currency",
  currency: "USD",
}
