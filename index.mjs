import moment from "moment";
import { program } from "commander";

program.option("-k, --keys <keys>", "Number of keys to generate", 10);

program.parse();

const options = program.opts();

let now = moment();
let filename = `keys-${now.toString()}.txt`;
console.log(`Generating ${options.keys} keys to ${filename}...`);

let fragment = (length) => {
  return Math.random()
    .toString(36)
    .substring(2, 2 + length);
};

for (let index = 0; index < options.keys; index++) {
  let key = `${fragment(5)}-${fragment(5)}-${fragment(5)}`.toUpperCase();
  console.log(key);
}

console.log(`Generation complete!`);
