const winston = require('winston');
const colorizer = winston.format.colorize();
const logger = winston.createLogger({
    format: winston.format.combine(
        winston.format.timestamp({
            format: 'DD-MM-YY HH:mm:ss'
        }),
        winston.format.printf(msg =>
            colorizer.colorize(msg.level, `( ${msg.timestamp} ) - ${msg.level} -> ${msg.message}`)
        )
    ),
    transports: [
        new winston.transports.Console()
    ]
});
winston.addColors({
    error: 'red',
    warn: 'yellow',
    info: 'cyan',
    debug: 'green',
    silly: 'magenta'
});

module.exports={
    logger
};