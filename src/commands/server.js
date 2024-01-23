const { spawn } = require("child_process");

const runCmd = (cmd) => {
  return new Promise((resolve, reject) => {
    const child = spawn("sh", ["-c", cmd]);

    child.stdout.on("data", (data) => {
      console.log('Received data: ' + data);
      resolve(data + '');
    });

    child.stderr.on("data", (data) => {
      console.log('Received error: ' + data);
      reject(data);
    });

    child.addListener("exit", (code) => {
      console.log('Received exit code: ' + code);
      resolve("");
    });
  });
};

const zerotierStatus = async () => {
  console.log('Check zerotier status');
  const countStr = await runCmd('netstat -lnut | grep ":9993" | wc -l');
  const count = parseInt(countStr);
  return count > 0;
};

const getPalServerPID = async () => {
  console.log('Check pal server status');
  const line = await runCmd(`ps -a | grep "palserver.sh" | awk '{ print $1 }'`);

  if (!line || line.trim() !== "") {
    const x = parseInt(line);
    if (isNaN(x)) {
        return null
    }
    return x;
  }

  return null;
};

const serverStatus = async (runner) => {
  try {
    const isOnline = await zerotierStatus();
    const palID = await getPalServerPID();
    runner.send(`Zerotier: ${isOnline ? "online" : "offline"}
PalServer: ${palID != null ? 'online' : 'offline'}
`);
  } catch (e) {
    runner.send(`Error: ${e}`);
  }
};

module.exports = { serverStatus };
