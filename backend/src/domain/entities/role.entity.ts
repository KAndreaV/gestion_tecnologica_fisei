import { Entity } from './entity';

export type RoleProps = {
  id: number;
  name: string;
  description?: string;
  active: boolean;
};

export class RoleEntity extends Entity<RoleProps> {
  constructor(props: RoleProps) {
    super(props);
  }
}
