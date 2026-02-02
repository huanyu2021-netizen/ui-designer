import { LYCryptoType } from "../config/crypto";
export declare abstract class LYBaseCrypto {
    abstract getSymmetricBlockSize(iv: Uint8Array, key: Uint8Array): number;
    abstract getAsymmetricBlockSize(publicKey: Uint8Array): number;
    abstract encryptSymmetric(data: Uint8Array, iv: Uint8Array, key: Uint8Array): Uint8Array;
    abstract decryptSymmetric(data: Uint8Array, iv: Uint8Array, key: Uint8Array): Uint8Array;
    abstract signature(data: Uint8Array, privateKey: Uint8Array): string;
    abstract verify(data: Uint8Array, publicKey: Uint8Array, signature: string): boolean;
    abstract encryptAsymmetric(data: Uint8Array, publicKey: Uint8Array): Uint8Array;
    abstract decryptAsymmetric(data: Uint8Array, privateKey: Uint8Array): Uint8Array;
    abstract hash(data: Uint8Array, key?: Uint8Array): Uint8Array;
}
export declare function registerCryptoImpl(name: LYCryptoType): <T extends new () => LYBaseCrypto>(impl: T) => T;
export declare const cryptoImpl: Record<LYCryptoType, new () => LYBaseCrypto | undefined>;
