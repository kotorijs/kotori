import { type FilterOption, type FilterOptionBase, FilterTestList, type SessionData, CommandAccess } from '../types'

class Filter {
  private static getTestDomain(session: SessionData, test: FilterTestList) {
    switch (test) {
      case FilterTestList.LOCALE_TYPE:
        return session.i18n.get()
      case FilterTestList.IDENTITY:
        return session.api.adapter.identity
      case FilterTestList.PLATFORM:
        return session.api.adapter.platform
      case FilterTestList.SELF_ID:
        return session.api.adapter.selfId
      case FilterTestList.USER_ID:
        return session.userId
      case FilterTestList.GROUP_ID:
        return session.groupId ?? -1
      case FilterTestList.OPERATOR_ID:
        return session.operatorId ?? -1
      case FilterTestList.MESSAGE_ID:
        return session.messageId
      case FilterTestList.SCOPE:
        return session.type
      case FilterTestList.ACCESS:
        if (String(session.api.adapter.config.master) === String(session.userId)) return CommandAccess.ADMIN
        if ('role' in session.sender && ['owner', 'admin'].includes(session.sender.role)) return CommandAccess.MANGER
        return CommandAccess.MEMBER
      default:
        return -1
    }
  }

  private static handleFilter(session: SessionData, { test, operator, value }: FilterOptionBase) {
    const domain = Filter.getTestDomain(session, test)
    if (domain === -1) return false
    if (['>', '<'].includes(operator)) {
      if (typeof value !== 'number' || typeof domain !== 'number') return false
      switch (operator) {
        case '>':
          return domain > value
        case '<':
          return domain < value
      }
    }

    if (['>=', '<=', '=='].includes(operator)) {
      if (typeof value !== 'number' || typeof domain !== 'number') {
        return typeof value === 'boolean' ? !!domain === value : String(domain) === String(value)
      }
      switch (operator) {
        case '>=':
          return domain >= value
        case '<=':
          return domain <= value
        case '==':
          return domain === value
      }
    }

    return typeof value === 'boolean' ? !!domain !== value : String(domain) !== String(value)
  }

  private readonly option: FilterOption

  public constructor(option: FilterOption) {
    this.option = option
  }

  public test(session: SessionData) {
    if (!('type' in this.option)) return Filter.handleFilter(session, this.option)

    const { type, filters } = this.option
    for (const filter of filters) {
      const result = new Filter(filter).test(session)
      switch (type) {
        case 'all_of':
          if (!result) return false
          break
        case 'any_of':
          if (result) return true
          break
        case 'none_of':
          if (result) return false
          break
      }
    }
    return type !== 'any_of'
  }
}

export default Filter
