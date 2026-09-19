#!/usr/bin/env python3
"""Exercise the actual Mac/Windows launchers from fresh release ZIP folders."""
import os
from pathlib import Path
import signal
import socket
import subprocess
import tempfile
import time
import urllib.error
import urllib.request
import zipfile

ROOT = Path(__file__).resolve().parents[1]


def check(archive, expected_name):
    # A previous portal must not accidentally answer for the process under test.
    with socket.socket() as available:
        available.settimeout(0.5)
        if available.connect_ex(("127.0.0.1", 5050)) == 0:
            raise RuntimeError("Port 5050 is already in use; stop that local server before this check")
    with tempfile.TemporaryDirectory(prefix="portal launcher check ") as temporary:
        folder = Path(temporary)
        with zipfile.ZipFile(archive) as source:
            source.extractall(folder)
        project = folder / expected_name
        command = (["cmd", "/d", "/c", str(project / "Start Windows.cmd"), "--no-open"]
                   if os.name == "nt" else ["sh", str(project / "Start.command"), "--no-open"])
        with (folder / "launcher.log").open("w+") as log:
            process = subprocess.Popen(command, cwd=project, stdin=subprocess.DEVNULL,
                                       stdout=log, stderr=subprocess.STDOUT,
                                       start_new_session=os.name != "nt")
            try:
                deadline = time.monotonic() + 240
                while True:
                    if process.poll() is not None:
                        raise RuntimeError(f"Launcher exited early: {process.returncode}")
                    try:
                        log.seek(0)
                        if "Family Trip Portal: http://127.0.0.1:5050/" not in log.read():
                            raise urllib.error.URLError("This launcher has not announced its server yet")
                        with urllib.request.urlopen("http://127.0.0.1:5050/", timeout=2) as response:
                            assert "Fictional demo." in response.read().decode()
                        break
                    except (urllib.error.URLError, TimeoutError):
                        if time.monotonic() >= deadline:
                            raise RuntimeError("Launcher did not serve the portal within four minutes")
                        time.sleep(0.3)
                for route in ["history/", "trip/2034/tides/", "trip/2033/meals/"]:
                    with urllib.request.urlopen("http://127.0.0.1:5050/" + route, timeout=10) as response:
                        assert response.status == 200
                        assert "Fictional demo." in response.read().decode()
                if process.poll() is not None:
                    raise RuntimeError("Launcher stopped during the route checks")
                print(f"PASS: {archive.name}, actual launcher, fresh folder with spaces", flush=True)
            except Exception:
                log.flush()
                log.seek(0)
                print(log.read(), flush=True)
                raise
            finally:
                if os.name == "nt":
                    subprocess.run(["taskkill", "/PID", str(process.pid), "/T", "/F"],
                                   stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
                else:
                    try:
                        os.killpg(process.pid, signal.SIGTERM)
                    except ProcessLookupError:
                        pass
                process.wait(timeout=15)


if __name__ == "__main__":
    for kind in ["source", "demo"]:
        name = "family-trip-portal-" + ("demo-" if kind == "demo" else "") + "1.0.0"
        check(ROOT / "artifacts/release" / f"family-trip-portal-{kind}-1.0.0.zip", name)
