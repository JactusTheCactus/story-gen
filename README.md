# Story Generator
Ever wanted to whip up whimsical tales with just a few lines of JavaScript? Look no further. **Story Generator** is a simple Node.js script that helps you create short story outlines with characters, plots and notes.
## Features
- Define characters with names and species
- Automatically formats your story into a Markdown file
- Generates human-readable file names based on story titles
- Outputs structured stories with sections: Characters, Plot, and Notes
- All stories are saved neatly into the `stories/` folder
## Project Structure
```
story-gen/
├── .github/workflows/    # GitHub Actions (CI setup)
├── .vscode/              # Editor settings (optional)
├── stories/              # Where your generated stories go
├── script.js             # The main story generator script
├── package.json          # Project metadata and scripts
├── package-lock.json     # Dependency lockfile
└── README.md             # This file!
```
## Getting Started
### Prerequisites
Make sure you have [Node.js](https://nodejs.org/) installed.
### Run the Generator
```bash
node script.js
```
This will generate all defined stories and save them into the `stories/` directory as Markdown files.
### Add Your Own Story
Edit `script.js` and add your own `Story` instance like this:
```js
{
	const myStory = new Story(
		"Magical Cats",
		{
			girl: {
				name: "Luna",
				species: "Cat-Witch"
			},
			boy: {
				name: "Theo",
				species: "Talking Owl"
			}
		}
	);
	{
		const { girl: g, boy: b } = myStory;
		myStory.plot = `
A feline sorceress, ${g.name}, and her feathered sidekick, ${b.name}, must reverse a cursed moonbeam.
`;
		myStory.notes = `
Inspired by my neighbor's cat and a very loud owl.
`;
	};
};
```
Then re-run the script!
## Example Output
Each story is output as a Markdown file like this:
```md
Write Me A Story
****************

"Tick Tock"
===========

Characters
----------
- Ellie
	- Human
- Marcus
	- Time Sprite

Plot
----
- Ellie discovers a pocket watch that controls time, but Marcus warns her it comes with a cost...

Notes
-----
- Time-travel theme. Possibly part of a series.
```
## Future Ideas
- Support for multiple formats
    - `JSON`
    - `YAML`
    - Etc.
## License
ISC License. Go wild—just don’t forget to give Ellie and Marcus a happy ending once in a while.
***
_Built with ✨ creativity and a touch of JavaScript._