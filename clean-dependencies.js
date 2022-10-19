import * as fs from 'fs';

let r = JSON.parse(fs.readFileSync("package.json"));
let p = JSON.parse(fs.readFileSync("package/package.json"));

delete p["devDependencies"];
p["devDependencies"] = {
    "svelte": r["devDependencies"]["svelte"],
};

fs.writeFileSync("package/package.json", JSON.stringify(p, null, 2));

console.log("Pruned devDependencies");
