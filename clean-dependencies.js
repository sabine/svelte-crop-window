import * as fs from 'fs';

let p = JSON.parse(fs.readFileSync("package/package.json"));

delete p["devDependencies"];
p["devDependencies"] = {};

fs.writeFileSync("package/package.json", JSON.stringify(p, null, 2));

console.log("Removed devDependencies");
