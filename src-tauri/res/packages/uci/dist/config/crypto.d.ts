import { LYBaseConfigModel } from './base';
export type LYCryptoType = 'default' | 'sm' | 'gm';
export declare class LYCryptoConfig extends LYBaseConfigModel {
    type: LYCryptoType;
}
