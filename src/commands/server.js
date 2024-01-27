const { spawn, execFile } = require("child_process");

class KillCommand extends Error {}

const runCmd = (cmd) => {
  return new Promise((resolve, reject) => {
    execFile("sh", ["-c", cmd], (error, stdout, stderr) => {
      if (error) {
        console.log("Received error: " + error);
        reject(error);
      }

      console.log("Received data: " + stdout);
      resolve(stdout + "");
    });
  });
};

const startProgram = async (cmd) => {
  return new Promise((resolve, reject) => {
    const child = spawn("sh", ["-c", cmd]);

    child.stdout.on("data", (data) => {
      resolve(data);
    });
    child.stderr.on("data", (data) => {
      reject(data);
    });
    child.addListener("exit", (code) => {
      console.log(`Received exit code ${code}`);
      resolve("");
    });
  });
};

const startPalServer = async (runner) => {
  try {
    console.log("Starting PalServer");

    const id = await getPalServerPID();
    if (id != null) {
      runner.send("PalServer is still running. Stop it first.");
      return;
    }

    const line = await startProgram("$HOME/palserver.sh");
    console.log("Started pal server " + line);
  } catch (e) {
    runner.send("Failed to start server: " + e);
  }
};

const stopPalServer = async (runner) => {
  try {
    console.log("Stopping PalServer");

    const id = await getPalServerPID();
    if (id == null) {
      runner.send("PalServer is not running");
      return;
    }

    const line = await killProgram(id);
    runner.send("PalServer is stopping");
    console.log("Stopping: " + line);
  } catch (e) {
    runner.send("Failed to stop server: " + e);
  }
};

const updatePalServer = async (runner) => {
  try {
    console.log("Updating PalServer");

    const result = await runCmd(
      "steamcmd +login anonymous +app_update 2394010 validate +quit"
    );
    runner.send("PalServer updated");
  } catch (e) {
    runner.send("Failed to update server: " + e);
  }
};

const zerotierStatus = async () => {
  console.log("Check zerotier status");
  const countStr = await runCmd('netstat -lnut | grep ":9993" | wc -l');
  const count = parseInt(countStr);
  return count > 0;
};

const getPalServerPID = async () => {
  console.log("Check pal server status");
  const line = await runCmd(
    `ps x | grep "PalServer-Linux" | grep -v "grep" | awk '{ print $1 }'`
  );

  if (!line || line.trim() !== "") {
    const x = parseInt(line);
    if (isNaN(x)) {
      return null;
    }
    return x;
  }

  return null;
};

const killProgram = async (pid) => {
  console.log(`Killing program with pid ${pid}`);
  await runCmd(`kill ${pid}`);
};

const zerotierIp = async (runner) => {
  const zeroIp = await runCmd(
    `ip address show zt5u4u6p76 | grep "inet " | awk '{ print $2 }' | cut -d '/' -f 1`
  );
  const ip4 = await runCmd(
    `ip address show wlan0 | grep "inet " | awk '{ print $2 }' | cut -d '/' -f 1`
  );
  const ip6 = await runCmd(
    `ip address show wlan0 | grep "inet6 " | awk '{ print $2 }' | cut -d '/' -f 1`
  );

  runner.send(`Zerotier IP: ${zeroIp ?? '-'}`);
  runner.send(`Local IPv4: ${ip4 ?? '-'}`);
  runner.send(`Local IPv6: ${ip6 ?? '-'}`);
};

const serverStatus = async (runner) => {
  try {
    const isOnline = await zerotierStatus();
    const palID = await getPalServerPID();
    runner.send(`Zerotier: ${isOnline ? "online" : "offline"}
PalServer: ${palID != null ? "online" : "offline"}
`);
  } catch (e) {
    runner.send(`Error: ${e}`);
  }
};

module.exports = {
  serverStatus,
  startPalServer,
  stopPalServer,
  zerotierIp,
  updatePalServer,
  KillCommand,
};
