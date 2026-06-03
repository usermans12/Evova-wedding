import express from "express";
import path from "path";
import fs from "fs";
import https from "https";
import { createServer as createViteServer } from "vite";

const app = express();
const PORT = 3000;

// Read firebase configuration to perform light REST fetches on server-side
let firebaseConfig: any = {};
try {
  firebaseConfig = JSON.parse(fs.readFileSync(path.join(process.cwd(), "firebase-applet-config.json"), "utf8"));
} catch (err) {
  console.warn("Configuration firebase-applet-config.json not found, falling back to empty.");
}

const getClientDataBySlug = (slug: string): Promise<any> => {
  return new Promise((resolve) => {
    if (!firebaseConfig.projectId) return resolve(null);
    
    // Call firestore REST API query to locate client by slug dynamically
    const projectId = firebaseConfig.projectId;
    const url = `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents/clients`;
    
    // We send a structured Query to firestore REST endpoint
    const postData = JSON.stringify({
      structuredQuery: {
        from: [{ collectionId: "clients" }],
        where: {
          fieldFilter: {
            field: { fieldPath: "slug" },
            op: "EQUAL",
            value: { stringValue: slug }
          }
        },
        limit: 1
      }
    });

    const req = https.request(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Content-Length": Buffer.byteLength(postData)
      }
    }, (res) => {
      let data = "";
      res.on("data", (chunk) => { data += chunk; });
      res.on("end", () => {
        try {
          const parsed = JSON.parse(data);
          if (Array.isArray(parsed) && parsed[0]?.document) {
            const fields = parsed[0].document.fields;
            // Parse Firestore document structure back to client fields
            const dataFields = fields?.data?.mapValue?.fields;
            
            const groomName = dataFields?.groomName?.stringValue || "";
            const brideName = dataFields?.brideName?.stringValue || "";
            const groomNick = dataFields?.groomNick?.stringValue || "";
            const brideNick = dataFields?.brideNick?.stringValue || "";
            const theme = dataFields?.theme?.stringValue || "theme-blue-hydrangea";
            
            // Get cover image at array index 4 or fallback to index 0
            const imagesValues = dataFields?.images?.arrayValue?.values || [];
            const images = imagesValues.map((v: any) => v.stringValue || "").filter(Boolean);
            const imageUrl = images[4] || images[0] || "https://lh3.googleusercontent.com/d/1eSAqduDmZGPOer-mTBhSDKwpePJjXegJ";

            resolve({
              groomName,
              brideName,
              groomNick,
              brideNick,
              theme,
              coverImage: imageUrl
            });
          } else {
            resolve(null);
          }
        } catch (e) {
          resolve(null);
        }
      });
    });

    req.on("error", () => resolve(null));
    req.write(postData);
    req.end();
  });
};

const getClientDataById = (id: string): Promise<any> => {
  return new Promise((resolve) => {
    if (!firebaseConfig.projectId) return resolve(null);
    const projectId = firebaseConfig.projectId;
    const url = `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents/clients/${id}`;

    https.get(url, (res) => {
      let data = "";
      res.on("data", (chunk) => { data += chunk; });
      res.on("end", () => {
        try {
          const parsed = JSON.parse(data);
          if (parsed?.fields) {
            const dataFields = parsed.fields?.data?.mapValue?.fields;
            const groomName = dataFields?.groomName?.stringValue || "";
            const brideName = dataFields?.brideName?.stringValue || "";
            const groomNick = dataFields?.groomNick?.stringValue || "";
            const brideNick = dataFields?.brideNick?.stringValue || "";
            const theme = dataFields?.theme?.stringValue || "theme-blue-hydrangea";
            
            const imagesValues = dataFields?.images?.arrayValue?.values || [];
            const images = imagesValues.map((v: any) => v.stringValue || "").filter(Boolean);
            const imageUrl = images[4] || images[0] || "https://lh3.googleusercontent.com/d/1eSAqduDmZGPOer-mTBhSDKwpePJjXegJ";

            resolve({
              groomName,
              brideName,
              groomNick,
              brideNick,
              theme,
              coverImage: imageUrl
            });
          } else {
            resolve(null);
          }
        } catch (e) {
          resolve(null);
        }
      });
    }).on("error", () => resolve(null));
  });
};

