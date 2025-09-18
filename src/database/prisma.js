import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient({
    log: ['error', 'warn'],
});

// Función para conectar a la base de datos
export const connectDB = async () => {
    try {
        await prisma.$connect();
        console.log('✅ Conectado a la base de datos SQLite');
        return true;
    } catch (error) {
        console.error('❌ Error conectando a la base de datos:', error);
        return false;
    }
};

// Función de health check
export const healthCheck = async () => {
    try {
        await prisma.$queryRaw`SELECT 1`;
        return { status: 'OK', database: 'Connected' };
    } catch (error) {
        console.error('Health check failed:', error);
        return { status: 'ERROR', database: 'Disconnected', error: error.message };
    }
};

// Función para desconectar de la base de datos
export const disconnectDB = async () => {
    try {
        await prisma.$disconnect();
        console.log('🔌 Desconectado de la base de datos');
    } catch (error) {
        console.error('❌ Error desconectando de la base de datos:', error);
    }
};

// Manejar cierre del proceso
process.on('beforeExit', async () => {
    await disconnectDB();
});

process.on('SIGINT', async () => {
    console.log('\n🛑 Cerrando servidor...');
    await disconnectDB();
    process.exit(0);
});

process.on('SIGTERM', async () => {
    console.log('\n🛑 Cerrando servidor...');
    await disconnectDB();
    process.exit(0);
});

export default prisma;
