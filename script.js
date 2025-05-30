const fs = require("fs");
const path = require("path");
function fileName(text) {
	text = text
		.replace(/[^\w\s]/g, "")
		.replace(/\s+/g, "_")
		.replace(/(?:^_|_$)/g, "")
		.toLowerCase();
	return text;
}
class Story {
	static instances = [];
	constructor(
		title = "Title",
		{
			girl = {
				name: "Name",
				species: "Species"
			},
			boy = {
				name: "Name",
				species: "Species"
			}
		} = {}
	) {
		this.title = title;
		this.girl = { ...girl };
		this.boy = { ...boy };
		this.plot = "";
		this.notes = "";
		this.labels = {
			header: "Write Me A Story",
			title: this.title,
			characters: "Characters",
			plot: "Plot",
			notes: "Notes",
			perl: "Explain In Perl Terms"
		};
		Story.instances.push(this);
	};
	get perl() {
		const perlScript = `
my %${fileName(this.title)} = {
\ttitle => "${this.title}",
\tboy => {
\t\tname => "${this.boy.name}",
\t\tspecies => "${this.boy.species}"
\t},
\tgirl => {
\t\tname => "${this.girl.name}",
\t\tspecies => "${this.girl.species}"
\t}
};
`.trim();
		return `
${this.labels.perl}
${"-".repeat(this.labels.perl.length)}
<!--Because I find Perl hashes the most readable at a glance-->
\`\`\`pl
${perlScript}
\`\`\`
`;
	}
	get characters() {
		return `
- ${this.girl.name}
	- ${this.girl.species}
- ${this.boy.name}
	- ${this.boy.species}
`;
	};
	write() {
		this.output = `${this.labels.header}\n${"*".repeat(this.labels.header.length)}`;
		if (this.title.replace(/\s/g, "")) {
			this.output += `\n\n"${this.labels.title}"\n${"=".repeat(this.labels.title.length + 2)}\n`;
		};
		if (this.characters.replace(/\s/g, "")) {
			this.output += `\n${this.labels.characters}\n${"-".repeat(this.labels.characters.length)}${this.characters}`;
		};
		if (this.plot.replace(/\s/g, "")) {
			this.output += `\n${this.labels.plot}\n${"-".repeat(this.labels.plot.length)}${this.plot}`;
		};
		if (this.notes.replace(/\s/g, "")) {
			this.output += `\n${this.labels.notes}\n${"-".repeat(this.labels.notes.length)}${this.notes}`;
		};
		this.output += this.perl
		this.output = this.output
			.replace(/(?:^\s+|\s+$)/g, "")
			.replace(/<!--/g, "COMMENT-START")
			.replace(/-->/g, "COMMENT-END")
			.replace(/([^\-])\-{2}([^\-])/g, "$1&mdash;$2")
			.replace(/COMMENT-START/g, "<!--")
			.replace(/COMMENT-END/g, "-->");
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
	//console.log(this.output);
};
{
	const vore = new Story(
		"Tick Tock",
		{
			girl: {
				name: "Vera",
				species: "Pred"
			},
			boy: {
				name: "Eli",
				species: "Human"
			}
		}
	);
	{
		const { girl: g, boy: b } = vore;
		vore.plot = `
- ${b.name} is kissing a really cute girl; ${g.name} (he doesn't know she's a ${g.species})
- suddenly, ${g.name} swallows ${b.name} whole
- naturally, ${b.name} pleads and struggles in ${g.name}'s stomach
***
> you know what?
>
> You're actually pretty cute,
> so I'll make you a deal;\\
> if you're still alive and undigested by morning,
> I'll let you out.
>
> If not?
> Well...
> You get to be my breakfast!~
### _MORNING_
${g.name}'s belly was a little softer, a little rounder.
${b.name} _might've_ survived, sure.
But ${g.name}'s hopes weren't high.
> Hey!
>
> ${b.name}?
>
> You still alive in there?
>
> Hello?
>
> Aww...
> Guess not...
>
> Shame...
> He'd've made a pretty good boyfriend...
> A _cute_ one too...
>
> _Stupid metabolism_...

> w-wha-?\\
> _cough_
> _cough_
> _wheeze_
>
> ${g.name[0]}-${g.name}?
>
> Am I...
> D-Dead...?

> Oh, you're _not_ dead?
>
> __Perfect!__
>
> I can't exactly date _buttfat_~

${b.name} was clearly too weak to move, but still alive.
${g.name} was going to get him out on her own -- not like she was ever going to _struggle_ with that.
`;
		vore.notes = `
`;
	};
};
{
	const vamp = new Story(
		"Vampire",
		{
			girl: {
				name: "Melina",
				species: "Vampire"
			},
			boy: {
				name: "Teddy",
				species: "Human"
			}
		}
	);
	{
		const { girl: g, boy: b } = vamp;
		vamp.plot = `
<!--Placeholder-->
|Name|Species|
|:-|:-|
|${g.name}|${g.species}|
|${b.name}|${b.species}|
<!--Placeholder-->
`;
		vamp.notes = `
`;
	};
};
{
	const power = new Story(
		"Power",
		{
			girl: {
				name: "Lia",
				species: "Human"
			}
		}
	);
	{
		const { girl: g } = power;
		power.plot = `
- ${g.name} is the ${g.species} bard of an adventuring party
`;
		power.notes = `
- Inspired by "Project Power" (2020)
`;
	};
};
Story.instances.forEach(story => {
	story.write();
});
console.log(Story.instances.at(-1).output);