// Handle indexing routes for meta injection
const handleMetaInjection = async (req: express.Request, res: express.Response, indexPath: string) => {
  let html = "";
  try {
    html = fs.readFileSync(indexPath, "utf8");
  } catch (err) {
    return res.status(500).send("Index template not found.");
  }

  // Detect slug or clientId
  const matchSlug = req.path.match(/^\/(wedding|invitation)\/([a-zA-Z0-9_-]+)/);
  const clientId = req.query.client as string;
  let clientMeta: any = null;

  if (matchSlug) {
    const slug = matchSlug[2];
    clientMeta = await getClientDataBySlug(slug);
  } else if (clientId) {
    clientMeta = await getClientDataById(clientId);
  }

  if (clientMeta) {
    const title = `Pernikahan ${clientMeta.groomNick || clientMeta.groomName.split(" ")[0]} & ${clientMeta.brideNick || clientMeta.brideName.split(" ")[0]} 💍`;
    const desc = `Undangan Pernikahan digital kehormatan kami kepada Bapak/Ibu/Saudara/i untuk merayakan penyatuan suci ${clientMeta.groomName} & ${clientMeta.brideName}.`;
    const image = clientMeta.coverImage;

    // Inject tags replacing standard head templates
    html = html
      .replace(/<title>[^<]*<\/title>/i, `<title>${title}</title>`)
      .replace(/<meta\s+property="og:title"\s+content="[^"]*"/i, `<meta property="og:title" content="${title}"`)
      .replace(/<meta\s+property="og:description"\s+content="[^"]*"/i, `<meta property="og:description" content="${desc}"`)
      .replace(/<meta\s+property="og:image"\s+content="[^"]*"/i, `<meta property="og:image" content="${image}"`)
      .replace(/<meta\s+property="og:image:secure_url"\s+content="[^"]*"/i, `<meta property="og:image:secure_url" content="${image}"`)
      .replace(/<meta\s+name="description"\s+content="[^"]*"/i, `<meta name="description" content="${desc}"`);
  }

  res.send(html);
};

// API Mock status
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", mode: process.env.NODE_ENV || "development" });
});

async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    
    // For development, intercept routes to do hot meta injections on index.html
    app.use(async (req, res, next) => {
      const url = req.originalUrl;
      const matchSlug = url.match(/^\/(wedding|invitation)\/([a-zA-Z0-9_-]+)/) || req.query.client;
      
      if (matchSlug && !url.startsWith("/api") && !url.includes(".")) {
        try {
          const indexPath = path.join(process.cwd(), "index.html");
          let transformed = await vite.transformIndexHtml(url, fs.readFileSync(indexPath, "utf8"));
          
          // Inject dynamic metadata directly in transformed HTML
          const slug = url.match(/^\/(wedding|invitation)\/([a-zA-Z0-9_-]+)/)?.[2];
          const clientId = req.query.client as string;
          let clientMeta: any = null;

          if (slug) {
            clientMeta = await getClientDataBySlug(slug);
          } else if (clientId) {
            clientMeta = await getClientDataById(clientId);
          }

          if (clientMeta) {
            const title = `Pernikahan ${clientMeta.groomNick || clientMeta.groomName.split(" ")[0]} & ${clientMeta.brideNick || clientMeta.brideName.split(" ")[0]} 💍`;
            const desc = `Undangan Pernikahan digital kehormatan kami kepada Bapak/Ibu/Saudara/i untuk merayakan penyatuan suci ${clientMeta.groomName} & ${clientMeta.brideName}.`;
            const image = clientMeta.coverImage;

            transformed = transformed
              .replace(/<title>[^<]*<\/title>/i, `<title>${title}</title>`)
              .replace(/<meta\s+property="og:title"\s+content="[^"]*"/i, `<meta property="og:title" content="${title}"`)
              .replace(/<meta\s+property="og:description"\s+content="[^"]*"/i, `<meta property="og:description" content="${desc}"`)
              .replace(/<meta\s+property="og:image"\s+content="[^"]*"/i, `<meta property="og:image" content="${image}"`)
              .replace(/<meta\s+property="og:image:secure_url"\s+content="[^"]*"/i, `<meta property="og:image:secure_url" content="${image}"`)
              .replace(/<meta\s+name="description"\s+content="[^"]*"/i, `<meta name="description" content="${desc}"`);
          }
          
          return res.status(200).set({ "Content-Type": "text/html" }).end(transformed);
        } catch (e: any) {
          vite.ssrFixStacktrace(e);
          return next(e);
        }
      }
      
      next();
    });

    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    
    // Intercept client links, inject dynamically generated metadata and return
    app.get(["/wedding/:slug", "/invitation/:slug"], async (req, res) => {
      await handleMetaInjection(req, res, path.join(distPath, "index.html"));
    });

    app.get("/", async (req, res, next) => {
      if (req.query.client) {
        await handleMetaInjection(req, res, path.join(distPath, "index.html"));
      } else {
        next();
      }
    });

    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on port ${PORT}`);
  });
}

startServer();
