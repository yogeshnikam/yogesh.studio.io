const { spawn } = require("child_process");
const path = require("path");

const apiDir = path.join(__dirname, "..", "backend", "api");
const isWin = process.platform === "win32";
const venvPython = path.join(
  apiDir,
  isWin ? ".venv/Scripts/python.exe" : ".venv/bin/python"
);
const python = require("fs").existsSync(venvPython) ? venvPython : "python";

const child = spawn(
  python,
  ["-m", "uvicorn", "app.main:app", "--reload", "--host", "0.0.0.0", "--port", "8000"],
  {
    cwd: apiDir,
    stdio: "inherit",
    shell: isWin,
    env: { ...process.env, PYTHONPATH: apiDir },
  }
);

child.on("exit", (code) => process.exit(code ?? 0));
