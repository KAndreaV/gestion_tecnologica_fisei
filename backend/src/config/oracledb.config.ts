/**
 * Configuración de node-oracledb para usar Thick Mode
 * Thick mode es más compatible con versiones antiguas de Oracle Database
 */

import * as dotenv from 'dotenv';
dotenv.config();

let oracledb: any;

try {
  oracledb = require('oracledb');
  
  // Intentar cambiar a Thick mode
  const libDir = process.env.ORACLE_CLIENT_LIB_DIR || 'C:\\instantclient_23_0';
  
  try {
    oracledb.initOracleClient({ libDir });
    console.log(`✅ node-oracledb configurado en Thick mode con: ${libDir}`);
  } catch (thickError: any) {
    console.warn(`⚠️  No se pudo inicializar Thick mode: ${thickError.message}`);
    console.log('ℹ️  Usando Thin mode (limitado a versiones recientes de Oracle)');
  }
} catch (importError) {
  console.error('❌ Error al importar oracledb:', importError);
}

export default oracledb;
