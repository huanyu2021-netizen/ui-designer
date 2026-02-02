import { LYBaseConfigModel } from './base';
export declare class LYRetryWaitExponential extends LYBaseConfigModel {
    multiplier: number;
    min: number;
    max: number;
}
export declare class LYHttpRetryConfig extends LYBaseConfigModel {
    timeoutPerRetry: number;
    stopAfterDelay: number;
    waitExponential: LYRetryWaitExponential;
}
export declare class LYHttpConfig extends LYBaseConfigModel {
    retry: LYHttpRetryConfig;
}
