export enum FilterTestList {
  PLATFORM = 'platform',
  USER_ID = 'userId',
  GROUP_ID = 'groupId',
  OPERATOR_ID = 'operatorId',
  MESSAGE_ID = 'messageId',
  SCOPE = 'scope',
  ACCESS = 'access',
  IDENTITY = 'identity',
  LOCALE_TYPE = 'localeType',
  SELF_ID = 'selfId'
}

export type FilterOption = FilterOptionBase | FilterOptionGroup

/** Single filter option  */
export interface FilterOptionBase {
  /* Tested item */
  test: FilterTestList
  /* Tested operator */
  operator: '==' | '!=' | '>' | '<' | '>=' | '<='
  /* Expected value */
  value: string | number | boolean
}

/** Group filters option */
export interface FilterOptionGroup {
  /** Match type, filters of all passed, filter of any one passed, filters of none passed  */
  type: 'all_of' | 'any_of' | 'none_of'
  /** Filters list */
  filters: FilterOption[]
}
