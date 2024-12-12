import User from "./app/user/User";

import { Events } from "@denshya/proton";


export default class UserContext {
  constructor(readonly user: Events.State<User>) { }
}
