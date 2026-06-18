
async function testFetch() {
  const res = await fetch("https://www.turkiyeshell.com/pompatest/", {
    headers: {
      "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
    }
  });
  const html = await res.text();
  console.log(html.substring(0, 2000));
}
testFetch();
