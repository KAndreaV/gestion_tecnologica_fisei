export abstract class Entity<TProps extends Record<string, unknown>> {
  protected readonly props: TProps;

  protected constructor(props: TProps) {
    this.props = props;
  }
}
