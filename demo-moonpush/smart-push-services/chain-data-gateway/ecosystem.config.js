module.exports = {
    apps: [{
        name: "10000-data-interchange-service",
        script: "./dist/main.js",
        max_memory_restart: '1024M',
        node_args: '--max-old-space-size=1024',
        args: '',
        env: {
            PORT: 10000,
            AMQP_HOST: 'amqp://data-interchange:data-interchange@16.163.5.216:5672/'
        }
    }]
}