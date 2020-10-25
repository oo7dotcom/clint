import yargs from "yargs/yargs";
import Lambda from "./provider/aws/lambda";
import SFN from "./provider/aws/sfn";

let $ = yargs(process.argv.slice(2));
const modules = [Lambda, SFN];

for (const moduleDef of modules) {
    $ = moduleDef.register($);
}

$.help().argv;
