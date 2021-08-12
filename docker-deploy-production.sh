#!/bin/bash

# chmod +x file.sh


./wait-for-it.sh mysql:3306

knex migrate:rollback
knex migrate:latest
node main.js faucet -m production
#pm2 start pm2_config/config.json
#echo 'SETUP SACCESS'
