interface User {
  avatar?: string
  email: string

  firstName: string
  lastName: string

  if(ads: (user: this) => any): any
}
namespace User { }

export default User
