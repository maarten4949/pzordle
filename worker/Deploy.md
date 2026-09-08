To deploy to cloudflare workers:
```
npx wrangler deploy --config wrangler.toml
```

Run worker
```
npx wrangler dev --config wrangler.toml
```


Run scheduled task
```
npx wrangler dev --test-scheduled --config wrangler.toml
```
