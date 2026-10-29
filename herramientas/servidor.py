"""Servidor estático para el prototipo, con soporte de Range (para poder saltar dentro de los videos)."""
import os
import re
import sys
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer


class Handler(SimpleHTTPRequestHandler):
    def send_head(self):
        rango = self.headers.get("Range")
        ruta = self.translate_path(self.path)
        if not rango or not os.path.isfile(ruta):
            return super().send_head()
        m = re.match(r"bytes=(\d*)-(\d*)", rango)
        total = os.path.getsize(ruta)
        if not m:
            return super().send_head()
        ini = int(m.group(1)) if m.group(1) else max(0, total - int(m.group(2)))
        fin = int(m.group(2)) if m.group(1) and m.group(2) else total - 1
        fin = min(fin, total - 1)
        if ini > fin:
            self.send_error(416)
            return None
        f = open(ruta, "rb")
        f.seek(ini)
        self.send_response(206)
        self.send_header("Content-Type", self.guess_type(ruta))
        self.send_header("Content-Range", f"bytes {ini}-{fin}/{total}")
        self.send_header("Content-Length", str(fin - ini + 1))
        self.send_header("Accept-Ranges", "bytes")
        self.end_headers()
        self._resto = fin - ini + 1
        return f

    def copyfile(self, source, outputfile):
        resto = getattr(self, "_resto", None)
        if resto is None:
            return super().copyfile(source, outputfile)
        while resto > 0:
            trozo = source.read(min(65536, resto))
            if not trozo:
                break
            outputfile.write(trozo)
            resto -= len(trozo)
        self._resto = None


if __name__ == "__main__":
    puerto, carpeta = int(sys.argv[1]), sys.argv[2]
    os.chdir(carpeta)
    ThreadingHTTPServer(("127.0.0.1", puerto), Handler).serve_forever()
