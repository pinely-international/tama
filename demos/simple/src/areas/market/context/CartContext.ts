import { Events } from "@denshya/proton";

class CartContext {
  constructor(readonly chosen: Events.State<Set<string>>) { }
}

export default CartContext
