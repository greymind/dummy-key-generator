import { program } from "commander";
import fs from "fs/promises";
import { EOL } from "os";
import moment from "moment";
import { exit } from "process";
import express from "express";
import stream from "stream";

program
  .option("-k, --keys <keys>", "Number of keys to generate", 10)
  .option("-f, --format <format>", "Timestamp format string", "YYYYMMDD-HHmmss")
  .option("-t, --tag <tag>", "Custom tag to append to filename", (value) => `${value}-`, "")
  .option("-w, --web", "Launch in web server mode", false)
  .option("-d, --download", "Set to download file", false);

program.parse();
const options = program.opts();

const now = moment();

const getKeysToWrite = (keys, eol) => {
  const getFragment = (length) => {
    return Math.random()
      .toString(36)
      .substring(2, 2 + length);
  };

  let keysToWrite = "";

  for (let index = 0; index < keys; index++) {
    let key = `${getFragment(5)}-${getFragment(5)}-${getFragment(5)}`.toUpperCase();
    keysToWrite += key + eol;
    console.log(key);
  }

  return keysToWrite;
};

const runConsoleMode = async () => {
  console.log("Running in console mode...");

  let baseFilename = `keys-${options.tag}${now.format(options.format)}`;
  let extension = ".txt";

  let getAvailableFilename = async (baseFilename, extension) => {
    let filename = baseFilename;
    let counter = 1;

    const getFilename = () => `${filename}${extension}`;

    const checkFilename = async () => {
      try {
        await fs.access(getFilename(), fs.constants.W_OK);

        if (counter > 100) {
          console.error("Too many attempts to find unique filename, exiting...");
          exit(1);
        }

        filename = `${baseFilename}-${counter++}`;
        return await checkFilename();
      } catch (error) {
        switch (error.code) {
          case "ENOENT":
            return getFilename();
          default:
            console.error(`Unknown error ${error.code}`);
            exit(1);
        }
      }
    };

    return await checkFilename();
  };

  const filename = await getAvailableFilename(baseFilename, extension);

  console.log(`Generating ${options.keys} keys to ${filename}...`);

  const keysToWrite = getKeysToWrite(options.keys, EOL);
  await fs.writeFile(filename, keysToWrite, { flag: "wx" });

  console.log(`Generation complete!`);
};

const runWebMode = async () => {
  console.log("Running in web mode...");

  const port = 3002;
  const app = express();

  app.get("/", async (req, res) => {
    const keys = req.query.keys || options.keys;
    const format = req.query.format || options.format;
    const tag = req.query.tag ? `${req.query.tag}-` : options.tag;
    const download = req.query.download || options.download;

    console.log(`New request: keys=${keys}, format=${format}, tag=${tag}, download=${download}`);

    if (download) {
      const readStream = new stream.PassThrough();
      const keysToWrite = getKeysToWrite(keys, EOL);
      readStream.end(keysToWrite);

      const filename = `keys-${tag}${now.format(format)}.txt`;
      res.set("Content-disposition", `attachment; filename=${filename}`);
      res.set("Content-Type", "text/plain");

      readStream.pipe(res);
    } else {
      const keysToWrite = getKeysToWrite(keys, "<BR />");
      res.send(keysToWrite);
    }
  });

  app.get("/help", async (req, res) => {
    res.send("/?keys=<keys>&format=<format>&tag=<tag>&download=<true|false>");
  });

  app.listen(port, () => {
    console.log(`Server listening on port ${port}...`);
  });
};

console.log(options.web);

if (options.web) {
  await runWebMode();
} else {
  await runConsoleMode();
}
