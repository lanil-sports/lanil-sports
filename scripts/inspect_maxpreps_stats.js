const fetch = require("node-fetch");

async function check() {
  const url = "https://www.maxpreps.com/ca/folsom/folsom-bulldogs/athletes/ryder-lyons/football/stats/?careerid=ufohkivpbcci2";
  const res = await fetch(url, {
    headers: {
      "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
    }
  });

  console.log("Status:", res.status);
  const text = await res.text();
  const nextData = text.match(/<script id="__NEXT_DATA__"[^>]*>([\s\S]*?)<\/script>/);
  if (nextData) {
    const json = JSON.parse(nextData[1]);
    const pageProps = json.props.pageProps;
    console.log("pageProps keys:", Object.keys(pageProps));
    if (pageProps.athlete) {
      console.log("athlete:", pageProps.athlete.firstName, pageProps.athlete.lastName, "photo:", pageProps.athlete.photoUrl);
    }
    if (pageProps.stats) {
      console.log("stats keys:", Object.keys(pageProps.stats));
    }
  }
}

check().catch(console.error);
