import moment from "moment";

console.dir(process.argv);

let keys = 10;

if (process.argv.length === 3) {
  keys = parseInt(process.argv[2]);
}

let now = moment();
let filename = `keys-${now.toString()}.txt`;
console.log(`Generating ${keys} keys to ${filename}...`);

let fragment = (length) => {
  return Math.random().toString(36).substr(2, length);
};

for (let index = 0; index < keys; index++) {
	let key = `${fragment(5)}-${fragment(5)}-${fragment(5)}`.toUpperCase();	
	console.log(key);
}

console.log(`Generation complete!`);
