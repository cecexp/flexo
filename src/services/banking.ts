// src/services/banking.ts
import { db } from '@/lib/db'; // Tu conexión a PostgreSQL

export const fetchBankBalance = async (userId: string) => {
  // En producción, aquí harías el fetch a la API de Belvo/Prometeo
  // usando el bank_link_id del usuario.
  
  // Para el MVP, recuperamos el saldo simulado desde PostgreSQL
  const account = await db.query(
    'SELECT fiat_balance FROM bank_accounts WHERE user_id = $1',
    [userId]
  );

  if (!account.rows.length) throw new Error('Cuenta no encontrada');
  
  return account.rows[0].fiat_balance;
};