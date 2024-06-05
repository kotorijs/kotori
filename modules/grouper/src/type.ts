export interface UserData {
  sign: string[];
  msg: number;
  exp: number;
}

export interface UserInfo {
  user_id: number;
  nickname: string;
  sex: 'male' | 'female' | 'unknown';
  age: number;
}

export interface SignData {
  [propName: string]: string[];
}

export type Hand = '石头' | '剪刀' | '布';
