module.exports = {
    apps: [{
        name: "30000-notify-service",
        script: "./dist/main.js",
        max_memory_restart: '1024M',
        node_args: '--max-old-space-size=1024',
        args: '',
        env: {
            PORT: 30000,
            AMQP_HOST: 'amqp://data-interchange:data-interchange@16.163.5.216:5672/',
            POSTGRES_HOST: "localhost",
            POSTGRES_PORT: "5432",
            POSTGRES_DATABASE: "dev-smart-notify",
            POSTGRES_USERNAME: "postgres",
            POSTGRES_PASSWORD: "Dev123!@#",
        }
    }]
}