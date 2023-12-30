export interface userData {
  sign: string[];
  msg: number;
  exp: number;
}

export interface userInfo {
  user_id: number;
  nickname: string;
  sex: 'male' | 'female' | 'unknown';
  age: number;
}

export type Hand = '石头' | '剪刀' | '布';
