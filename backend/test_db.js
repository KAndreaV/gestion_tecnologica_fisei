const oracledb = require('oracledb');
async function run() {
  try {
    oracledb.initOracleClient({ libDir: 'C:\\instantclient_23_0' });
    const c = await oracledb.getConnection({
      user: 'gestionfisei1',
      password: 'gestionfisei1',
      connectionString: 'localhost:1521/xe'
    });
    const r = await c.execute('SELECT * FROM DETALLE_PRESTAMO WHERE ID_PRES = 2');
    console.log("Success: ", r.rows);
    
    const r2 = await c.execute('SELECT * FROM PRESTAMO WHERE ID_PRES = 2 FOR UPDATE NOWAIT');
    console.log("Success PRESTAMO: ", r2.rows);

    await c.close();
  } catch (e) {
    console.error("DB ERROR:", e);
  }
}
run();
