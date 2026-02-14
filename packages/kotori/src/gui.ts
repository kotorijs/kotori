import { input, select } from '@inquirer/prompts'
import { Colors, executeCommand, Http, TerminalAdapter } from '@kotori-bot/core'

interface Module {
  name: string
  version: string
  description: string
}

const c = new Colors(new TerminalAdapter())
const req = new Http()

req.response(undefined, (err) => console.error(c.dye('Get modules data occurred error:', 'red'), err))

async function getOnlineModules(): Promise<Module[]> {
  // biome-ignore lint: *
  const { list } = (await req.get('https://kotori.js.org/assets/data_details.json')) as any
  return list
}

// async function getLocalModules(rootDir: string, filename: string) {
//   return fs.readdirSync(path.resolve(process.cwd(), 'node_modules')).filter(filename => {
//     const dir = path.join(rootDir, filename)
//     if (!fs.existsSync(dir) || !fs.statSync(dir).isDirectory()) return false
//     const dirArr = path.parse(dir).dir.split('/')
//     if (dirArr[dirArr.length - 1].endsWith('node_modules') && !filename.startsWith(PLUGIN_PREFIX)) return
//   })
// }

export async function mainScope(): Promise<void> {
  console.log(c.dye('Welcome to Kotori Bot GUI!', 'magenta'))
  const action = await select({
    message: 'What do you want to do?',
    choices: [
      { name: 'Install Module', value: 'installModule' },
      { name: 'Install Adapter', value: 'installAdapter' },
      { name: 'Uninstall Module', value: 'uninstallModule' },
      { name: 'Update Module', value: 'updateModule' },
      { name: 'Create Module', value: 'createModule' },
      { name: 'Open Official Website', value: 'openWebsite' }
    ]
  })

  switch (action) {
    case 'installModule':
      await installModuleScope()
      break
    case 'installAdapter':
      await installAdapterScope()
      break
    case 'uninstallModule':
      await uninstallModuleScope()
      break
    case 'updateModule':
      await updateModuleScope()
      break
    case 'createModule':
      console.log(
        `Please refer to ${c.dye('https://github.com/kotorijs/create-kotori', 'cyan')} about creating and developing a new module.`
      )
      break
    default:
      console.log('Kotori Bot Official Website:', c.dye('https://kotori.js.org', 'cyan'))
      executeCommand(
        `${process.platform === 'darwin' ? 'open' : process.platform === 'win32' ? 'start' : 'xdg-open'} https://kotori.js.org`
      )
  }
}

async function installModuleScope(): Promise<void> {
  const moduleName = await input({
    message: 'Please input the module name you want to install:'
  })

  const modules = (await getOnlineModules()).filter(({ name }) => name.includes(moduleName))

  if (modules.length === 0) {
    console.log('No module found.')
    return
  }

  const selectedModule = await select({
    message: `There are ${modules.length} modules found, please select one to install:`,
    choices: modules.map((m) => ({ value: m.name, name: `${m.name} v${m.version} - ${m.description}` }))
  })
  console.log(c.dye(`Installing ${selectedModule} module...`, 'yellow'))
  executeCommand(`npm install ${selectedModule}`)
}

async function installAdapterScope(): Promise<void> {
  const adapterName = await select({
    message: 'Please select the adapter you want to install:',
    choices: [
      { name: '⚙️ Command line adapter', value: '@kotori-bot/kotori-plugin-adapter-cmd' },
      { name: '🧩 Onebot QQ adapter', value: '@kotori-bot/kotori-plugin-adapter-onebot' },
      { name: '🐧 Official QQ adapter', value: '@kotori-bot/kotori-plugin-adapter-qq' },
      { name: '✈  Telegram adapter', value: '@kotori-bot/adapter-telegram' },
      { name: '🎮 Discord adapter', value: '@kotori-bot/adapter-discord' },
      { name: '🟩 Slack adapter', value: '@kotori-bot/adapter-slack' },
      { name: '📭 Email adapter', value: '@kotori-bot/adapter-mail' },
      { name: '🎍 Minecraft bedrock adapter', value: '@kotori-bot/kotori-plugin-adapter-minecraft' },
      { name: '🧰 Sandbox adapter', value: '@kotori-bot/kotori-plugin-adapter-sandbox' },
      { name: '🕳️ Nothing, and more...', value: 'more' }
    ]
  })
  if (adapterName === 'more') {
    await installModuleScope()
    return
  }
  console.log(c.dye(`Installing ${adapterName} adapter...`, 'yellow'))
  executeCommand(`npm install ${adapterName}`)
}

async function uninstallModuleScope(): Promise<void> {
  const moduleName = await input({
    message: 'Please input the module name you want to uninstall:'
  })
  console.log(c.dye(`Uninstalling ${moduleName} module...`, 'yellow'))
  executeCommand(`npm uninstall ${moduleName}`)
}

async function updateModuleScope(): Promise<void> {
  const moduleName = await input({
    message: 'Please input the module name you want to update:'
  })
  console.log(c.dye(`Updating ${moduleName} module...`, 'yellow'))
  executeCommand(`npm update ${moduleName}`)
}
