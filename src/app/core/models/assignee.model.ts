export interface UserData {
  id: number;
  login: string;
  url: string;
}

export default class Assignee implements UserData {
  id: number;
  login: string;
  url: string;

  constructor(data: UserData) {
    Object.assign(this, data);
    this.login = data.login.toLowerCase();
  }
}
