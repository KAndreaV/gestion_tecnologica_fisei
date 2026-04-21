import { Entity } from './entity';

export type DepartmentProps = {
  id: number;
  name: string;
  description?: string;
};

export class DepartmentEntity extends Entity<DepartmentProps> {
  constructor(props: DepartmentProps) {
    super(props);
  }
}
