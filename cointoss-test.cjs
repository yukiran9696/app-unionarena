const { io } = require("socket.io-client");

function connect(name, role, roomId = "TOSSTEST") {
  return new Promise((resolve) => {
    const s = io("http://localhost:3000", { path: "/socket.io", transports: ["websocket"] });
    s.on("connect", () => s.emit("room:join", { roomId, name, role }));
    s.on("room:state", () => resolve(s));
  });
}

(async () => {
  const s1 = await connect("Alice", "player");
  const s2 = await connect("Bob", "player");
  const s3 = await connect("Eve", "spectator"); // 観戦者もトス結果を受け取るはず

  const results = await Promise.all([
    new Promise((resolve) => s1.once("cointoss:result", resolve)),
    new Promise((resolve) => s2.once("cointoss:result", resolve)),
    new Promise((resolve) => s3.once("cointoss:result", resolve)),
  ].concat([
    new Promise((resolve) => {
      s1.emit("cointoss:request");
      resolve(null);
    })
  ])).then(([r1, r2, r3]) => ({ r1, r2, r3 }));

  console.log("Alice received:", JSON.stringify(results.r1));
  console.log("Bob   received:", JSON.stringify(results.r2));
  console.log("Eve   received:", JSON.stringify(results.r3));

  const r = results.r1;
  const names = [r.firstPlayer.name, r.secondPlayer.name].sort();
  console.log("先行:", r.firstPlayer.name, "/ 後行:", r.secondPlayer.name);
  console.log(
    names[0] === "Alice" && names[1] === "Bob" ? "PASS: 正しいプレイヤーが割り当てられた" : "FAIL"
  );

  // 1人だけのときのエラーチェック
  const s4 = await connect("Solo", "player", "SOLOTEST");
  await new Promise((resolve) => {
    s4.once("room:error", (msg) => {
      console.log("1人トス エラー:", msg);
      resolve(null);
    });
    s4.emit("cointoss:request");
  });

  s1.disconnect(); s2.disconnect(); s3.disconnect(); s4.disconnect();
  process.exit(0);
})();
