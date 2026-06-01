// src/services/onramping.ts
export const generateVirtualCLABE = async (companyName: string, userId: string) => {
    // Llamada a Bitso Business API (Endpoint simulado para MVP)
    /*
    const response = await fetch('https://api.bitso.com/v3/business/clabe', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${process.env.BITSO_API_KEY}` },
      body: JSON.stringify({ entity_name: companyName })
    });
    */
    
    // Mock de respuesta de Bitso
    const mockClabe = `646180${Math.floor(100000000000 + Math.random() * 900000000000)}`;
    
    // Guardamos la CLABE en PostgreSQL ligada al usuario
    await db.query(
      'UPDATE bank_accounts SET virtual_clabe = $1 WHERE user_id = $2',
      [mockClabe, userId]
    );
  
    return mockClabe;
  };