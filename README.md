# semantic-ui-typescript
> Semantic UI helper to get deal with Typescript

## How it works?

* File `/refs/docs.xlsx` is the place where we collect Semantic UI anatomy. Most of the contents are pasted from official [Semantic UI Documentation](http://semantic-ui.com/).
* `npm run build-refs` is the command to translate `/refs/docs.xlsx` contents into `JSON` file located on `/maps` folder. File names represents **Tab** names of the spreadsheet.
* `npm run build` uses everything in `/maps` to build semantic-ui Typescript definition file located on `/output/semantic-ui.d.ts`. It also validates the `/maps` against real semantic-ui component anatomies.

## Todo

### Get semantic-ui.d.ts

You can directly use [semantic-ui.d.ts](output/semantic-ui.d.ts) by clone/copy paste it on your project.

### Get involved

Fork, submit issues and make pull requests. 

## License

MIT