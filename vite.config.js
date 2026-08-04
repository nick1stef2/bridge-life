import {
  copyFileSync,
  createReadStream,
  existsSync,
  mkdirSync,
  readdirSync,
  statSync,
} from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

const projectRoot = path.dirname(fileURLToPath(import.meta.url));
const videosDir = path.join(projectRoot, "src", "assets", "videos");

function bridgeVideosPlugin() {
  let outDir = path.join(projectRoot, "dist");

  return {
    name: "bridge-videos",
    configResolved(config) {
      outDir = path.resolve(config.root, config.build.outDir);
    },
    configureServer(server) {
      server.middlewares.use("/videos", (req, res, next) => {
        const fileName = decodeURIComponent((req.url || "").split("?")[0].replace(/^\/+/, ""));

        if (!fileName.endsWith(".mp4")) {
          next();
          return;
        }

        const filePath = path.join(videosDir, fileName);

        if (!filePath.startsWith(videosDir) || !existsSync(filePath)) {
          next();
          return;
        }

        const { size } = statSync(filePath);
        const range = req.headers.range;

        res.setHeader("Accept-Ranges", "bytes");
        res.setHeader("Content-Type", "video/mp4");

        if (range) {
          const [startText, endText] = range.replace(/bytes=/, "").split("-");
          const start = Number.parseInt(startText, 10);
          const end = endText ? Number.parseInt(endText, 10) : size - 1;

          if (Number.isFinite(start) && Number.isFinite(end)) {
            res.statusCode = 206;
            res.setHeader("Content-Range", `bytes ${start}-${end}/${size}`);
            res.setHeader("Content-Length", String(end - start + 1));
            createReadStream(filePath, { start, end }).pipe(res);
            return;
          }
        }

        res.setHeader("Content-Length", String(size));
        createReadStream(filePath).pipe(res);
      });
    },
    closeBundle() {
      if (!existsSync(videosDir)) {
        return;
      }

      const outputDir = path.join(outDir, "videos");
      mkdirSync(outputDir, { recursive: true });

      for (const fileName of readdirSync(videosDir)) {
        if (fileName.endsWith(".mp4")) {
          copyFileSync(path.join(videosDir, fileName), path.join(outputDir, fileName));
        }
      }
    },
  };
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), bridgeVideosPlugin()],
});
