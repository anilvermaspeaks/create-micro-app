const os = require('os');
const fs = require('fs');
const path = require('path');
const chalk = require('chalk');
const copydir = require('copy-dir');

function dirFileExists(path) {
	return fs.existsSync(path);
}

function createDir(dir) {
	try {
		fs.mkdirSync(dir);
	} catch (e) {
		console.error(chalk.red('error creating directory'));
		throw e;
	}
}

function copyDir(sourcePath, destPath, exclusions) {
	copydir.sync(
		sourcePath,
		destPath,
		{
			utimes: true,
			mode: true,
			cover: true,

			filter: function (stat, filepath) {
				const _filename = path.parse(filepath).base;

				if (stat === 'file' && exclusions.includes(_filename)) {
					return false;
				}
				return true;
			}
		},
		function (err) {
			if (err) {
				throw err;
			}
		}
	);
}

function writeFile(filePath, data) {
	fs.writeFileSync(filePath, data);
}

function writeJsonFile(jsonFilePath, json) {
	try {
		writeFile(jsonFilePath, JSON.stringify(json, null, 2) + os.EOL);
	} catch (e) {
		console.error(chalk.red(`error copying file ${jsonFilePath}`));
		throw e;
	}
}

module.exports = {
	dirFileExists,
	createDir,
	copyDir,
	writeJsonFile
};