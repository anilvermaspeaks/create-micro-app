const path = require('path');
const chalk = require('chalk');
const inquirer = require('inquirer');
const {createNpmDependenciesArray, mergeJsons} = require('./utils/jsonHelper');
const {createAppQuestions} = require('./utils/questions');
const {
	appTemplateFileExclusions,
	lmiAppSampleData,
	appTypeMap
} = require('./utils/constants');
const {
	createDir,
	copyDir,
	writeJsonFile,
	dirFileExists
} = require('./utils/fileDirOps');
const {installPackages} = require('./utils/install');

const templatesPath = path.join(__dirname, 'templates');
const baseTemplatePath = path.join(templatesPath, 'microApp');
let appTemplatePath = '';
let projectDir = '';
const cwd = process.cwd();
const stampFileName = 'lmi-app-creator.json';

const createProjectDirectory = (appName) => {
	projectDir = path.join(cwd, appName);
	createDir(projectDir);
};

const copyBaseDirectory = () => {
	copyDir(baseTemplatePath, projectDir, appTemplateFileExclusions);
};

const copyTemplateDirectory = (appType) => {
	appTemplatePath = path.join(templatesPath, appType);
	copyDir(appTemplatePath, projectDir, appTemplateFileExclusions);
};

const creatJsonFile = async (appType, appName) => {
	const lmiAppPackageFile = require(path.join(__dirname, 'package.json'));
	const json = mergeJsons(lmiAppSampleData, {
		name: lmiAppPackageFile.name,
		version: lmiAppPackageFile.version,
		type: appType,
		appName: appName
	});
	try {
		await writeJsonFile(path.join(projectDir, stampFileName), json);
	} catch (e) {
		console.error('error creating stamp file');
	}
	console.info(`stamp file created at ${path.join(projectDir, stampFileName)}`);
	console.info(
		chalk.yellow(
			'make sure not to delete the stamp file. [stamp file is important for universal-react-v2 to keep track of the project]'
		)
	);
};



const installDependencies = async (filePath, installLocation) => {
	console.info('installing dependencies...');
	const depArr = await createNpmDependenciesArray(filePath);
	installPackages(installLocation, depArr);
};

const initializeNewProject = async (appType, appName, basePath) => {
	createProjectDirectory(appName);
	copyBaseDirectory();
	copyTemplateDirectory(appType);
	console.info(chalk.green('project created successfully'));

	const basePackage = require(path.join(baseTemplatePath, 'package.json'));
	const appPackage = require(path.join(appTemplatePath, 'package.json'));
	let packageFile = mergeJsons(basePackage, appPackage);
	packageFile = mergeJsons(packageFile, {name: appName});
	if (basePath != undefined) {
		packageFile = mergeJsons(packageFile, {
			scripts: {
				'env-var': 'cross-env BASE_PATH=' + basePath
			}
		});
	}
	writeJsonFile(path.join(projectDir, 'package.json'), packageFile);

	await creatJsonFile(appType, appName);
	installDependencies(path.join(projectDir, 'package.json'), projectDir);
};


const stampFilePath = path.join(cwd, stampFileName);
const exists = dirFileExists(stampFilePath);

if (exists) {
	const existingAppInfo = require(stampFilePath);
	console.info(
		chalk.yellow(
			`There is an existing project "${existingAppInfo.appName}" in the current directory.`
		)
	);
}
else {
	inquirer.prompt(createAppQuestions).then((answers) => {
		if (appTypeMap[answers.appType] === undefined) {
			console.error('Invalid app type.');
		} else {
			initializeNewProject(
				appTypeMap[answers.appType],
				answers.appName,
				answers.customBasePath,
				[]
			);
		}
	});
}