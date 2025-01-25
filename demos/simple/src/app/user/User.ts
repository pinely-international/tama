interface User {
  username: string

  avatar?: string
  email: string

  firstName: string
  lastName: string
}
namespace User {
  export class Resource { }
}

export default User


export interface Author {
  avatar?: string
  username: string
}
