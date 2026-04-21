export type OracleHealthSnapshot = {
  user: string;
  connectionString: string;
  thin: boolean;
};

export type SystemHealth = {
  status: 'ok';
  service: string;
  oracle: OracleHealthSnapshot;
};
