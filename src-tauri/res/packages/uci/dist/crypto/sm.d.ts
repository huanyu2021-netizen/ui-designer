import { LYBaseCrypto } from "./base";
export declare class LYSMCrypto extends LYBaseCrypto {
    private _paddingIv;
    private _uint8ArrayToHex;
    private _hexToUint8Array;
    private _validateKey;
    private _validatePublicKey;
    getSymmetricBlockSize(iv: Uint8Array, key: Uint8Array): number;
    getAsymmetricBlockSize(publicKey: Uint8Array): number;
    encryptSymmetric(data: Uint8Array, iv: Uint8Array, key: Uint8Array): Uint8Array;
    decryptSymmetric(data: Uint8Array, iv: Uint8Array, key: Uint8Array): Uint8Array;
    signature(data: Uint8Array, privateKey: Uint8Array): string;
    verify(data: Uint8Array, publicKey: Uint8Array, signature: string): boolean;
    encryptAsymmetric(data: Uint8Array, publicKey: Uint8Array): Uint8Array;
    decryptAsymmetric(data: Uint8Array, privateKey: Uint8Array): Uint8Array;
    hash(data: Uint8Array, key?: Uint8Array): Uint8Array;
}
