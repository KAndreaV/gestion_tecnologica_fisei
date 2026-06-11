const oracledb = require('oracledb');
async function run() {
  try {
    const c = await oracledb.getConnection({
      user: 'gestionfisei1',
      password: 'gestionfisei1',
      connectionString: 'localhost:1521/xe'
    });
    const r = await c.execute('SELECT TABLE_NAME FROM USER_TABLES');
    const tables = r.rows.map(row => row[0]);
    require('fs').writeFileSync('C:\\gestion_tecnologica_fisei\\backend\\tables.txt', tables.join('\n'));
    await c.close();
  } catch (e) {
    require('fs').writeFileSync('C:\\gestion_tecnologica_fisei\\backend\\tables.txt', "ERROR: " + e.toString());
  }
}
run();
