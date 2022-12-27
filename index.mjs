import { program } from "commander";
import fs from "fs/promises";
import { EOL } from "os";
import moment from "moment";
import { exit } from "process";

program.option("-k, --keys <keys>", "Number of keys to generate", 10).option("-f, --format <format>", "Timestamp format string", "YYYYMMDD-HHmmss");

program.parse();

const options = program.opts();

let now = moment();
let baseFilename = `keys-${now.format(options.format)}`;
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

let getFragment = (length) => {
  return Math.random()
    .toString(36)
    .substring(2, 2 + length);
};

let keysToWrite = "";

for (let index = 0; index < options.keys; index++) {
  let key = `${getFragment(5)}-${getFragment(5)}-${getFragment(5)}`.toUpperCase();
  keysToWrite += key + EOL;
  console.log(key);
}

await fs.writeFile(filename, keysToWrite, { flag: "wx" });

console.log(`Generation complete!`);
