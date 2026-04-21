import { Entity } from './entity';

export type UserProps = {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  login: string;
  active: boolean;
  roleId: number;
  departmentId?: number;
  locationId?: number;
};

export class UserEntity extends Entity<UserProps> {
  constructor(props: UserProps) {
    super(props);
  }
}
