import firebaseConfig from './firebase-applet-config.json' assert { type: 'json' };

async function test() {
  const url = `https://www.googleapis.com/drive/v3/files?q='1t0W9W1aOLhx-eqgbWfcWPu4d8ye8N151'+in+parents&key=${firebaseConfig.apiKey}`;
  const res = await fetch(url);
  console.log(res.status);
  const text = await res.text();
  console.log(text.substring(0, 500));
}
test();
