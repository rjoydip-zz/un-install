#!/usr/bin/env node

'use strict'

const ora = require('ora')
const chalk = require('chalk')
const inquirer = require('inquirer')
const pkgDept = require('pkg-dep')
const { spawn } = require('child_process')
const flattenObjectStrict = require('flatten-object-strict')

const logger = console

module.exports = (async () => {
	const pkgDepList = await pkgDept.get()

	await inquirer
		.prompt([
			{
				type: 'list',
				message: 'Run npm scripts via terminal',
				name: 'value',
				paginated: true,
				choices: Object.keys(pkgDepList).length ? Object.keys(flattenObjectStrict(pkgDepList)).map(key => key) : ['Quit']
			}
		])
		.then(answers => (
			async () => {
				const spinner = await ora({
					text: chalk.green(`${answers['value']} uninstalling\n`),
					spinner: {
						'interval': 80,
						'frames': [
							'⣾',
							'⣽',
							'⣻',
							'⢿',
							'⡿',
							'⣟',
							'⣯',
							'⣷'
						]
					}
				})

				if (answers['value'] === 'Quit') {
					logger.log(`${chalk.cyan('Re-run using un-install')}`)
					global.process.exit(1)
				} else {
					spinner.start()
					const child = await spawn(/^win/.test(global.process.platform) ? 'npm.cmd' : 'npm', ['uninstall', answers['value']])

					child.stdout.on('data', (data) => {
						logger.log(`${data}`)
					})

					child.stderr.on('data', (data) => {
						spinner.stop()
						logger.log(`${data}`)
					})

					child.on('close', () => {
						spinner.stop()
						logger.log(`${chalk.cyan('Re-run using un-install')}`)
						global.process.exit(1)
					})
				}
			})()
		)
})()