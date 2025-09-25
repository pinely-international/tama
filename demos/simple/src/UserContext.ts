import { State } from "@denshya/reactive";
import User from "./app/user/User";


export default class UserContext {
  constructor(readonly user: State<User>) { }
}
