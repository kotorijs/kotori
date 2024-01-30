import { ArrayValue, ObjectValue, none } from '@kotori-bot/tools';
import Message from './message';
import Command from './command';

export class Internal extends Message {
  private getModules() {
    return this.moduleStack;
  }

  private setModules(key: number, value: ArrayValue<typeof this.moduleStack>) {
    this.moduleStack[key] = value;
  }

  private getServices() {
    return this.serviceStack;
  }

  private setServices(key: string, value: ObjectValue<typeof this.serviceStack>) {
    this.serviceStack[key] = value;
  }

  private getBots() {
    return this.botStack;
  }

  private setBots(key: string, value: ObjectValue<typeof this.botStack>) {
    this.botStack[key] = value;
  }

  private getCommands() {
    return this.commandStack;
  }

  private setCommands(key: number, value: ArrayValue<typeof this.commandStack>) {
    this.commandStack[key] = value;
  }

  private getCommandData() {
    none(this);
    return Command.dataList;
  }

  private setCommandData(key: number, value: ArrayValue<typeof Command.dataList>) {
    none(this);
    Command.dataList[key] = value;
  }

  private getMidwares() {
    return this.midwareStack;
  }

  private setMidwares(key: number, value: ArrayValue<typeof this.midwareStack>) {
    this.midwareStack[key] = value;
  }

  private getRegexps() {
    return this.regexpStack;
  }

  private setRegexps(key: number, value: ArrayValue<typeof this.regexpStack>) {
    this.regexpStack[key] = value;
  }

  get internal() {
    const getModules: typeof this.getModules = () => this.getModules();
    const setModules: typeof this.setModules = (key, value) => this.setModules(key, value);
    const getServices: typeof this.getServices = () => this.getServices();
    const setServices: typeof this.setServices = (key, value) => this.setServices(key, value);
    const getBots: typeof this.getBots = () => this.getBots();
    const setBots: typeof this.setBots = (key, value) => this.setBots(key, value);
    const getCommands: typeof this.getCommands = () => this.getCommands();
    const setCommands: typeof this.setCommands = (key, value) => this.setCommands(key, value);
    const getCommandData: typeof this.getCommandData = () => this.getCommandData();
    const setCommandData: typeof this.setCommandData = (key, value) => this.setCommandData(key, value);
    const getMidwares: typeof this.getMidwares = () => this.getMidwares();
    const setMidwares: typeof this.setMidwares = (key, value) => this.setMidwares(key, value);
    const getRegexps: typeof this.getRegexps = () => this.getRegexps();
    const setRegexps: typeof this.setRegexps = (key, value) => this.setRegexps(key, value);
    return {
      getModules,
      setModules,
      getServices,
      setServices,
      getBots,
      setBots,
      getCommands,
      setCommands,
      getCommandData,
      setCommandData,
      getMidwares,
      setMidwares,
      getRegexps,
      setRegexps
    };
  }
}

export default Internal;
