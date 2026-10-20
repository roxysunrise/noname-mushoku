require('./online-smoke-preload.cjs');
const originalRequire = window.require;
const socket = originalRequire('ws');
class TestServer extends socket.Server {
  constructor(options, ...rest) { super({ ...options, port: 18080 }, ...rest); }
}
window.require = function (id) { return id === 'ws' ? { ...socket, Server: TestServer } : originalRequire(id); };
