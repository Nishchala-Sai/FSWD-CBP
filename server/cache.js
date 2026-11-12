// Optional Valkey cache. If VALKEY_URL is unset or Valkey is not running,
// get() returns null and set() does nothing, so the API works without it.
const Valkey = require('iovalkey');

let client = null;

if (process.env.VALKEY_URL) {
  const valkey = new Valkey(process.env.VALKEY_URL, { lazyConnect: true, retryStrategy: () => null });
  valkey.on('error', () => {}); // a failed connect is reported below
  valkey
    .connect()
    .then(() => {
      client = valkey;
      console.log('Valkey connected - forecast caching on');
    })
    .catch(() => console.log('Valkey not reachable - forecast caching off'));
}

const get = async (key) => (client ? JSON.parse(await client.get(key).catch(() => null)) : null);

const set = async (key, value, seconds = 60) => {
  if (client) await client.set(key, JSON.stringify(value), 'EX', seconds).catch(() => {});
};

module.exports = { get, set };
