## BackEnd

This backend is built to be ran as a docker container.  You can start the service with

```bash
docker compose up --build
```

Available npm scripts are:

```bash
npm run start
npm run dev
npm run lint
npm run format
```

Copy the .env.example to be a .env file and fill out the variables appropriately.  The defaults should work just fine, but you might need to deal with file ownership issues in /var/log or /opt/ depending on how this will be deployed.

The docker container relies on having access to a /var/log/Ginzu-Valuation folder, a ginzu.db file in the BackEnd folder, and a ticker.txt file in ../common/ticker.

If you add the appropriate secrets to github, the [deploy_backend.yml] workflow will deploy this backend when manually triggered.