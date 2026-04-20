export type WarType = 'mamalik' | 'majd' | 'sahab' | 'legendary' | 'ramal' | 'sahara' | 'haram';

export const WAR_TYPES: Record<WarType, string> = {
  mamalik: 'مماليك',
  majd: 'مجد',
  sahab: 'سحاب',
  legendary: 'أسطوري',
  ramal: 'رمال',
  sahara: 'صحراء',
  haram: 'هرم',
};

export interface War {
  id: string;
  name: string;
  type: WarType;
  date: number;
  createdAt: number;
}
