const fs = require("fs");
const fsp = fs.promises;
const path = require("path");
const YAML = require("yaml");
async function createDir(path) {
  try {
    await fsp.mkdir(path, { recursive: true });
    console.log(`Directory "${path}" is ready!`);
  } catch (err) {
    console.error(`Error creating directory: ${err.message}`);
  }
};
async function deleteDir(path) {
  try {
    await fsp.rm(path, { recursive: true, force: true });
    console.log(`Directory "${path}" deleted!`);
  } catch (err) {
    console.error(`Error deleting directory: ${err.message}`);
  }
}
function fileName(text) {
	text = text
		.replace(/\s+/g, "_")
		.replace(/(?:^_|_$)/g, "")
		.toLowerCase();
	return text;
}
function reverse(text) {
	const replacements = [
		["<", ">"],
		["(", ")"],
		["[", "]"],
		["{", "}"]
	]
	let output = "";
	for (let i = -1; i >= -text.length; i--) {
		output += text.at(i);
	};
	const pattern = [
		"!^",
"$!"
	];
	const replacementsLength = replacements.length
	for (let i = 0; i < replacementsLength; i++) {
		replacements[i].forEach(item => {
			item = `${pattern[0]}${replacements[i][1]}${pattern[1]}`
		});
		const replacementList = [replacements[i][0], `${pattern[0]}${i}${pattern[1]}`, replacements[i][1]]
		output = output
			.replace(replacementList[0], replacementList[1])
			.replace(replacementList[2], replacementList[0])
			.replace(replacementList[1], replacementList[2])
	};
	return output;
};
class Story {
	static instances = [];
	constructor(
		title = "Title",
		{
			girl = {
				name: "Girl",
				species: "Species"
			},
			boy = {
				name: "Boy",
				species: "Species"
			}
		} = {}
	) {
		this.title = title;
		this.girl = {
...girl
};
		this.boy = {
...boy
};
this.girl.name = girl.name ? girl.name : "Girl";
this.boy.name = boy.name ? boy.name : "Boy";
this.girl.nameFirst = girl.name ? girl.name[0] : "G";
this.boy.nameFirst = boy.name ? boy.name[0] : "B";
		this.plot = "";
		this.notes = "";
		this.labels = {
			header: "Write Me A Story",
			title: this.title,
			characters: "Characters",
			plot: "Plot",
			notes: "Notes"
		};
		Story.instances.push(this);
	};
	get characters() {
		return `
- ${this.girl.name}
	- ${this.girl.species}
- ${this.boy.name}
	- ${this.boy.species}
`
			.replace(/- name\n\t- species/gi, "");
	};
	write() {
		this.output = `${this.labels.header}\n${"*".repeat(this.labels.header.length)}`;
["title","characters","plot","notes"].forEach(section => {
if (this[section].replace(/[^a-z]/gi, "")) {
this.output += `\n${section === "title" ? "\"" : ""}${this.labels[section]}${section === "title" ? "\"" : ""}\n${`${section === "title" ? "=" : "-"}`.repeat(this.labels[section].length) + `${section === "title" ? "==" : ""}`}${!["title","characters"].includes(section) ? "\n" : ""}${section !== "title" ? this[section] : "\n"}`
};
});
		this.output = this.output
			.replace(/(?:^\s+|\s+$)/g, "")
			.replace(/<!--/g, "COMMENT-START")
			.replace(/-->/g, "COMMENT-END")
			.replace(/([^\-])\-{2}([^\-])/g, "$1&mdash;$2")
			.replace(/COMMENT-START/g, "<!--")
			.replace(/COMMENT-END/g, "-->")
			.replace(/([\t {4}]?)- (.)/g, (match, p1, p2) => `${p1}- ${p2.toUpperCase()}`)
			.replace(/\n{3,}/g, "\n".repeat(2))
		fs.writeFile(
			path.join(
				"stories",
				`${fileName(this.title)
				}.md`
			),
			this.output,
			(err) => {
				if (err) {
					console.error("Something went wrong: ", err);
					return;
				}
			}
		);
	};
};
// Simple template filler
function fillTemplate(template, context) {
  return template.replace(/\{\{\s*([^\s}]+)\s*\}\}/g, (_, expr) => {
    try {
      return expr.split(".").reduce((acc, key) => acc[key], context);
    } catch {
      return `{{ ${expr} }}`;
    }
  });
}
(async () => {
const directory = "./stories";
await deleteDir(directory);
await createDir(directory);
})();
// Read all .yaml files in the data directory
const dataDir = path.join(__dirname, "data");
const yamlFiles = fs.readdirSync(dataDir).filter(file => file.endsWith(".yaml"));
for (const file of yamlFiles) {
	const yamlRaw = fs.readFileSync(path.join(dataDir, file), "utf-8");
	const yamlData = YAML.parse(yamlRaw);
	const story = new Story(
		yamlData.title,
		{
			girl: yamlData.girl,
			boy: yamlData.boy
		}
	);
const context = {
g: story.girl,
b: story.boy
};
	story.plot = fillTemplate(yamlData.plot || "", context);
	story.notes = fillTemplate(yamlData.notes || "", context);
	story.write();
if (/undefined/.test(story.output)) {
console.error(`ERROR: There are undefined variables in "${story.title}":`);
story.output.match(/^.*undefined.*$/gm).forEach(match => {
console.log(`\t${match}`);
});
};
	if (story.title === "Title") {
		const {
title,
plot,
notes,
girl: g,
boy: b
} = story;
		const titlePadding = "-=:|";
const logOutput = [
`${"●".repeat(50)}
\t\x1b[1m\x1b[35m${titlePadding}\x1b[4m"${title}"\x1b[0m\x1b[1m\x1b[35m${reverse(titlePadding)}\x1b[0m
__Plot__
${plot}
__Notes__
${notes}`,
`${"●".repeat(50)}
Write Me A Story
${"*".repeat("Write Me A Story".length)}
# "${title}"
## Plot
${plot}## Notes
${notes}${"●".repeat(50)}`
];
		console.log(logOutput[0]
			.replace(/\t/g, " ".repeat(4))
			.replace(/([_\*]{2})(.+?)\1/g, "\x1b[31m\x1b[1m$2\x1b[0m")
			.replace(/([_\*]{1})(.+?)\1/g, "\x1b[32m\x1b[3m$2\x1b[0m")
			.replace(/"(.+?)"/g, "\x1b[36m\"$1\"\x1b[0m")
			.replace(new RegExp(`((?:${g.name}|${b.name}|${g.species}|${b.species})[a-z']*)`, "gi"), "\x1b[33m\x1b[4m$1\x1b[0m")
			.replace(/\s+\n/g, "\n")
		);
	};
};