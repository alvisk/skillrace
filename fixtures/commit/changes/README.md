# sample-items-api

A tiny JSON API serving a paginated list of items.

## Usage

```sh
npm start
curl localhost:3000/items?page=0
```

## Rate limiting

Requests are limited to 100 per minute per client IP. Exceeding the limit
returns `429 Too Many Requests` with a `retry-after` header.
