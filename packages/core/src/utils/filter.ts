import { FilterOption, FilterOptionBase, FilterTestList, SessionData } from '../types'

class Filter {
  private static getTestDomain(session: SessionData, test: FilterTestList) {
    switch (test) {
      case FilterTestList.LOCALE_TYPE:
        return session.i18n.get()
      case FilterTestList.IDENTITY:
        return session.api.adapter.identity
      case FilterTestList.PLATFORM:
        return session.api.adapter.platform
      case FilterTestList.USER_ID:
        return session.userId
      case FilterTestList.GROUP_ID:
        return session.groupId
      case FilterTestList.OPERATOR_ID:
        return session.operatorId
      case FilterTestList.MESSAGE_ID:
        return session.messageId
      case FilterTestList.MESSAGE_SCOPE:
        return session.messageId
      case FilterTestList.SLEF_ID:
    }
  }
  private static handleFilter(session: SessionData, { test, oprator, value }: FilterOptionBase) {
    const domain = Filter.getTestDomain(session, test)
    if (['>', '<'].includes(oprator)) {
      if (typeof value !== 'number' || typeof domain !== 'number') return false
      switch (oprator) {
        case '>':
          return domain > value
        case '<':
          return domain < value
      }
    }

    if (['>=', '<=', '=='].includes(oprator)) {
      if (typeof value !== 'number' || typeof domain !== 'number')
        return typeof value === 'boolean' ? !!domain === value : String(domain) === String(value)
      switch (oprator) {
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

  public readonly option: FilterOption

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
