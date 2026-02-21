// Utilitaire de journalisation — Winston logger
// Configure les transports console et fichiers pour le suivi applicatif

import winston from 'winston';
import path from 'path';

const { combine, timestamp, printf, colorize, errors } = winston.format;

// Format personnalisé pour les logs
const logFormat = printf((info) => {
  const msg = (info.stack as string | undefined) || String(info.message);
  return `${String(info.timestamp)} [${info.level}]: ${msg}`;
});

const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: combine(
    errors({ stack: true }),
    timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    logFormat
  ),
  transports: [
    // Transport console avec couleurs
    new winston.transports.Console({
      format: combine(
        colorize({ all: true }),
        timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
        logFormat
      ),
    }),
    // Transport fichier pour les erreurs uniquement
    new winston.transports.File({
      filename: path.join('logs', 'error.log'),
      level: 'error',
      maxsize: 5 * 1024 * 1024, // 5 Mo
      maxFiles: 5,
    }),
    // Transport fichier pour tous les niveaux
    new winston.transports.File({
      filename: path.join('logs', 'combined.log'),
      maxsize: 5 * 1024 * 1024, // 5 Mo
      maxFiles: 5,
    }),
  ],
  // Ne pas quitter en cas d'erreur non gérée
  exitOnError: false,
});

export default logger;
