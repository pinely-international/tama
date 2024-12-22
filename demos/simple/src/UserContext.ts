import { Flow } from "@denshya/flow";
import User from "./app/user/User";


export default class UserContext {
  constructor(readonly user: Flow<User>) { }
}
