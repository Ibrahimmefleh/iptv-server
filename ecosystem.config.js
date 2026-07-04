module.exports = {
  apps: [
    {
      name: 'iptv-streaming-server',
      script: './server.js',
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '1G',
      env: {
        NODE_ENV: 'production',
        PORT: 3000,
        CHANNEL1_SOURCE: 'http://ugeen.live:8080/Ugeen_VIPwM1NS0/mn9Nz8/4527',
        CHANNEL2_SOURCE: 'http://ugeen.live:8080/Ugeen_VIP81PGr0/SevCYn/4530',
        CHANNEL3_SOURCE: 'http://ugeen.live:8080/Ugeen_VIPPW6mXp/ovdB6d/154',
        CHANNEL4_SOURCE: 'http://ugeen.live:8080/Ugeen_VIPRL6Q3u/5rjaYz/168'
      }
    }
  ]
};
