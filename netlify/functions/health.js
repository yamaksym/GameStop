import prisma from '../../Backend/prisma.js';

export async function handler(event, context) {
  try {
    // Basic connectivity check: count support tickets or games
    const gamesCount = await prisma.game.count();
    
    return {
      statusCode: 200,
      headers: { 
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({
        ok: true,
        message: 'Prisma and Turso are connected successfully!',
        gamesCount,
        timestamp: new Date().toISOString()
      }),
    };
  } catch (error) {
    return {
      statusCode: 500,
      headers: { 
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({
        ok: false,
        error: error.message
      }),
    };
  }
}
