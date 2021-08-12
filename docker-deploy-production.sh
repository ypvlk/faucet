#!/bin/bash

# chmod +x file.sh

npm run rollback
npm run migrate
pm2 start pm2_config/config.json
#echo 'SETUP SACCESS'
