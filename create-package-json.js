import * as fs from 'fs';

// read file into JSON
const pkg = JSON.parse(fs.readFileSync('package.json', 'utf-8'));

// adjust pkg json however you like ..
delete pkg["devDependencies"];

// write it to your output directory
fs.writeFileSync(
  './package/package.json', // path to your output directory may vary
  JSON.stringify(pkg, null, 2)
);

console.log("Created package.json");
