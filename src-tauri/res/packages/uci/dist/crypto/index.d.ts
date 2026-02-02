import { LYObject } from "../object";
import { LYBaseCrypto } from "./base";
import "./sm";
import "./gm";
export declare class LYCrypto extends LYObject {
    private _impl?;
    private _encryptPublicKey?;
    private _decryptPrivateKey?;
    private _signaturePrivateKey?;
    private _verifyPublicKey?;
    private _ivGetter;
    private _keyGetter;
    constructor();
    get impl(): LYBaseCrypto;
    private _createImpl;
    private _getCryptoConfig;
    private _uint8ArrayToHex;
    private _hexToUint8Array;
    private _stringToUint8Array;
    private _uint8ArrayToString;
    private _base64ToUint8Array;
    private _uint8ArrayToBase64;
    private _getIvAndKey;
    private _getKey;
    private _getEncryptPublicKey;
    private _getDecryptPrivateKey;
    private _getSignaturePrivateKey;
    private _getVerifyPublicKey;
    /**
     * 将数据流分成指定大小的块
     */
    private _makeSize;
    /**
     * 设置对称加密的IV和密钥获取函数
     */
    setSymmetricKeyGetter(ivGetter: () => Uint8Array, keyGetter: () => Uint8Array): void;
    /**
     * 设置非对称加密公钥
     */
    setEncryptPublicKey(publicKey: Uint8Array | string): void;
    /**
     * 设置非对称解密私钥
     */
    setDecryptPrivateKey(privateKey: Uint8Array | string): void;
    /**
     * 设置签名私钥
     */
    setSignaturePrivateKey(privateKey: Uint8Array | string): void;
    /**
     * 设置验证公钥
     */
    setVerifyPublicKey(publicKey: Uint8Array | string): void;
    /**
     * 对称加密 - 字节数组
     */
    encryptSymmetric(data: Uint8Array, iv?: Uint8Array | string, key?: Uint8Array | string): Uint8Array;
    /**
     * 对称加密 - 字符串
     */
    encryptSymmetric(data: string, iv?: Uint8Array | string, key?: Uint8Array | string): string;
    /**
     * 对称加密 - 流式数据
     */
    encryptSymmetric(data: AsyncIterable<Uint8Array>, iv?: Uint8Array | string, key?: Uint8Array | string): AsyncIterable<Uint8Array>;
    private _encryptSymmetricBytes;
    private _encryptSymmetricStr;
    private _encryptSymmetricStream;
    /**
     * 对称解密 - 字节数组
     */
    decryptSymmetric(data: Uint8Array, iv?: Uint8Array | string, key?: Uint8Array | string): Uint8Array;
    /**
     * 对称解密 - 字符串
     */
    decryptSymmetric(data: string, iv?: Uint8Array | string, key?: Uint8Array | string): string;
    /**
     * 对称解密 - 流式数据
     */
    decryptSymmetric(data: AsyncIterable<Uint8Array>, iv?: Uint8Array | string, key?: Uint8Array | string): AsyncIterable<Uint8Array>;
    private _decryptSymmetricBytes;
    private _decryptSymmetricStr;
    private _decryptSymmetricStream;
    /**
     * 非对称加密 - 字节数组
     */
    encryptAsymmetric(data: Uint8Array, publicKey?: Uint8Array | string): Uint8Array;
    /**
     * 非对称加密 - 字符串
     */
    encryptAsymmetric(data: string, publicKey?: Uint8Array | string): string;
    /**
     * 非对称加密 - 流式数据
     */
    encryptAsymmetric(data: AsyncIterable<Uint8Array>, publicKey?: Uint8Array | string): AsyncIterable<Uint8Array>;
    private _encryptAsymmetricBytes;
    private _encryptAsymmetricStr;
    private _encryptAsymmetricStream;
    /**
     * 非对称解密 - 字节数组
     */
    decryptAsymmetric(data: Uint8Array, privateKey?: Uint8Array | string): Uint8Array;
    /**
     * 非对称解密 - 字符串
     */
    decryptAsymmetric(data: string, privateKey?: Uint8Array | string): string;
    /**
     * 非对称解密 - 流式数据
     */
    decryptAsymmetric(data: AsyncIterable<Uint8Array>, privateKey?: Uint8Array | string): AsyncIterable<Uint8Array>;
    private _decryptAsymmetricBytes;
    private _decryptAsymmetricStr;
    private _decryptAsymmetricStream;
    /**
     * 签名 - 字节数组
     */
    signature(data: Uint8Array, privateKey?: Uint8Array | string): string;
    /**
     * 签名 - 字符串
     */
    signature(data: string, privateKey?: Uint8Array | string): string;
    private _signatureBytes;
    private _signatureStr;
    /**
     * 验证签名 - 字节数组
     */
    verify(data: Uint8Array, signature: string, publicKey?: Uint8Array | string): boolean;
    /**
     * 验证签名 - 字符串
     */
    verify(data: string, signature: string, publicKey?: Uint8Array | string): boolean;
    private _verifyBytes;
    private _verifyStr;
    /**
     * 哈希 - 字节数组
     */
    hash(data: Uint8Array, key?: Uint8Array | string, iterations?: number): Uint8Array;
    /**
     * 哈希 - 字符串
     */
    hash(data: string, key?: Uint8Array | string, iterations?: number): string;
    private _hashBytes;
    private _hashStr;
}
export declare const crypto: LYCrypto;
