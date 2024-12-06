interface User {
  avatar?: string
  email: string

  firstName: string
  lastName: string
}
namespace User {
  export class Resource { }
}

export default User
