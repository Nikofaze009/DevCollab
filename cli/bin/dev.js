#!/usr/bin/env node

const { Command } = require('commander');
const authCmd = require('../commands/auth');
const repoCmd = require('../commands/repo');

const program = new Command();

program
  .name('dev')
  .description('Custom CLI for the DevCollab Platform')
  .version('1.0.0');

// Register Login Command
program
  .command('login')
  .description('Log into your DevCollab account')
  .requiredOption('-e, --email <email>', 'Your email address')
  .requiredOption('-p, --password <password>', 'Your password')
  .action((options) => {
    authCmd.login(options.email, options.password);
  });

// Repo commands
const repo = program.command('repo').description('Manage repositories');

repo
  .command('create')
  .description('Create a new repository')
  .argument('<name>', 'Name of the repository')
  .option('-d, --desc <description>', 'Repository description')
  .action((name, options) => {
    repoCmd.createRepo(name, options.desc);
  });

repo
  .command('list')
  .description('List your repositories')
  .action(() => {
    repoCmd.listRepos();
  });

const initCmd = require('../commands/init');
const pushCmd = require('../commands/push');

program
  .command('init')
  .description('Initialize local repository linking')
  .argument('<repoId>', 'The ID of the repository')
  .action((repoId) => {
    initCmd.initRepo(repoId);
  });

program
  .command('push')
  .description('Push code to DevCollab')
  .requiredOption('-m, --message <message>', 'Commit message')
  .action((options) => {
    pushCmd.pushRepo(options.message);
  });

program.parse(process.argv);
