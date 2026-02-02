import { LYBaseConfig } from './base';
import { LYHttpConfig } from './http';
import { LYCryptoConfig } from './crypto';
import { LYAppConfig } from './app';
import { LYAddressConfig } from './address';
export declare class LYConfig extends LYBaseConfig {
    http: LYHttpConfig;
    crypto: LYCryptoConfig;
    apps: LYAppConfig[];
    address: LYAddressConfig;
    host_patterns: string[];
}
