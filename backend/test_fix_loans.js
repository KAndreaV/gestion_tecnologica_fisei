const oracledb = require('oracledb');
async function run() {
  try {
    const c = await oracledb.getConnection({
      user: 'gestionfisei1',
      password: 'gestionfisei1',
      connectionString: 'localhost:1521/xe'
    });
    const r = await c.execute('UPDATE PRESTAMO SET ID_EST = 3 WHERE ID_EST = 2 OR ID_EST = 1');
    await c.commit();
    console.log("Success: updated", r.rowsAffected);
    await c.close();
  } catch (e) {
    console.error("DB ERROR:", e);
  }
}
run();
