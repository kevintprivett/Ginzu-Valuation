### Cron

You'll need to setup cron to run these scripts regularly as intended

```bash
crontab -e
```

On here you will need to add the following entries.

Note that the sec update pipeline should run after 3 am ET, so adjust your hour
entry accordingly.

``` 
0 0 * * * /opt/Ginzu-Valuation/Pipeline/run_rfr_update_sqlite.sh >> /var/log/Ginzu-Valuation/Pipeline/rfr_cron.log 2>&1
0 4 * * * /opt/Ginzu-Valuation/Pipeline/run_sec_update_pipeline.sh >> /var/log/Ginzu-Valuation/Pipeline/sec_cron.log 2>&1
```

Always test these to ensure that proper permissions are set for your scripts.

Also ensure that the shell scripts are using the correct directory location.
