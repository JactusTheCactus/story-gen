const fs = require("fs");
const fsp = fs.promises;
const path = require("path");
const YAML = require("yaml");
const args = process.argv.slice(2);
async function clearDir(dirPath) {
	try {
		// Make sure the directory exists (creates it if not)
		await fsp.mkdir(dirPath, { recursive: true });
		// Read contents of the directory
		const files = await fsp.readdir(dirPath);
		// Remove each item inside the directory
		await Promise.all(
			files.map(async (file) => {
				const fullPath = path.join(dirPath, file);
				const stat = await fsp.lstat(fullPath);
				if (stat.isDirectory()) {
					await fsp.rm(fullPath, { recursive: true, force: true });
				} else {
					await fsp.unlink(fullPath);
				}
			})
		);
	} catch (err) {
		console.error(`Error creating or clearing directory: ${err.message}`);
	}
}
function fileName(text) {
	text = text
		.replace(/\s/g, "_")
		.replace(/(?:^_|_$)/g, "")
		.toLowerCase();
	return text;
}
function reverse(text) {
	const replacements = [
		["<", ">"],
		["(", ")"],
		["[", "]"],
		["{", "}"],
		["\\", "/"]
	]
	let output = "";
	for (let i = -1; i >= -text.length; i--) {
		output += text.at(i);
	};
	const pattern = [
		"^|!|^",
		"$|!|$"
	];
	const replacementsLength = replacements.length
	for (let i = 0; i < replacementsLength; i++) {
		replacements[i].forEach(item => {
			item = `${pattern[0]}${replacements[i][1]}${pattern[1]}`;
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
		this.girl = { ...girl };
		this.boy = { ...boy };
		this.girl.name = girl?.name || "Girl";
		this.boy.name = boy?.name || "Boy";
		this.girl.nameFirst = girl?.name[0] || "G";
		this.boy.nameFirst = boy?.name[0] || "B";
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
		[
			"title",
			"characters",
			"plot",
			"notes"
		].forEach(section => {
			if (this[section].replace(/[^a-z]/gi, "")) {
				this.output += `\n${section === "title" ? "\"" : ""}${this.labels[section]}${section === "title" ? "\"" : ""}\n${`${section === "title" ? "=" : "-"}`.repeat(this.labels[section].length) + `${section === "title" ? "==" : ""}`}${!["title", "characters"].includes(section) ? "\n" : ""}${section !== "title" ? this[section] : "\n"}`
			};
		});
		this.output = this.output
			.replace(/ {2}/g, "\t")
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
(async () => {
	await clearDir("./stories")
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
	// Read all .yaml files in the data directory
	const dataDir = path.join(__dirname, "data");
	const files = fs.readdirSync(dataDir).filter(file => /\.ya?ml$/.test(file));
	for (const file of files) {
		const fileRaw = fs.readFileSync(path.join(dataDir, file), "utf-8");
		const fileData = YAML.parse(fileRaw);
		const story = new Story(
			fileData.title,
			{
				girl: fileData.girl,
				boy: fileData.boy
			}
		);
		const context = {
			g: story.girl,
			b: story.boy
		};
		story.plot = fillTemplate(fileData.plot || "", context);
		story.notes = fillTemplate(fileData.notes || "", context);
		story.write();
		if (/undefined/.test(story.output)) {
			console.error(`ERROR: There are undefined variables in "${story.title}":`);
			story.output.match(/^.*undefined.*$/gm).forEach(match => {
				console.log(`\t${match}`);
			});
		};
		if (new RegExp(`(?:${args.join("|")})\.ya?ml`).test(file)) {
			const {
				title,
				plot,
				notes,
				girl: g,
				boy: b
			} = story;
			const titlePadding = "-=:|";
			const logOutput = `${"●".repeat(50)}

\x1b[1m\x1b[35m${titlePadding}\x1b[4m"${title}"\x1b[0m\x1b[1m\x1b[35m${reverse(titlePadding)}\x1b[0m
${plot.replace(/\s/g, "") ? `
__Plot__
${plot}` : ""}
${notes.replace(/\s/g, "") ? `
__Notes__
${notes}` : ""}
${"●".repeat(50)}`;
			console.log(logOutput
				.replace(/(?:\t| {2})/g, " ".repeat(4))
				.replace(/([_\*]{2})(.+?)\1/g, "\x1b[31m\x1b[1m$2\x1b[0m")
				.replace(/([_\*]{1})(.+?)\1/g, "\x1b[32m\x1b[3m$2\x1b[0m")
				.replace(/"(.+?)"/g, "\x1b[36m\"$1\"\x1b[0m")
				.replace(new RegExp(`((?:${g.name}|${b.name}|${g.species}|${b.species})[a-z':,]*)`, "gi"), "\x1b[33m\x1b[4m$1\x1b[0m")
				.replace(/\s+\n{2,}/g, "\n".repeat(2))
				.replace(/\s*$/g, "")
				.replace(/\s*\n+/g, "\n")
			);
		};
	};
})();
