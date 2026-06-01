// src/app/api/webhooks/bitso/route.ts
import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    // 1. Validar firma del webhook (Seguridad crítica en producción)
    // const signature = request.headers.get('x-bitso-signature');
    // verifySignature(body, signature);

    // Payload esperado de Bitso: { clabe: "...", amount: 50000, currency: "MXN", status: "completed" }
    const { clabe, amount, status } = body;

    if (status !== 'completed') {
      return NextResponse.json({ message: 'Ignorado' }, { status: 200 });
    }

    // 2. Transacción en PostgreSQL (Garantiza integridad de datos)
    await db.query('BEGIN');

    // Buscar al usuario dueño de la CLABE
    const userRes = await db.query(
      'SELECT user_id, fiat_balance FROM bank_accounts WHERE virtual_clabe = $1',
      [clabe]
    );

    if (!userRes.rows.length) {
      await db.query('ROLLBACK');
      return NextResponse.json({ error: 'CLABE no registrada' }, { status: 404 });
    }

    const { user_id, fiat_balance } = userRes.rows[0];
    const newBalance = Number(fiat_balance) + Number(amount);

    // Actualizar saldo
    await db.query(
      'UPDATE bank_accounts SET fiat_balance = $1 WHERE user_id = $2',
      [newBalance, user_id]
    );

    // Registrar historial de transacción
    await db.query(
      `INSERT INTO transactions (user_id, type, amount, status, created_at) 
       VALUES ($1, 'DEPOSIT_MXN', $2, 'COMPLETED', NOW())`,
      [user_id, amount]
    );

    await db.query('COMMIT');

    // Aquí (Fase 4) es donde dispararíamos la verificación de la regla del "Colchón de Seguridad"
    
    return NextResponse.json({ success: true });

  } catch (error) {
    await db.query('ROLLBACK');
    console.error('Error en Webhook Bitso:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}