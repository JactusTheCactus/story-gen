const fs = require("fs");
const fsp = fs.promises;
const path = require("path");
const YAML = require("yaml");
const args = process.argv.slice(2);
function createPerson(
	person = {
		name: defName,
		species: defSpecies
	},
	defName = "Name",
	defSpecies = "Human"
) {
	const normalized = {
		...person,
		nameLong: person?.name || defName,
		speciesLong: person?.species || defSpecies,
	};
	["name", "species"].forEach(type => {
		const patterns = [
			/^([^(\[\]]+)/,
			/\(([^)]+)\)/,
			/\[([^\]]+)\]/,
			/\{([^\}]+)\}/
		];
		normalized[`${type}Parts`] = {};
		[
			"simple",
			"special",
			"list",
			"detail"
		].forEach(
			(item, i) => {
				normalized[`${type}Parts`][item] = (
					normalized[`${type}Long`].match(patterns[i]) || []
				)[1]?.trim() || null
			});
		normalized[`${type}`] = normalized[`${type}Parts`].simple;
		normalized[`${type}First`] = normalized[`${type}Parts`].simple[0];
		normalized[`${type}Upper`] = normalized[type].toUpperCase();
		normalized[`${type}Lower`] = normalized[type].toLowerCase();
		normalized[`${type}End`] = normalized[`${type}Parts`].special;
		const testList =
			normalized[`${type}Parts`].list
				?
				normalized[`${type}Parts`].list
					.split(/,?\s+/)
					.map(
						item => item.trim()
					)
				:
				[];
		if (testList) {
			for (i = 0; i < testList.length; i++) {
				normalized[`${type}List[${i}]`] = `${testList[i]}`
			}
		};
		const testDetail = normalized[`${type}Parts`].detail ? normalized[`${type}Parts`].detail.split(/[\s,]+/).map(item => item.trim()) : [];
		if (testDetail) {
			for (i = 0; i < testDetail.length; i++) {
				normalized[`${type}Detail[${i}]`] = `${testDetail[i]}`
			}
		};
		normalized[`${type}Specific`] = `${normalized[`${type}Parts`].simple} (${normalized[`${type}Parts`].special})`.replace(/ \(null\)/, "")
			.replace(/ \[.*\]/g, "")
	});
	return normalized;
}
async function clearDir(dirPath) {
	try {
		await fsp.mkdir(dirPath, {
			recursive: true
		});
		const files = await fsp.readdir(dirPath);
		await Promise.all(
			files.map(async (file) => {
				const fullPath = path.join(dirPath, file);
				const stat = await fsp.lstat(fullPath);
				if (stat.isDirectory()) {
					await fsp.rm(fullPath, {
						recursive: true,
						force: true
					});
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
		const replacementList = [
			replacements[i][0],
			`${pattern[0]}${i}${pattern[1]}`,
			replacements[i][1]
		]
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
		this.girl = createPerson(girl, "Girl");
		this.boy = createPerson(boy, "Boy");
		this.plot = "";
		this.notes = "";
		this.labels = {
			header: "Write Me A Story",
			title: this.title || "Title",
			characters: "Characters",
			plot: "Plot",
			notes: "Notes"
		};
		this.style = `<style>body{font:15px"Verdana"};</style>`;
		Story.instances.push(this);
	};
	get characters() {
		return `
- ${this.girl.name}
	- ${this.girl.speciesSpecific}
- ${this.boy.name}
	- ${this.boy.speciesSpecific}
`
			.replace(/- (?:girl|boy)\n\t- species/gi, "");
	};
	write() {
		this.output = `${this.style}

${this.labels.header}
${"*".repeat(this.labels.header.length)}`;
		[
			"title",
			"characters",
			"plot",
			"notes"
		].forEach(section => {
			if (this[section].replace(/[^a-z]/gi, "")) {
				this.output += `\n${section === "title" ? "\"" : ""
					}${this.labels[section]
					}${section === "title" ? "\"" : ""
					}
${`${section === "title" ? "=" : "-"
						}`.repeat(this.labels[section].length) + `${section === "title" ? "==" : ""
						}`
					}${![
						"title",
						"characters"
					].includes(section) ? `
` : ""
					}${section !== "title" ? this[section] : `\n`}`
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
				`${fileName(this.title)}.md`
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
const lineBreak = "●".repeat(40);
(async () => {
	await clearDir("./stories")
	function fillTemplate(template, context) {
		return template.replace(/\{\{\s*([^\s}]+)\s*\}\}/g, (_, expr) => {
			try {
				return expr.split(".").reduce((acc, key) => acc[key], context);
			} catch {
				return `{{ ${expr} }}`;
			}
		});
	}
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
			errorRegex = /^.*(?:undefined|null).*$/gmi;
			console.error(`ERROR: There are ${story.output.match(errorRegex).length} undefined variables in "${story.title}":`);
			story.output.match(errorRegex).forEach(match => {
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
			const logOutput = `${lineBreak}
\x1b[1m\x1b[35m${titlePadding}\x1b[4m"${title}"\x1b[0m\x1b[1m\x1b[35m${reverse(titlePadding)}\x1b[0m
${plot.replace(/\s/g, "") ? `
__Plot__
${plot}` : ""}
${notes.replace(/\s/g, "") ? `
__Notes__
${notes}` : ""}
${lineBreak}`;
			if (
				args.includes("verbose")
			) {
				console.log(logOutput
					.replace(/(?:\t| {2})/g, " ".repeat(4))
					.replace(/([_\*]{2})(.+?)\1/g, "\x1b[31m\x1b[1m$2\x1b[0m")
					.replace(/([_\*]{1})(.+?)\1/g, "\x1b[32m\x1b[3m$2\x1b[0m")
					.replace(/"(.+?)"/g, "\x1b[36m\"$1\"\x1b[0m")
					.replace(new RegExp(`((?:\\b${[
						g.name,
						g.species,
						b.name,
						b.species,
					].filter(Boolean).flat().map(item => item.replace(/\s/g, "")).join("|")
						})\\b[a-z'!.,]*)`, "gi"), "\x1b[33m\x1b[4m$1\x1b[0m")
					.replace(/\s+\n{2,}/g, "\n".repeat(2))
					.replace(/\s*$/g, "")
				);
			}
		};
	};
})();
