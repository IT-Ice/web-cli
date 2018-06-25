const program = require('commander');
const download = require('download-git-repo');
const handlebars = require('handlebars');
const inquirer = require('inquirer');
const fs = require('fs');
const ora = require('ora');
const chalk = require('chalk');
const symbols = require('log-symbols');

const spinner = ora('正在初始化模板...');
const questions = [
    {
        name: 'type',
        message: '请输入项目类型'
    },
    {
        name: 'description',
        message: '请输入项目描述'
    },
    {
        name: 'author',
        message: '请输入作者名称'
    }
]
program.version('1.0.0', '-v, --version')
.command('init <name>')
.action(name => {
    if (checkProject(name)) {
        console.log(symbols.error, chalk.red(`${name}名称已存在！`));
        return false;
    }

    initProjectInfo().then(answers => {
        let githubUrl = getGitHubUrl(answers.type);
        downloadTemplate(githubUrl, name, answers);
    });

});
program.parse(process.argv);


/**
 * [checkProject 判断项目名称是否被占用]
 * @param {string} path 
 * @return {boolean} 
 */
function checkProject(path) {
    let result = true;
    if (!fs.existsSync(path)) {
        result = false;
    }
    return result;
}

/**
 * [initProjectInfo 初始化项目信息]
 * @return {object}
 */
function initProjectInfo() {
    return inquirer.prompt(questions).then(answers => {
        return answers;
    });
}

/**
 * [downloadTemplate 下载模板，更新package.json信息]
 * @param {string} githubUrl 模板路径
 * @param {string} name 项目名称
 * @param {obj} answers 项目信息
 */
function downloadTemplate(githubUrl, name, answers) {
    spinner.start();
    console.log(githubUrl);
    download(githubUrl, name, {clone: true}, (err) => {
        if (err) {
            spinner.fail();
            console.log(symbols.error, chalk.red(err));
        }
        else {
            spinner.succeed();
            const fileName = `${name}/package.json`;
            const meta = {
                name,
                description: answers.description,
                author: answers.author
            }
            if (checkProject(fileName)) {
                const content = fs.readFileSync(fileName).toString();
                const result = handlebars.compile(content)(meta);
                fs.writeFileSync(fileName, result);
            }
            console.log(symbols.success, chalk.green('项目初始化完成'));
        }
    });
}

/**
 * [getGitHubUrl 根据用户输入的类型下载模板]
 * @param {string} type 
 */
function getGitHubUrl(type) {
    return `github:IT-Ice/template.git#${type}`;
}