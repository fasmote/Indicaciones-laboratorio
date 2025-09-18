import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import path from 'path';
import { fileURLToPath } from 'url';
import { connectDB, healthCheck } from './database/prisma.js';

// Importar rutas
import practicasRoutes from './routes/practicas.js';
import gruposRoutes from './routes/grupos.js';
import indicacionesRoutes from './routes/indicaciones.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

// Middlewares
app.use(helmet({
    contentSecurityPolicy: false // Permitir inline scripts para desarrollo
}));
app.use(cors());
app.use(morgan('combined'));
app.use(express.json({ limit: '50mb' })); // Aumentado para manejar Excel grandes
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Servir archivos estáticos
app.use(express.static(path.join(__dirname, '../public')));

// Middleware para verificar conexión DB
app.use('/api', async (req, res, next) => {
    try {
        next();
    } catch (error) {
        console.error('Database middleware error:', error);
        res.status(500).json({
            success: false,
            message: 'Error de conexión a la base de datos',
            error: error.message
        });
    }
});

// Rutas de la API
app.use('/api/practicas', practicasRoutes);
app.use('/api/grupos', gruposRoutes);
app.use('/api/indicaciones', indicacionesRoutes);

// Ruta principal para servir la interfaz web
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../public/index.html'));
});

// Ruta para el cargador de datos reales
app.get('/cargador', (req, res) => {
    res.sendFile(path.join(__dirname, '../public/cargador.html'));
});

// Ruta de health check mejorada
app.get('/api/health', async (req, res) => {
    try {
        const dbStatus = await healthCheck();
        res.json({
            status: 'OK',
            message: 'Sistema de Indicaciones de Laboratorio funcionando correctamente',
            timestamp: new Date().toISOString(),
            version: '1.0.0',
            database: dbStatus,
            uptime: process.uptime(),
            memory: {
                used: Math.round(process.memoryUsage().heapUsed / 1024 / 1024) + ' MB',
                total: Math.round(process.memoryUsage().heapTotal / 1024 / 1024) + ' MB'
            }
        });
    } catch (error) {
        console.error('Health check error:', error);
        res.status(500).json({
            status: 'ERROR',
            message: 'Error en el sistema',
            error: error.message,
            timestamp: new Date().toISOString()
        });
    }
});

// Ruta para verificar datos
app.get('/api/debug/count', async (req, res) => {
    try {
        const { PrismaClient } = await import('@prisma/client');
        const prisma = new PrismaClient();
        
        const counts = await Promise.all([
            prisma.practica.count(),
            prisma.grupo.count(),
            prisma.indicacion.count(),
            prisma.practicaGrupo.count(),
            prisma.grupoIndicacion.count()
        ]);
        
        res.json({
            success: true,
            data: {
                practicas: counts[0],
                grupos: counts[1],
                indicaciones: counts[2],
                practicaGrupo: counts[3],
                grupoIndicacion: counts[4]
            }
        });
        
        await prisma.$disconnect();
    } catch (error) {
        console.error('Debug count error:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// Manejo de errores 404
app.use((req, res) => {
    res.status(404).json({
        success: false,
        error: 'Ruta no encontrada',
        path: req.path,
        method: req.method
    });
});

// Manejo de errores globales
app.use((err, req, res, next) => {
    console.error('Error global:', err);
    res.status(500).json({
        success: false,
        error: 'Error interno del servidor',
        message: process.env.NODE_ENV === 'development' ? err.message : 'Algo salió mal',
        stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
    });
});

// Inicializar base de datos y servidor
async function startServer() {
    try {
        console.log('🚀 Iniciando Sistema de Indicaciones de Laboratorio...');
        
        // Conectar a la base de datos
        const dbConnected = await connectDB();
        if (!dbConnected) {
            console.error('❌ No se pudo conectar a la base de datos');
            process.exit(1);
        }

        // Iniciar servidor
        app.listen(PORT, () => {
            console.log(`\n✅ Servidor corriendo exitosamente!`);
            console.log(`📍 URL: http://localhost:${PORT}`);
            console.log(`📊 Base de datos: SQLite (Prisma)`);
            console.log(`🔧 Entorno: ${process.env.NODE_ENV || 'development'}`);
            console.log(`\n🔗 URLs importantes:`);
            console.log(`   🏥 Aplicación principal: http://localhost:${PORT}`);
            console.log(`   🚀 Cargador datos reales: http://localhost:${PORT}/cargador`);
            console.log(`   ❤️  Health check: http://localhost:${PORT}/api/health`);
            console.log(`   📈 Debug info: http://localhost:${PORT}/api/debug/count`);
            console.log(`\n🎯 Para cargar datos reales del Excel, ve a:`);
            console.log(`   http://localhost:${PORT}/cargador`);
            console.log('\n-------------------------------------------\n');
        });

    } catch (error) {
        console.error('❌ Error iniciando el servidor:', error);
        process.exit(1);
    }
}

// Iniciar el servidor
startServer();

export default app;
