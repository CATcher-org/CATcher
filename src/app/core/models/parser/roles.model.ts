export interface Roles {
  students?: {
    [loginId: string]: string;
  };
  tutors?: {
    [loginId: string]: string;
  };
  admins?: {
    [loginId: string]: string;
  };
}
