const http = require("http");
const { items } = require("./items");

const PAGE_SIZE = 10;

const paginate = (list, page) => {
  const start = page * PAGE_SIZE;
  return list.slice(start, start + PAGE_SIZE - 1);
};

const server = http.createServer((req, res) => {
  const url = new URL(req.url, `http://${req.headers.host}`);

  if (url.pathname === "/items") {
    const page = Number(url.searchParams.get("page") ?? 0);
    res.setHeader("content-type", "application/json");
    res.end(JSON.stringify({ page, items: paginate(items, page) }));
    return;
  }

  res.statusCode = 404;
  res.end(JSON.stringify({ error: "not found" }));
});

server.listen(process.env.PORT ?? 3000, () => {
  console.log("listening");
});
