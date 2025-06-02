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
		"!^", "$!"
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
				name: "Name",
				species: "Species"
			},
			boy = {
				name: "Name",
				species: "Species"
			}
		} = {},
		ifPerl = true
	) {
		this.title = title;
		this.girl = { ...girl };
		this.boy = { ...boy };
		[this.girl, this.boy].forEach(char => {
			if (char) {
				if (!char.name) {
					char.name = "Name"
				};
				if (!char.species) {
					char.species = "Species"
				};
			} else {
				char = {
					name: "Name",
					species: "Species"
				};
			};
		});
		this.ifPerl = ifPerl;
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
	title => "${this.title}",
	boy => {
		name => "${this.boy.name}",
		species => "${this.boy.species}"
	},
	girl => {
		name => "${this.girl.name}",
		species => "${this.girl.species}"
	}
};
`
			.replace(/(?:name|species) => "(?:name|species)",?\n\t+/gi, "")
			.replace(/,?\n\t+(?:boy|girl) => {\n\t+}/g, "")
			.trim();
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
`
			.replace(/- name\n\t- species/gi, "");
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
		if (this.ifPerl) {
			this.output += this.perl
		};
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
		const { girl: { name, species } } = power;
		power.plot = `
- ${name} is the ${species} bard of an adventuring party
- she always avoids fighting
	- her party assumes this is because she is scared of getting hurt
		- the _real_ reason is that ${name} is worried about collateral damage
			- à la the __Pistol Shrimp__ scene of "Project Power"
- when ${name} uses her power:
	- eyes turn gold
		- the _metal_, not the _colour_
	- a whisper shakes the earth
	- the movement of her jaw during speach causes shockwaves
	- speed almost looks like teleportation
		- each step causes a _thundercrack_
`;
		power.notes = `
- Inspired by "Project Power" (2020)
`;
	};
};
{
	const dorm = new Story(
		"Dorm Life",
		{
			girl: {
				name: "Bella",
				species: "Human"
			},
			boy: {
				name: "Roommates",
				species: "Pred"
			}
		},
		false
	);
	{
		const {
			girl: {
				name,
				species
			},
			boy: roommate
		} = dorm;
		dorm.plot = `
- ${name} moves into a __College Dorm__
	- All her ${roommate.name} are _Female_
		- And _very_ __Hot__
			- curvy in all the right ways
	- by the end of __Week 1__, ${name} has realized that __All 5 Of Her ${roommate.name} Are ${roommate.species}s__
		- ${roommate.species}s:
			- identical to ${species}s
			- eat a diet of exclusivley ${species}s
				- swallow ${species}s whole
					- no chewing
					- full digestion, to a flat / empty tummy, in 1 hour
		- there are rules against ${roommate.species}s eating their ${roommate.name}, so ${name} is _safe_
			- however, the punishment for eating ${roommate.name} is __A Light Warning__ + a _$10 Fine_
				- due to a concerning amount of ${roommate.species}s in politics, __Vore__ is not legally __Homicide__ or __Cannibalism__
			- there are __no such rules__ for the people in _other dorm rooms_
		- Plus, ${name}'s ${roommate.name} seem to _like_ her, so she doesn't think they'd eat her anyways
`;
		dorm.notes = `
`;
	};
};
{
const wakeUp = new Story(
"Wakeup Call",
{
girl: {
name: "Ashley",
species: "Pred"
},
boy: {
name: "Lola",
species: "Human"
}
},
false
);
{
const {
girl: pred,
boy: prey
} = wakeUp;
wakeUp.plot = `
- ${pred.name} is:
    - a ${pred.species}
    - Female
    - _very_ hot
    - _hungover_
- ${prey.name} is:
    - a ${prey.species}
    - Female
    - _very_ cute
- ${pred.name} wakes up next to ${prey.name}
    - ${pred.name} just considers ${prey.name} her "Breakfast In Bed"
        - ${prey.name} has to negotiate her __survival__
`;
wakeUp.notes = `
`;
};
};
Story.instances.forEach(story => {
	story.write();
});
{
	const { title, plot, girl: g, boy: b } = Story.instances.at(-1)
	const titlePadding = "-=:|";
	console.log(`\n\t\x1b[1m\x1b[35m${titlePadding}\x1b[4m"${title}"\x1b[0m\x1b[1m\x1b[35m${reverse(titlePadding)}\x1b[0m\n${plot}`
		.replace(/\t/g, " ".repeat(4))
		.replace(/__(.+?)__/g, "\x1b[31m\x1b[1m$1\x1b[0m")
		.replace(/_(.+?)_/g, "\x1b[32m\x1b[3m$1\x1b[0m")
		.replace(/"(.+?)"/g, "\x1b[36m\"$1\"\x1b[0m")
		.replace(new RegExp(`((?:${g.name}|${b.name}|${g.species}|${b.species})['s]*)`, "gi"), "\x1b[33m\x1b[4m$1\x1b[0m")
		.replace(/\s+\n/g, "\n"),
"=".repeat(50),"\n",
"Write Me A Story","\n",
"***","\n",
"#",title,
plot
	);
};