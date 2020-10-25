import yargs from "yargs/yargs";
import Lambda from "./provider/aws/lambda";

let $ = yargs(process.argv.slice(2));
const modules = [Lambda];

for (const moduleDef of modules) {
    $ = moduleDef.register($);
}

$.help().argv;
