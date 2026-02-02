import { openDB } from "idb";
import events, { EventEmitter } from "events";
import axios from "axios";
import { cloneDeep } from "lodash";
import i18next from "i18next";
import { sm2, sm3, sm4 } from "sm-crypto";
import qs from "qs";
import downloadjs from "downloadjs";
var __webpack_modules__ = {
    "../../node_modules/.pnpm/@module-federation+error-codes@0.8.12/node_modules/@module-federation/error-codes/dist/index.cjs.js": function(__unused_webpack_module, exports) {
        const RUNTIME_001 = 'RUNTIME-001';
        const RUNTIME_002 = 'RUNTIME-002';
        const RUNTIME_003 = 'RUNTIME-003';
        const RUNTIME_004 = 'RUNTIME-004';
        const RUNTIME_005 = 'RUNTIME-005';
        const RUNTIME_006 = 'RUNTIME-006';
        const RUNTIME_007 = 'RUNTIME-007';
        const RUNTIME_008 = 'RUNTIME-008';
        const TYPE_001 = 'TYPE-001';
        const BUILD_001 = 'BUILD-001';
        const getDocsUrl = (errorCode)=>{
            const type = errorCode.split('-')[0].toLowerCase();
            return `https://module-federation.io/guide/troubleshooting/${type}/${errorCode}`;
        };
        const getShortErrorMsg = (errorCode, errorDescMap, args, originalErrorMsg)=>{
            const msg = [
                `${[
                    errorDescMap[errorCode]
                ]} #${errorCode}`
            ];
            args && msg.push(`args: ${JSON.stringify(args)}`);
            msg.push(getDocsUrl(errorCode));
            originalErrorMsg && msg.push(`Original Error Message:\n ${originalErrorMsg}`);
            return msg.join('\n');
        };
        function _extends() {
            _extends = Object.assign || function(target) {
                for(var i = 1; i < arguments.length; i++){
                    var source = arguments[i];
                    for(var key in source)if (Object.prototype.hasOwnProperty.call(source, key)) target[key] = source[key];
                }
                return target;
            };
            return _extends.apply(this, arguments);
        }
        const runtimeDescMap = {
            [RUNTIME_001]: 'Failed to get remoteEntry exports.',
            [RUNTIME_002]: 'The remote entry interface does not contain "init"',
            [RUNTIME_003]: 'Failed to get manifest.',
            [RUNTIME_004]: 'Failed to locate remote.',
            [RUNTIME_005]: 'Invalid loadShareSync function call from bundler runtime',
            [RUNTIME_006]: 'Invalid loadShareSync function call from runtime',
            [RUNTIME_007]: 'Failed to get remote snapshot.',
            [RUNTIME_008]: "Failed to load script resources."
        };
        const typeDescMap = {
            [TYPE_001]: 'Failed to generate type declaration.'
        };
        const buildDescMap = {
            [BUILD_001]: 'Failed to find expose module.'
        };
        const errorDescMap = _extends({}, runtimeDescMap, typeDescMap, buildDescMap);
        exports.BUILD_001 = BUILD_001;
        exports.RUNTIME_001 = RUNTIME_001;
        exports.RUNTIME_002 = RUNTIME_002;
        exports.RUNTIME_003 = RUNTIME_003;
        exports.RUNTIME_004 = RUNTIME_004;
        exports.RUNTIME_005 = RUNTIME_005;
        exports.RUNTIME_006 = RUNTIME_006;
        exports.RUNTIME_007 = RUNTIME_007;
        exports.RUNTIME_008 = RUNTIME_008;
        exports.TYPE_001 = TYPE_001;
        exports.buildDescMap = buildDescMap;
        exports.errorDescMap = errorDescMap;
        exports.getShortErrorMsg = getShortErrorMsg;
        exports.runtimeDescMap = runtimeDescMap;
        exports.typeDescMap = typeDescMap;
    },
    "../../node_modules/.pnpm/@module-federation+runtime-core@0.6.20/node_modules/@module-federation/runtime-core/dist/index.cjs.js": function(__unused_webpack_module, exports, __webpack_require__) {
        var polyfills = __webpack_require__("../../node_modules/.pnpm/@module-federation+runtime-core@0.6.20/node_modules/@module-federation/runtime-core/dist/polyfills.cjs.js");
        var sdk = __webpack_require__("../../node_modules/.pnpm/@module-federation+sdk@0.8.12/node_modules/@module-federation/sdk/dist/index.cjs.js");
        var errorCodes = __webpack_require__("../../node_modules/.pnpm/@module-federation+error-codes@0.8.12/node_modules/@module-federation/error-codes/dist/index.cjs.js");
        const LOG_CATEGORY = '[ Federation Runtime ]';
        const logger = sdk.createLogger(LOG_CATEGORY);
        function assert(condition, msg) {
            if (!condition) error(msg);
        }
        function error(msg) {
            if (msg instanceof Error) {
                msg.message = `${LOG_CATEGORY}: ${msg.message}`;
                throw msg;
            }
            throw new Error(`${LOG_CATEGORY}: ${msg}`);
        }
        function warn(msg) {
            if (msg instanceof Error) {
                msg.message = `${LOG_CATEGORY}: ${msg.message}`;
                logger.warn(msg);
            } else logger.warn(msg);
        }
        function addUniqueItem(arr, item) {
            if (-1 === arr.findIndex((name1)=>name1 === item)) arr.push(item);
            return arr;
        }
        function getFMId(remoteInfo) {
            if ('version' in remoteInfo && remoteInfo.version) return `${remoteInfo.name}:${remoteInfo.version}`;
            if ('entry' in remoteInfo && remoteInfo.entry) return `${remoteInfo.name}:${remoteInfo.entry}`;
            return `${remoteInfo.name}`;
        }
        function isRemoteInfoWithEntry(remote) {
            return void 0 !== remote.entry;
        }
        function isPureRemoteEntry(remote) {
            return !remote.entry.includes('.json') && remote.entry.includes('.js');
        }
        async function safeWrapper(callback, disableWarn) {
            try {
                const res = await callback();
                return res;
            } catch (e) {
                disableWarn || warn(e);
                return;
            }
        }
        function isObject(val) {
            return val && 'object' == typeof val;
        }
        const objectToString = Object.prototype.toString;
        function isPlainObject(val) {
            return '[object Object]' === objectToString.call(val);
        }
        function isStaticResourcesEqual(url1, url2) {
            const REG_EXP = /^(https?:)?\/\//i;
            const relativeUrl1 = url1.replace(REG_EXP, '').replace(/\/$/, '');
            const relativeUrl2 = url2.replace(REG_EXP, '').replace(/\/$/, '');
            return relativeUrl1 === relativeUrl2;
        }
        function arrayOptions(options) {
            return Array.isArray(options) ? options : [
                options
            ];
        }
        function getRemoteEntryInfoFromSnapshot(snapshot) {
            const defaultRemoteEntryInfo = {
                url: '',
                type: 'global',
                globalName: ''
            };
            if (sdk.isBrowserEnv()) return 'remoteEntry' in snapshot ? {
                url: snapshot.remoteEntry,
                type: snapshot.remoteEntryType,
                globalName: snapshot.globalName
            } : defaultRemoteEntryInfo;
            if ('ssrRemoteEntry' in snapshot) return {
                url: snapshot.ssrRemoteEntry || defaultRemoteEntryInfo.url,
                type: snapshot.ssrRemoteEntryType || defaultRemoteEntryInfo.type,
                globalName: snapshot.globalName
            };
            return defaultRemoteEntryInfo;
        }
        const processModuleAlias = (name1, subPath)=>{
            let moduleName;
            moduleName = name1.endsWith('/') ? name1.slice(0, -1) : name1;
            if (subPath.startsWith('.')) subPath = subPath.slice(1);
            moduleName += subPath;
            return moduleName;
        };
        const CurrentGlobal = 'object' == typeof globalThis ? globalThis : window;
        const nativeGlobal = (()=>{
            try {
                return document.defaultView;
            } catch (e) {
                return CurrentGlobal;
            }
        })();
        const Global = nativeGlobal;
        function definePropertyGlobalVal(target, key, val) {
            Object.defineProperty(target, key, {
                value: val,
                configurable: false,
                writable: true
            });
        }
        function includeOwnProperty(target, key) {
            return Object.hasOwnProperty.call(target, key);
        }
        if (!includeOwnProperty(CurrentGlobal, '__GLOBAL_LOADING_REMOTE_ENTRY__')) definePropertyGlobalVal(CurrentGlobal, '__GLOBAL_LOADING_REMOTE_ENTRY__', {});
        const globalLoading = CurrentGlobal.__GLOBAL_LOADING_REMOTE_ENTRY__;
        function setGlobalDefaultVal(target) {
            var _target___FEDERATION__, _target___FEDERATION__1, _target___FEDERATION__2, _target___FEDERATION__3, _target___FEDERATION__4, _target___FEDERATION__5;
            if (includeOwnProperty(target, '__VMOK__') && !includeOwnProperty(target, '__FEDERATION__')) definePropertyGlobalVal(target, '__FEDERATION__', target.__VMOK__);
            if (!includeOwnProperty(target, '__FEDERATION__')) {
                definePropertyGlobalVal(target, '__FEDERATION__', {
                    __GLOBAL_PLUGIN__: [],
                    __INSTANCES__: [],
                    moduleInfo: {},
                    __SHARE__: {},
                    __MANIFEST_LOADING__: {},
                    __PRELOADED_MAP__: new Map()
                });
                definePropertyGlobalVal(target, '__VMOK__', target.__FEDERATION__);
            }
            var ___GLOBAL_PLUGIN__;
            null != (___GLOBAL_PLUGIN__ = (_target___FEDERATION__ = target.__FEDERATION__).__GLOBAL_PLUGIN__) || (_target___FEDERATION__.__GLOBAL_PLUGIN__ = []);
            var ___INSTANCES__;
            null != (___INSTANCES__ = (_target___FEDERATION__1 = target.__FEDERATION__).__INSTANCES__) || (_target___FEDERATION__1.__INSTANCES__ = []);
            var _moduleInfo;
            null != (_moduleInfo = (_target___FEDERATION__2 = target.__FEDERATION__).moduleInfo) || (_target___FEDERATION__2.moduleInfo = {});
            var ___SHARE__;
            null != (___SHARE__ = (_target___FEDERATION__3 = target.__FEDERATION__).__SHARE__) || (_target___FEDERATION__3.__SHARE__ = {});
            var ___MANIFEST_LOADING__;
            null != (___MANIFEST_LOADING__ = (_target___FEDERATION__4 = target.__FEDERATION__).__MANIFEST_LOADING__) || (_target___FEDERATION__4.__MANIFEST_LOADING__ = {});
            var ___PRELOADED_MAP__;
            null != (___PRELOADED_MAP__ = (_target___FEDERATION__5 = target.__FEDERATION__).__PRELOADED_MAP__) || (_target___FEDERATION__5.__PRELOADED_MAP__ = new Map());
        }
        setGlobalDefaultVal(CurrentGlobal);
        setGlobalDefaultVal(nativeGlobal);
        function resetFederationGlobalInfo() {
            CurrentGlobal.__FEDERATION__.__GLOBAL_PLUGIN__ = [];
            CurrentGlobal.__FEDERATION__.__INSTANCES__ = [];
            CurrentGlobal.__FEDERATION__.moduleInfo = {};
            CurrentGlobal.__FEDERATION__.__SHARE__ = {};
            CurrentGlobal.__FEDERATION__.__MANIFEST_LOADING__ = {};
            Object.keys(globalLoading).forEach((key)=>{
                delete globalLoading[key];
            });
        }
        function setGlobalFederationInstance(FederationInstance) {
            CurrentGlobal.__FEDERATION__.__INSTANCES__.push(FederationInstance);
        }
        function getGlobalFederationConstructor() {
            return CurrentGlobal.__FEDERATION__.__DEBUG_CONSTRUCTOR__;
        }
        function setGlobalFederationConstructor(FederationConstructor, isDebug = sdk.isDebugMode()) {
            if (isDebug) {
                CurrentGlobal.__FEDERATION__.__DEBUG_CONSTRUCTOR__ = FederationConstructor;
                CurrentGlobal.__FEDERATION__.__DEBUG_CONSTRUCTOR_VERSION__ = "0.6.20";
            }
        }
        function getInfoWithoutType(target, key) {
            if ('string' == typeof key) {
                const keyRes = target[key];
                if (keyRes) return {
                    value: target[key],
                    key: key
                };
                {
                    const targetKeys = Object.keys(target);
                    for (const targetKey of targetKeys){
                        const [targetTypeOrName, _] = targetKey.split(':');
                        const nKey = `${targetTypeOrName}:${key}`;
                        const typeWithKeyRes = target[nKey];
                        if (typeWithKeyRes) return {
                            value: typeWithKeyRes,
                            key: nKey
                        };
                    }
                    return {
                        value: void 0,
                        key: key
                    };
                }
            }
            throw new Error('key must be string');
        }
        const getGlobalSnapshot = ()=>nativeGlobal.__FEDERATION__.moduleInfo;
        const getTargetSnapshotInfoByModuleInfo = (moduleInfo, snapshot)=>{
            const moduleKey = getFMId(moduleInfo);
            const getModuleInfo = getInfoWithoutType(snapshot, moduleKey).value;
            if (getModuleInfo && !getModuleInfo.version && 'version' in moduleInfo && moduleInfo['version']) getModuleInfo.version = moduleInfo['version'];
            if (getModuleInfo) return getModuleInfo;
            if ('version' in moduleInfo && moduleInfo['version']) {
                const { version } = moduleInfo, resModuleInfo = polyfills._object_without_properties_loose(moduleInfo, [
                    "version"
                ]);
                const moduleKeyWithoutVersion = getFMId(resModuleInfo);
                const getModuleInfoWithoutVersion = getInfoWithoutType(nativeGlobal.__FEDERATION__.moduleInfo, moduleKeyWithoutVersion).value;
                if ((null == getModuleInfoWithoutVersion ? void 0 : getModuleInfoWithoutVersion.version) === version) return getModuleInfoWithoutVersion;
            }
        };
        const getGlobalSnapshotInfoByModuleInfo = (moduleInfo)=>getTargetSnapshotInfoByModuleInfo(moduleInfo, nativeGlobal.__FEDERATION__.moduleInfo);
        const setGlobalSnapshotInfoByModuleInfo = (remoteInfo, moduleDetailInfo)=>{
            const moduleKey = getFMId(remoteInfo);
            nativeGlobal.__FEDERATION__.moduleInfo[moduleKey] = moduleDetailInfo;
            return nativeGlobal.__FEDERATION__.moduleInfo;
        };
        const addGlobalSnapshot = (moduleInfos)=>{
            nativeGlobal.__FEDERATION__.moduleInfo = polyfills._extends({}, nativeGlobal.__FEDERATION__.moduleInfo, moduleInfos);
            return ()=>{
                const keys = Object.keys(moduleInfos);
                for (const key of keys)delete nativeGlobal.__FEDERATION__.moduleInfo[key];
            };
        };
        const getRemoteEntryExports = (name1, globalName)=>{
            const remoteEntryKey = globalName || `__FEDERATION_${name1}:custom__`;
            const entryExports = CurrentGlobal[remoteEntryKey];
            return {
                remoteEntryKey,
                entryExports
            };
        };
        const registerGlobalPlugins = (plugins)=>{
            const { __GLOBAL_PLUGIN__ } = nativeGlobal.__FEDERATION__;
            plugins.forEach((plugin)=>{
                if (-1 === __GLOBAL_PLUGIN__.findIndex((p)=>p.name === plugin.name)) __GLOBAL_PLUGIN__.push(plugin);
                else warn(`The plugin ${plugin.name} has been registered.`);
            });
        };
        const getGlobalHostPlugins = ()=>nativeGlobal.__FEDERATION__.__GLOBAL_PLUGIN__;
        const getPreloaded = (id)=>CurrentGlobal.__FEDERATION__.__PRELOADED_MAP__.get(id);
        const setPreloaded = (id)=>CurrentGlobal.__FEDERATION__.__PRELOADED_MAP__.set(id, true);
        const DEFAULT_SCOPE = 'default';
        const DEFAULT_REMOTE_TYPE = 'global';
        const buildIdentifier = '[0-9A-Za-z-]+';
        const build = `(?:\\+(${buildIdentifier}(?:\\.${buildIdentifier})*))`;
        const numericIdentifier = '0|[1-9]\\d*';
        const numericIdentifierLoose = '[0-9]+';
        const nonNumericIdentifier = '\\d*[a-zA-Z-][a-zA-Z0-9-]*';
        const preReleaseIdentifierLoose = `(?:${numericIdentifierLoose}|${nonNumericIdentifier})`;
        const preReleaseLoose = `(?:-?(${preReleaseIdentifierLoose}(?:\\.${preReleaseIdentifierLoose})*))`;
        const preReleaseIdentifier = `(?:${numericIdentifier}|${nonNumericIdentifier})`;
        const preRelease = `(?:-(${preReleaseIdentifier}(?:\\.${preReleaseIdentifier})*))`;
        const xRangeIdentifier = `${numericIdentifier}|x|X|\\*`;
        const xRangePlain = `[v=\\s]*(${xRangeIdentifier})(?:\\.(${xRangeIdentifier})(?:\\.(${xRangeIdentifier})(?:${preRelease})?${build}?)?)?`;
        const hyphenRange = `^\\s*(${xRangePlain})\\s+-\\s+(${xRangePlain})\\s*$`;
        const mainVersionLoose = `(${numericIdentifierLoose})\\.(${numericIdentifierLoose})\\.(${numericIdentifierLoose})`;
        const loosePlain = `[v=\\s]*${mainVersionLoose}${preReleaseLoose}?${build}?`;
        const gtlt = '((?:<|>)?=?)';
        const comparatorTrim = `(\\s*)${gtlt}\\s*(${loosePlain}|${xRangePlain})`;
        const loneTilde = '(?:~>?)';
        const tildeTrim = `(\\s*)${loneTilde}\\s+`;
        const loneCaret = '(?:\\^)';
        const caretTrim = `(\\s*)${loneCaret}\\s+`;
        const star = '(<|>)?=?\\s*\\*';
        const caret = `^${loneCaret}${xRangePlain}$`;
        const mainVersion = `(${numericIdentifier})\\.(${numericIdentifier})\\.(${numericIdentifier})`;
        const fullPlain = `v?${mainVersion}${preRelease}?${build}?`;
        const tilde = `^${loneTilde}${xRangePlain}$`;
        const xRange = `^${gtlt}\\s*${xRangePlain}$`;
        const comparator = `^${gtlt}\\s*(${fullPlain})$|^$`;
        const gte0 = '^\\s*>=\\s*0.0.0\\s*$';
        function parseRegex(source) {
            return new RegExp(source);
        }
        function isXVersion(version) {
            return !version || 'x' === version.toLowerCase() || '*' === version;
        }
        function pipe(...fns) {
            return (x)=>fns.reduce((v, f)=>f(v), x);
        }
        function extractComparator(comparatorString) {
            return comparatorString.match(parseRegex(comparator));
        }
        function combineVersion(major, minor, patch, preRelease) {
            const mainVersion = `${major}.${minor}.${patch}`;
            if (preRelease) return `${mainVersion}-${preRelease}`;
            return mainVersion;
        }
        function parseHyphen(range) {
            return range.replace(parseRegex(hyphenRange), (_range, from, fromMajor, fromMinor, fromPatch, _fromPreRelease, _fromBuild, to, toMajor, toMinor, toPatch, toPreRelease)=>{
                from = isXVersion(fromMajor) ? '' : isXVersion(fromMinor) ? `>=${fromMajor}.0.0` : isXVersion(fromPatch) ? `>=${fromMajor}.${fromMinor}.0` : `>=${from}`;
                to = isXVersion(toMajor) ? '' : isXVersion(toMinor) ? `<${Number(toMajor) + 1}.0.0-0` : isXVersion(toPatch) ? `<${toMajor}.${Number(toMinor) + 1}.0-0` : toPreRelease ? `<=${toMajor}.${toMinor}.${toPatch}-${toPreRelease}` : `<=${to}`;
                return `${from} ${to}`.trim();
            });
        }
        function parseComparatorTrim(range) {
            return range.replace(parseRegex(comparatorTrim), '$1$2$3');
        }
        function parseTildeTrim(range) {
            return range.replace(parseRegex(tildeTrim), '$1~');
        }
        function parseCaretTrim(range) {
            return range.replace(parseRegex(caretTrim), '$1^');
        }
        function parseCarets(range) {
            return range.trim().split(/\s+/).map((rangeVersion)=>rangeVersion.replace(parseRegex(caret), (_, major, minor, patch, preRelease)=>{
                    if (isXVersion(major)) return '';
                    if (isXVersion(minor)) return `>=${major}.0.0 <${Number(major) + 1}.0.0-0`;
                    if (isXVersion(patch)) if ('0' === major) return `>=${major}.${minor}.0 <${major}.${Number(minor) + 1}.0-0`;
                    else return `>=${major}.${minor}.0 <${Number(major) + 1}.0.0-0`;
                    if (preRelease) if ('0' !== major) return `>=${major}.${minor}.${patch}-${preRelease} <${Number(major) + 1}.0.0-0`;
                    else if ('0' === minor) return `>=${major}.${minor}.${patch}-${preRelease} <${major}.${minor}.${Number(patch) + 1}-0`;
                    else return `>=${major}.${minor}.${patch}-${preRelease} <${major}.${Number(minor) + 1}.0-0`;
                    if ('0' === major) if ('0' === minor) return `>=${major}.${minor}.${patch} <${major}.${minor}.${Number(patch) + 1}-0`;
                    else return `>=${major}.${minor}.${patch} <${major}.${Number(minor) + 1}.0-0`;
                    return `>=${major}.${minor}.${patch} <${Number(major) + 1}.0.0-0`;
                })).join(' ');
        }
        function parseTildes(range) {
            return range.trim().split(/\s+/).map((rangeVersion)=>rangeVersion.replace(parseRegex(tilde), (_, major, minor, patch, preRelease)=>{
                    if (isXVersion(major)) return '';
                    if (isXVersion(minor)) return `>=${major}.0.0 <${Number(major) + 1}.0.0-0`;
                    if (isXVersion(patch)) return `>=${major}.${minor}.0 <${major}.${Number(minor) + 1}.0-0`;
                    if (preRelease) return `>=${major}.${minor}.${patch}-${preRelease} <${major}.${Number(minor) + 1}.0-0`;
                    return `>=${major}.${minor}.${patch} <${major}.${Number(minor) + 1}.0-0`;
                })).join(' ');
        }
        function parseXRanges(range) {
            return range.split(/\s+/).map((rangeVersion)=>rangeVersion.trim().replace(parseRegex(xRange), (ret, gtlt, major, minor, patch, preRelease)=>{
                    const isXMajor = isXVersion(major);
                    const isXMinor = isXMajor || isXVersion(minor);
                    const isXPatch = isXMinor || isXVersion(patch);
                    if ('=' === gtlt && isXPatch) gtlt = '';
                    preRelease = '';
                    if (isXMajor) if ('>' === gtlt || '<' === gtlt) return '<0.0.0-0';
                    else return '*';
                    if (gtlt && isXPatch) {
                        if (isXMinor) minor = 0;
                        patch = 0;
                        if ('>' === gtlt) {
                            gtlt = '>=';
                            if (isXMinor) {
                                major = Number(major) + 1;
                                minor = 0;
                                patch = 0;
                            } else {
                                minor = Number(minor) + 1;
                                patch = 0;
                            }
                        } else if ('<=' === gtlt) {
                            gtlt = '<';
                            if (isXMinor) major = Number(major) + 1;
                            else minor = Number(minor) + 1;
                        }
                        if ('<' === gtlt) preRelease = '-0';
                        return `${gtlt + major}.${minor}.${patch}${preRelease}`;
                    }
                    if (isXMinor) return `>=${major}.0.0${preRelease} <${Number(major) + 1}.0.0-0`;
                    if (isXPatch) return `>=${major}.${minor}.0${preRelease} <${major}.${Number(minor) + 1}.0-0`;
                    return ret;
                })).join(' ');
        }
        function parseStar(range) {
            return range.trim().replace(parseRegex(star), '');
        }
        function parseGTE0(comparatorString) {
            return comparatorString.trim().replace(parseRegex(gte0), '');
        }
        function compareAtom(rangeAtom, versionAtom) {
            rangeAtom = Number(rangeAtom) || rangeAtom;
            versionAtom = Number(versionAtom) || versionAtom;
            if (rangeAtom > versionAtom) return 1;
            if (rangeAtom === versionAtom) return 0;
            return -1;
        }
        function comparePreRelease(rangeAtom, versionAtom) {
            const { preRelease: rangePreRelease } = rangeAtom;
            const { preRelease: versionPreRelease } = versionAtom;
            if (void 0 === rangePreRelease && Boolean(versionPreRelease)) return 1;
            if (Boolean(rangePreRelease) && void 0 === versionPreRelease) return -1;
            if (void 0 === rangePreRelease && void 0 === versionPreRelease) return 0;
            for(let i = 0, n = rangePreRelease.length; i <= n; i++){
                const rangeElement = rangePreRelease[i];
                const versionElement = versionPreRelease[i];
                if (rangeElement !== versionElement) {
                    if (void 0 === rangeElement && void 0 === versionElement) return 0;
                    if (!rangeElement) return 1;
                    if (!versionElement) return -1;
                    return compareAtom(rangeElement, versionElement);
                }
            }
            return 0;
        }
        function compareVersion(rangeAtom, versionAtom) {
            return compareAtom(rangeAtom.major, versionAtom.major) || compareAtom(rangeAtom.minor, versionAtom.minor) || compareAtom(rangeAtom.patch, versionAtom.patch) || comparePreRelease(rangeAtom, versionAtom);
        }
        function eq(rangeAtom, versionAtom) {
            return rangeAtom.version === versionAtom.version;
        }
        function compare(rangeAtom, versionAtom) {
            switch(rangeAtom.operator){
                case '':
                case '=':
                    return eq(rangeAtom, versionAtom);
                case '>':
                    return compareVersion(rangeAtom, versionAtom) < 0;
                case '>=':
                    return eq(rangeAtom, versionAtom) || compareVersion(rangeAtom, versionAtom) < 0;
                case '<':
                    return compareVersion(rangeAtom, versionAtom) > 0;
                case '<=':
                    return eq(rangeAtom, versionAtom) || compareVersion(rangeAtom, versionAtom) > 0;
                case void 0:
                    return true;
                default:
                    return false;
            }
        }
        function parseComparatorString(range) {
            return pipe(parseCarets, parseTildes, parseXRanges, parseStar)(range);
        }
        function parseRange(range) {
            return pipe(parseHyphen, parseComparatorTrim, parseTildeTrim, parseCaretTrim)(range.trim()).split(/\s+/).join(' ');
        }
        function satisfy(version, range) {
            if (!version) return false;
            const parsedRange = parseRange(range);
            const parsedComparator = parsedRange.split(' ').map((rangeVersion)=>parseComparatorString(rangeVersion)).join(' ');
            const comparators = parsedComparator.split(/\s+/).map((comparator)=>parseGTE0(comparator));
            const extractedVersion = extractComparator(version);
            if (!extractedVersion) return false;
            const [, versionOperator, , versionMajor, versionMinor, versionPatch, versionPreRelease] = extractedVersion;
            const versionAtom = {
                operator: versionOperator,
                version: combineVersion(versionMajor, versionMinor, versionPatch, versionPreRelease),
                major: versionMajor,
                minor: versionMinor,
                patch: versionPatch,
                preRelease: null == versionPreRelease ? void 0 : versionPreRelease.split('.')
            };
            for (const comparator of comparators){
                const extractedComparator = extractComparator(comparator);
                if (!extractedComparator) return false;
                const [, rangeOperator, , rangeMajor, rangeMinor, rangePatch, rangePreRelease] = extractedComparator;
                const rangeAtom = {
                    operator: rangeOperator,
                    version: combineVersion(rangeMajor, rangeMinor, rangePatch, rangePreRelease),
                    major: rangeMajor,
                    minor: rangeMinor,
                    patch: rangePatch,
                    preRelease: null == rangePreRelease ? void 0 : rangePreRelease.split('.')
                };
                if (!compare(rangeAtom, versionAtom)) return false;
            }
            return true;
        }
        function formatShare(shareArgs, from, name1, shareStrategy) {
            let get;
            get = 'get' in shareArgs ? shareArgs.get : 'lib' in shareArgs ? ()=>Promise.resolve(shareArgs.lib) : ()=>Promise.resolve(()=>{
                    throw new Error(`Can not get shared '${name1}'!`);
                });
            if (shareArgs.strategy) warn('"shared.strategy is deprecated, please set in initOptions.shareStrategy instead!"');
            var _shareArgs_version, _shareArgs_scope, _shareArgs_strategy;
            return polyfills._extends({
                deps: [],
                useIn: [],
                from,
                loading: null
            }, shareArgs, {
                shareConfig: polyfills._extends({
                    requiredVersion: `^${shareArgs.version}`,
                    singleton: false,
                    eager: false,
                    strictVersion: false
                }, shareArgs.shareConfig),
                get,
                loaded: (null == shareArgs ? void 0 : shareArgs.loaded) || 'lib' in shareArgs ? true : void 0,
                version: null != (_shareArgs_version = shareArgs.version) ? _shareArgs_version : '0',
                scope: Array.isArray(shareArgs.scope) ? shareArgs.scope : [
                    null != (_shareArgs_scope = shareArgs.scope) ? _shareArgs_scope : 'default'
                ],
                strategy: (null != (_shareArgs_strategy = shareArgs.strategy) ? _shareArgs_strategy : shareStrategy) || 'version-first'
            });
        }
        function formatShareConfigs(globalOptions, userOptions) {
            const shareArgs = userOptions.shared || {};
            const from = userOptions.name;
            const shareInfos = Object.keys(shareArgs).reduce((res, pkgName)=>{
                const arrayShareArgs = arrayOptions(shareArgs[pkgName]);
                res[pkgName] = res[pkgName] || [];
                arrayShareArgs.forEach((shareConfig)=>{
                    res[pkgName].push(formatShare(shareConfig, from, pkgName, userOptions.shareStrategy));
                });
                return res;
            }, {});
            const shared = polyfills._extends({}, globalOptions.shared);
            Object.keys(shareInfos).forEach((shareKey)=>{
                if (shared[shareKey]) shareInfos[shareKey].forEach((newUserSharedOptions)=>{
                    const isSameVersion = shared[shareKey].find((sharedVal)=>sharedVal.version === newUserSharedOptions.version);
                    if (!isSameVersion) shared[shareKey].push(newUserSharedOptions);
                });
                else shared[shareKey] = shareInfos[shareKey];
            });
            return {
                shared,
                shareInfos
            };
        }
        function versionLt(a, b) {
            const transformInvalidVersion = (version)=>{
                const isNumberVersion = !Number.isNaN(Number(version));
                if (isNumberVersion) {
                    const splitArr = version.split('.');
                    let validVersion = version;
                    for(let i = 0; i < 3 - splitArr.length; i++)validVersion += '.0';
                    return validVersion;
                }
                return version;
            };
            if (satisfy(transformInvalidVersion(a), `<=${transformInvalidVersion(b)}`)) return true;
            return false;
        }
        const findVersion = (shareVersionMap, cb)=>{
            const callback = cb || function(prev, cur) {
                return versionLt(prev, cur);
            };
            return Object.keys(shareVersionMap).reduce((prev, cur)=>{
                if (!prev) return cur;
                if (callback(prev, cur)) return cur;
                if ('0' === prev) return cur;
                return prev;
            }, 0);
        };
        const isLoaded = (shared)=>Boolean(shared.loaded) || 'function' == typeof shared.lib;
        const isLoading = (shared)=>Boolean(shared.loading);
        function findSingletonVersionOrderByVersion(shareScopeMap, scope, pkgName) {
            const versions = shareScopeMap[scope][pkgName];
            const callback = function(prev, cur) {
                return !isLoaded(versions[prev]) && versionLt(prev, cur);
            };
            return findVersion(shareScopeMap[scope][pkgName], callback);
        }
        function findSingletonVersionOrderByLoaded(shareScopeMap, scope, pkgName) {
            const versions = shareScopeMap[scope][pkgName];
            const callback = function(prev, cur) {
                const isLoadingOrLoaded = (shared)=>isLoaded(shared) || isLoading(shared);
                if (isLoadingOrLoaded(versions[cur])) if (isLoadingOrLoaded(versions[prev])) return Boolean(versionLt(prev, cur));
                else return true;
                if (isLoadingOrLoaded(versions[prev])) return false;
                return versionLt(prev, cur);
            };
            return findVersion(shareScopeMap[scope][pkgName], callback);
        }
        function getFindShareFunction(strategy) {
            if ('loaded-first' === strategy) return findSingletonVersionOrderByLoaded;
            return findSingletonVersionOrderByVersion;
        }
        function getRegisteredShare(localShareScopeMap, pkgName, shareInfo, resolveShare) {
            if (!localShareScopeMap) return;
            const { shareConfig, scope = DEFAULT_SCOPE, strategy } = shareInfo;
            const scopes = Array.isArray(scope) ? scope : [
                scope
            ];
            for (const sc of scopes)if (shareConfig && localShareScopeMap[sc] && localShareScopeMap[sc][pkgName]) {
                const { requiredVersion } = shareConfig;
                const findShareFunction = getFindShareFunction(strategy);
                const maxOrSingletonVersion = findShareFunction(localShareScopeMap, sc, pkgName);
                const defaultResolver = ()=>{
                    if (shareConfig.singleton) {
                        if ('string' == typeof requiredVersion && !satisfy(maxOrSingletonVersion, requiredVersion)) {
                            const msg = `Version ${maxOrSingletonVersion} from ${maxOrSingletonVersion && localShareScopeMap[sc][pkgName][maxOrSingletonVersion].from} of shared singleton module ${pkgName} does not satisfy the requirement of ${shareInfo.from} which needs ${requiredVersion})`;
                            if (shareConfig.strictVersion) error(msg);
                            else warn(msg);
                        }
                        return localShareScopeMap[sc][pkgName][maxOrSingletonVersion];
                    }
                    if (false === requiredVersion || '*' === requiredVersion) return localShareScopeMap[sc][pkgName][maxOrSingletonVersion];
                    if (satisfy(maxOrSingletonVersion, requiredVersion)) return localShareScopeMap[sc][pkgName][maxOrSingletonVersion];
                    for (const [versionKey, versionValue] of Object.entries(localShareScopeMap[sc][pkgName]))if (satisfy(versionKey, requiredVersion)) return versionValue;
                };
                const params = {
                    shareScopeMap: localShareScopeMap,
                    scope: sc,
                    pkgName,
                    version: maxOrSingletonVersion,
                    GlobalFederation: Global.__FEDERATION__,
                    resolver: defaultResolver
                };
                const resolveShared = resolveShare.emit(params) || params;
                return resolveShared.resolver();
            }
        }
        function getGlobalShareScope() {
            return Global.__FEDERATION__.__SHARE__;
        }
        function getTargetSharedOptions(options) {
            const { pkgName, extraOptions, shareInfos } = options;
            const defaultResolver = (sharedOptions)=>{
                if (!sharedOptions) return;
                const shareVersionMap = {};
                sharedOptions.forEach((shared)=>{
                    shareVersionMap[shared.version] = shared;
                });
                const callback = function(prev, cur) {
                    return !isLoaded(shareVersionMap[prev]) && versionLt(prev, cur);
                };
                const maxVersion = findVersion(shareVersionMap, callback);
                return shareVersionMap[maxVersion];
            };
            var _extraOptions_resolver;
            const resolver = null != (_extraOptions_resolver = null == extraOptions ? void 0 : extraOptions.resolver) ? _extraOptions_resolver : defaultResolver;
            return Object.assign({}, resolver(shareInfos[pkgName]), null == extraOptions ? void 0 : extraOptions.customShareInfo);
        }
        const ShareUtils = {
            getRegisteredShare,
            getGlobalShareScope
        };
        const GlobalUtils = {
            Global,
            nativeGlobal,
            resetFederationGlobalInfo,
            setGlobalFederationInstance,
            getGlobalFederationConstructor,
            setGlobalFederationConstructor,
            getInfoWithoutType,
            getGlobalSnapshot,
            getTargetSnapshotInfoByModuleInfo,
            getGlobalSnapshotInfoByModuleInfo,
            setGlobalSnapshotInfoByModuleInfo,
            addGlobalSnapshot,
            getRemoteEntryExports,
            registerGlobalPlugins,
            getGlobalHostPlugins,
            getPreloaded,
            setPreloaded
        };
        var helpers = {
            global: GlobalUtils,
            share: ShareUtils
        };
        function getBuilderId() {
            return 'undefined' != typeof FEDERATION_BUILD_IDENTIFIER ? FEDERATION_BUILD_IDENTIFIER : '';
        }
        function matchRemoteWithNameAndExpose(remotes, id) {
            for (const remote of remotes){
                const isNameMatched = id.startsWith(remote.name);
                let expose = id.replace(remote.name, '');
                if (isNameMatched) {
                    if (expose.startsWith('/')) {
                        const pkgNameOrAlias = remote.name;
                        expose = `.${expose}`;
                        return {
                            pkgNameOrAlias,
                            expose,
                            remote
                        };
                    } else if ('' === expose) return {
                        pkgNameOrAlias: remote.name,
                        expose: '.',
                        remote
                    };
                }
                const isAliasMatched = remote.alias && id.startsWith(remote.alias);
                let exposeWithAlias = remote.alias && id.replace(remote.alias, '');
                if (remote.alias && isAliasMatched) {
                    if (exposeWithAlias && exposeWithAlias.startsWith('/')) {
                        const pkgNameOrAlias = remote.alias;
                        exposeWithAlias = `.${exposeWithAlias}`;
                        return {
                            pkgNameOrAlias,
                            expose: exposeWithAlias,
                            remote
                        };
                    } else if ('' === exposeWithAlias) return {
                        pkgNameOrAlias: remote.alias,
                        expose: '.',
                        remote
                    };
                }
            }
        }
        function matchRemote(remotes, nameOrAlias) {
            for (const remote of remotes){
                const isNameMatched = nameOrAlias === remote.name;
                if (isNameMatched) return remote;
                const isAliasMatched = remote.alias && nameOrAlias === remote.alias;
                if (isAliasMatched) return remote;
            }
        }
        function registerPlugins(plugins, hookInstances) {
            const globalPlugins = getGlobalHostPlugins();
            if (globalPlugins.length > 0) globalPlugins.forEach((plugin)=>{
                if (null == plugins ? void 0 : plugins.find((item)=>item.name !== plugin.name)) plugins.push(plugin);
            });
            if (plugins && plugins.length > 0) plugins.forEach((plugin)=>{
                hookInstances.forEach((hookInstance)=>{
                    hookInstance.applyPlugin(plugin);
                });
            });
            return plugins;
        }
        async function loadEsmEntry({ entry, remoteEntryExports }) {
            return new Promise((resolve, reject)=>{
                try {
                    if (remoteEntryExports) resolve(remoteEntryExports);
                    else if ('undefined' != typeof FEDERATION_ALLOW_NEW_FUNCTION) new Function('callbacks', `import("${entry}").then(callbacks[0]).catch(callbacks[1])`)([
                        resolve,
                        reject
                    ]);
                    else import(/* @vite-ignore */ entry).then(resolve).catch(reject);
                } catch (e) {
                    reject(e);
                }
            });
        }
        async function loadSystemJsEntry({ entry, remoteEntryExports }) {
            return new Promise((resolve, reject)=>{
                try {
                    if (remoteEntryExports) resolve(remoteEntryExports);
                    else new Function('callbacks', `System.import("${entry}").then(callbacks[0]).catch(callbacks[1])`)([
                        resolve,
                        reject
                    ]);
                } catch (e) {
                    reject(e);
                }
            });
        }
        async function loadEntryScript({ name: name1, globalName, entry, loaderHook }) {
            const { entryExports: remoteEntryExports } = getRemoteEntryExports(name1, globalName);
            if (remoteEntryExports) return remoteEntryExports;
            return sdk.loadScript(entry, {
                attrs: {},
                createScriptHook: (url, attrs)=>{
                    const res = loaderHook.lifecycle.createScript.emit({
                        url,
                        attrs
                    });
                    if (!res) return;
                    if (res instanceof HTMLScriptElement) return res;
                    if ("script" in res || 'timeout' in res) return res;
                }
            }).then(()=>{
                const { remoteEntryKey, entryExports } = getRemoteEntryExports(name1, globalName);
                assert(entryExports, errorCodes.getShortErrorMsg(errorCodes.RUNTIME_001, errorCodes.runtimeDescMap, {
                    remoteName: name1,
                    remoteEntryUrl: entry,
                    remoteEntryKey
                }));
                return entryExports;
            }).catch((e)=>{
                assert(void 0, errorCodes.getShortErrorMsg(errorCodes.RUNTIME_008, errorCodes.runtimeDescMap, {
                    remoteName: name1,
                    resourceUrl: entry
                }));
                throw e;
            });
        }
        async function loadEntryDom({ remoteInfo, remoteEntryExports, loaderHook }) {
            const { entry, entryGlobalName: globalName, name: name1, type } = remoteInfo;
            switch(type){
                case 'esm':
                case 'module':
                    return loadEsmEntry({
                        entry,
                        remoteEntryExports
                    });
                case 'system':
                    return loadSystemJsEntry({
                        entry,
                        remoteEntryExports
                    });
                default:
                    return loadEntryScript({
                        entry,
                        globalName,
                        name: name1,
                        loaderHook
                    });
            }
        }
        async function loadEntryNode({ remoteInfo, loaderHook }) {
            const { entry, entryGlobalName: globalName, name: name1, type } = remoteInfo;
            const { entryExports: remoteEntryExports } = getRemoteEntryExports(name1, globalName);
            if (remoteEntryExports) return remoteEntryExports;
            return sdk.loadScriptNode(entry, {
                attrs: {
                    name: name1,
                    globalName,
                    type
                },
                loaderHook: {
                    createScriptHook: (url, attrs = {})=>{
                        const res = loaderHook.lifecycle.createScript.emit({
                            url,
                            attrs
                        });
                        if (!res) return;
                        if ('url' in res) return res;
                    }
                }
            }).then(()=>{
                const { remoteEntryKey, entryExports } = getRemoteEntryExports(name1, globalName);
                assert(entryExports, errorCodes.getShortErrorMsg(errorCodes.RUNTIME_001, errorCodes.runtimeDescMap, {
                    remoteName: name1,
                    remoteEntryUrl: entry,
                    remoteEntryKey
                }));
                return entryExports;
            }).catch((e)=>{
                throw e;
            });
        }
        function getRemoteEntryUniqueKey(remoteInfo) {
            const { entry, name: name1 } = remoteInfo;
            return sdk.composeKeyWithSeparator(name1, entry);
        }
        async function getRemoteEntry({ origin, remoteEntryExports, remoteInfo }) {
            const uniqueKey = getRemoteEntryUniqueKey(remoteInfo);
            if (remoteEntryExports) return remoteEntryExports;
            if (!globalLoading[uniqueKey]) {
                const loadEntryHook = origin.remoteHandler.hooks.lifecycle.loadEntry;
                const loaderHook = origin.loaderHook;
                globalLoading[uniqueKey] = loadEntryHook.emit({
                    loaderHook,
                    remoteInfo,
                    remoteEntryExports
                }).then((res)=>{
                    if (res) return res;
                    return sdk.isBrowserEnv() ? loadEntryDom({
                        remoteInfo,
                        remoteEntryExports,
                        loaderHook
                    }) : loadEntryNode({
                        remoteInfo,
                        loaderHook
                    });
                });
            }
            return globalLoading[uniqueKey];
        }
        function getRemoteInfo(remote) {
            return polyfills._extends({}, remote, {
                entry: 'entry' in remote ? remote.entry : '',
                type: remote.type || DEFAULT_REMOTE_TYPE,
                entryGlobalName: remote.entryGlobalName || remote.name,
                shareScope: remote.shareScope || DEFAULT_SCOPE
            });
        }
        let Module = class {
            async getEntry() {
                if (this.remoteEntryExports) return this.remoteEntryExports;
                let remoteEntryExports;
                try {
                    remoteEntryExports = await getRemoteEntry({
                        origin: this.host,
                        remoteInfo: this.remoteInfo,
                        remoteEntryExports: this.remoteEntryExports
                    });
                } catch (err) {
                    const uniqueKey = getRemoteEntryUniqueKey(this.remoteInfo);
                    remoteEntryExports = await this.host.loaderHook.lifecycle.loadEntryError.emit({
                        getRemoteEntry,
                        origin: this.host,
                        remoteInfo: this.remoteInfo,
                        remoteEntryExports: this.remoteEntryExports,
                        globalLoading,
                        uniqueKey
                    });
                }
                assert(remoteEntryExports, `remoteEntryExports is undefined \n ${sdk.safeToString(this.remoteInfo)}`);
                this.remoteEntryExports = remoteEntryExports;
                return this.remoteEntryExports;
            }
            async get(id, expose, options, remoteSnapshot) {
                const { loadFactory = true } = options || {
                    loadFactory: true
                };
                const remoteEntryExports = await this.getEntry();
                if (!this.inited) {
                    const localShareScopeMap = this.host.shareScopeMap;
                    const remoteShareScope = this.remoteInfo.shareScope || 'default';
                    if (!localShareScopeMap[remoteShareScope]) localShareScopeMap[remoteShareScope] = {};
                    const shareScope = localShareScopeMap[remoteShareScope];
                    const initScope = [];
                    const remoteEntryInitOptions = {
                        version: this.remoteInfo.version || ''
                    };
                    Object.defineProperty(remoteEntryInitOptions, 'shareScopeMap', {
                        value: localShareScopeMap,
                        enumerable: false
                    });
                    const initContainerOptions = await this.host.hooks.lifecycle.beforeInitContainer.emit({
                        shareScope,
                        remoteEntryInitOptions,
                        initScope,
                        remoteInfo: this.remoteInfo,
                        origin: this.host
                    });
                    if (void 0 === (null == remoteEntryExports ? void 0 : remoteEntryExports.init)) error(errorCodes.getShortErrorMsg(errorCodes.RUNTIME_002, errorCodes.runtimeDescMap, {
                        remoteName: name,
                        remoteEntryUrl: this.remoteInfo.entry,
                        remoteEntryKey: this.remoteInfo.entryGlobalName
                    }));
                    await remoteEntryExports.init(initContainerOptions.shareScope, initContainerOptions.initScope, initContainerOptions.remoteEntryInitOptions);
                    await this.host.hooks.lifecycle.initContainer.emit(polyfills._extends({}, initContainerOptions, {
                        id,
                        remoteSnapshot,
                        remoteEntryExports
                    }));
                }
                this.lib = remoteEntryExports;
                this.inited = true;
                let moduleFactory;
                moduleFactory = await this.host.loaderHook.lifecycle.getModuleFactory.emit({
                    remoteEntryExports,
                    expose,
                    moduleInfo: this.remoteInfo
                });
                if (!moduleFactory) moduleFactory = await remoteEntryExports.get(expose);
                assert(moduleFactory, `${getFMId(this.remoteInfo)} remote don't export ${expose}.`);
                const symbolName = processModuleAlias(this.remoteInfo.name, expose);
                const wrapModuleFactory = this.wraperFactory(moduleFactory, symbolName);
                if (!loadFactory) return wrapModuleFactory;
                const exposeContent = await wrapModuleFactory();
                return exposeContent;
            }
            wraperFactory(moduleFactory, id) {
                function defineModuleId(res, id) {
                    if (res && 'object' == typeof res && Object.isExtensible(res) && !Object.getOwnPropertyDescriptor(res, Symbol.for('mf_module_id'))) Object.defineProperty(res, Symbol.for('mf_module_id'), {
                        value: id,
                        enumerable: false
                    });
                }
                if (moduleFactory instanceof Promise) return async ()=>{
                    const res = await moduleFactory();
                    defineModuleId(res, id);
                    return res;
                };
                return ()=>{
                    const res = moduleFactory();
                    defineModuleId(res, id);
                    return res;
                };
            }
            constructor({ remoteInfo, host }){
                this.inited = false;
                this.lib = void 0;
                this.remoteInfo = remoteInfo;
                this.host = host;
            }
        };
        class SyncHook {
            on(fn) {
                if ('function' == typeof fn) this.listeners.add(fn);
            }
            once(fn) {
                const self1 = this;
                this.on(function wrapper(...args) {
                    self1.remove(wrapper);
                    return fn.apply(null, args);
                });
            }
            emit(...data) {
                let result;
                if (this.listeners.size > 0) this.listeners.forEach((fn)=>{
                    result = fn(...data);
                });
                return result;
            }
            remove(fn) {
                this.listeners.delete(fn);
            }
            removeAll() {
                this.listeners.clear();
            }
            constructor(type){
                this.type = '';
                this.listeners = new Set();
                if (type) this.type = type;
            }
        }
        class AsyncHook extends SyncHook {
            emit(...data) {
                let result;
                const ls = Array.from(this.listeners);
                if (ls.length > 0) {
                    let i = 0;
                    const call = (prev)=>{
                        if (false === prev) return false;
                        if (i < ls.length) return Promise.resolve(ls[i++].apply(null, data)).then(call);
                        return prev;
                    };
                    result = call();
                }
                return Promise.resolve(result);
            }
        }
        function checkReturnData(originalData, returnedData) {
            if (!isObject(returnedData)) return false;
            if (originalData !== returnedData) {
                for(const key in originalData)if (!(key in returnedData)) return false;
            }
            return true;
        }
        class SyncWaterfallHook extends SyncHook {
            emit(data) {
                if (!isObject(data)) error(`The data for the "${this.type}" hook should be an object.`);
                for (const fn of this.listeners)try {
                    const tempData = fn(data);
                    if (checkReturnData(data, tempData)) data = tempData;
                    else {
                        this.onerror(`A plugin returned an unacceptable value for the "${this.type}" type.`);
                        break;
                    }
                } catch (e) {
                    warn(e);
                    this.onerror(e);
                }
                return data;
            }
            constructor(type){
                super(), this.onerror = error;
                this.type = type;
            }
        }
        class AsyncWaterfallHook extends SyncHook {
            emit(data) {
                if (!isObject(data)) error(`The response data for the "${this.type}" hook must be an object.`);
                const ls = Array.from(this.listeners);
                if (ls.length > 0) {
                    let i = 0;
                    const processError = (e)=>{
                        warn(e);
                        this.onerror(e);
                        return data;
                    };
                    const call = (prevData)=>{
                        if (checkReturnData(data, prevData)) {
                            data = prevData;
                            if (i < ls.length) try {
                                return Promise.resolve(ls[i++](data)).then(call, processError);
                            } catch (e) {
                                return processError(e);
                            }
                        } else this.onerror(`A plugin returned an incorrect value for the "${this.type}" type.`);
                        return data;
                    };
                    return Promise.resolve(call(data));
                }
                return Promise.resolve(data);
            }
            constructor(type){
                super(), this.onerror = error;
                this.type = type;
            }
        }
        class PluginSystem {
            applyPlugin(plugin) {
                assert(isPlainObject(plugin), 'Plugin configuration is invalid.');
                const pluginName = plugin.name;
                assert(pluginName, 'A name must be provided by the plugin.');
                if (!this.registerPlugins[pluginName]) {
                    this.registerPlugins[pluginName] = plugin;
                    Object.keys(this.lifecycle).forEach((key)=>{
                        const pluginLife = plugin[key];
                        if (pluginLife) this.lifecycle[key].on(pluginLife);
                    });
                }
            }
            removePlugin(pluginName) {
                assert(pluginName, 'A name is required.');
                const plugin = this.registerPlugins[pluginName];
                assert(plugin, `The plugin "${pluginName}" is not registered.`);
                Object.keys(plugin).forEach((key)=>{
                    if ('name' !== key) this.lifecycle[key].remove(plugin[key]);
                });
            }
            inherit({ lifecycle, registerPlugins }) {
                Object.keys(lifecycle).forEach((hookName)=>{
                    assert(!this.lifecycle[hookName], `The hook "${hookName}" has a conflict and cannot be inherited.`);
                    this.lifecycle[hookName] = lifecycle[hookName];
                });
                Object.keys(registerPlugins).forEach((pluginName)=>{
                    assert(!this.registerPlugins[pluginName], `The plugin "${pluginName}" has a conflict and cannot be inherited.`);
                    this.applyPlugin(registerPlugins[pluginName]);
                });
            }
            constructor(lifecycle){
                this.registerPlugins = {};
                this.lifecycle = lifecycle;
                this.lifecycleKeys = Object.keys(lifecycle);
            }
        }
        function defaultPreloadArgs(preloadConfig) {
            return polyfills._extends({
                resourceCategory: 'sync',
                share: true,
                depsRemote: true,
                prefetchInterface: false
            }, preloadConfig);
        }
        function formatPreloadArgs(remotes, preloadArgs) {
            return preloadArgs.map((args)=>{
                const remoteInfo = matchRemote(remotes, args.nameOrAlias);
                assert(remoteInfo, `Unable to preload ${args.nameOrAlias} as it is not included in ${!remoteInfo && sdk.safeToString({
                    remoteInfo,
                    remotes
                })}`);
                return {
                    remote: remoteInfo,
                    preloadConfig: defaultPreloadArgs(args)
                };
            });
        }
        function normalizePreloadExposes(exposes) {
            if (!exposes) return [];
            return exposes.map((expose)=>{
                if ('.' === expose) return expose;
                if (expose.startsWith('./')) return expose.replace('./', '');
                return expose;
            });
        }
        function preloadAssets(remoteInfo, host, assets, useLinkPreload = true) {
            const { cssAssets, jsAssetsWithoutEntry, entryAssets } = assets;
            if (host.options.inBrowser) {
                entryAssets.forEach((asset)=>{
                    const { moduleInfo } = asset;
                    const module = host.moduleCache.get(remoteInfo.name);
                    module ? getRemoteEntry({
                        origin: host,
                        remoteInfo: moduleInfo,
                        remoteEntryExports: module.remoteEntryExports
                    }) : getRemoteEntry({
                        origin: host,
                        remoteInfo: moduleInfo,
                        remoteEntryExports: void 0
                    });
                });
                if (useLinkPreload) {
                    const defaultAttrs = {
                        rel: 'preload',
                        as: 'style'
                    };
                    cssAssets.forEach((cssUrl)=>{
                        const { link: cssEl, needAttach } = sdk.createLink({
                            url: cssUrl,
                            cb: ()=>{},
                            attrs: defaultAttrs,
                            createLinkHook: (url, attrs)=>{
                                const res = host.loaderHook.lifecycle.createLink.emit({
                                    url,
                                    attrs
                                });
                                if (res instanceof HTMLLinkElement) return res;
                            }
                        });
                        needAttach && document.head.appendChild(cssEl);
                    });
                } else {
                    const defaultAttrs = {
                        rel: 'stylesheet',
                        type: 'text/css'
                    };
                    cssAssets.forEach((cssUrl)=>{
                        const { link: cssEl, needAttach } = sdk.createLink({
                            url: cssUrl,
                            cb: ()=>{},
                            attrs: defaultAttrs,
                            createLinkHook: (url, attrs)=>{
                                const res = host.loaderHook.lifecycle.createLink.emit({
                                    url,
                                    attrs
                                });
                                if (res instanceof HTMLLinkElement) return res;
                            },
                            needDeleteLink: false
                        });
                        needAttach && document.head.appendChild(cssEl);
                    });
                }
                if (useLinkPreload) {
                    const defaultAttrs = {
                        rel: 'preload',
                        as: "script"
                    };
                    jsAssetsWithoutEntry.forEach((jsUrl)=>{
                        const { link: linkEl, needAttach } = sdk.createLink({
                            url: jsUrl,
                            cb: ()=>{},
                            attrs: defaultAttrs,
                            createLinkHook: (url, attrs)=>{
                                const res = host.loaderHook.lifecycle.createLink.emit({
                                    url,
                                    attrs
                                });
                                if (res instanceof HTMLLinkElement) return res;
                            }
                        });
                        needAttach && document.head.appendChild(linkEl);
                    });
                } else {
                    const defaultAttrs = {
                        fetchpriority: 'high',
                        type: (null == remoteInfo ? void 0 : remoteInfo.type) === 'module' ? 'module' : "text/javascript"
                    };
                    jsAssetsWithoutEntry.forEach((jsUrl)=>{
                        const { script: scriptEl, needAttach } = sdk.createScript({
                            url: jsUrl,
                            cb: ()=>{},
                            attrs: defaultAttrs,
                            createScriptHook: (url, attrs)=>{
                                const res = host.loaderHook.lifecycle.createScript.emit({
                                    url,
                                    attrs
                                });
                                if (res instanceof HTMLScriptElement) return res;
                            },
                            needDeleteScript: true
                        });
                        needAttach && document.head.appendChild(scriptEl);
                    });
                }
            }
        }
        function assignRemoteInfo(remoteInfo, remoteSnapshot) {
            const remoteEntryInfo = getRemoteEntryInfoFromSnapshot(remoteSnapshot);
            if (!remoteEntryInfo.url) error(`The attribute remoteEntry of ${remoteInfo.name} must not be undefined.`);
            let entryUrl = sdk.getResourceUrl(remoteSnapshot, remoteEntryInfo.url);
            if (!sdk.isBrowserEnv() && !entryUrl.startsWith('http')) entryUrl = `https:${entryUrl}`;
            remoteInfo.type = remoteEntryInfo.type;
            remoteInfo.entryGlobalName = remoteEntryInfo.globalName;
            remoteInfo.entry = entryUrl;
            remoteInfo.version = remoteSnapshot.version;
            remoteInfo.buildVersion = remoteSnapshot.buildVersion;
        }
        function snapshotPlugin() {
            return {
                name: 'snapshot-plugin',
                async afterResolve (args) {
                    const { remote, pkgNameOrAlias, expose, origin, remoteInfo } = args;
                    if (!isRemoteInfoWithEntry(remote) || !isPureRemoteEntry(remote)) {
                        const { remoteSnapshot, globalSnapshot } = await origin.snapshotHandler.loadRemoteSnapshotInfo(remote);
                        assignRemoteInfo(remoteInfo, remoteSnapshot);
                        const preloadOptions = {
                            remote,
                            preloadConfig: {
                                nameOrAlias: pkgNameOrAlias,
                                exposes: [
                                    expose
                                ],
                                resourceCategory: 'sync',
                                share: false,
                                depsRemote: false
                            }
                        };
                        const assets = await origin.remoteHandler.hooks.lifecycle.generatePreloadAssets.emit({
                            origin,
                            preloadOptions,
                            remoteInfo,
                            remote,
                            remoteSnapshot,
                            globalSnapshot
                        });
                        if (assets) preloadAssets(remoteInfo, origin, assets, false);
                        return polyfills._extends({}, args, {
                            remoteSnapshot
                        });
                    }
                    return args;
                }
            };
        }
        function splitId(id) {
            const splitInfo = id.split(':');
            if (1 === splitInfo.length) return {
                name: splitInfo[0],
                version: void 0
            };
            if (2 === splitInfo.length) return {
                name: splitInfo[0],
                version: splitInfo[1]
            };
            return {
                name: splitInfo[1],
                version: splitInfo[2]
            };
        }
        function traverseModuleInfo(globalSnapshot, remoteInfo, traverse, isRoot, memo = {}, remoteSnapshot) {
            const id = getFMId(remoteInfo);
            const { value: snapshotValue } = getInfoWithoutType(globalSnapshot, id);
            const effectiveRemoteSnapshot = remoteSnapshot || snapshotValue;
            if (effectiveRemoteSnapshot && !sdk.isManifestProvider(effectiveRemoteSnapshot)) {
                traverse(effectiveRemoteSnapshot, remoteInfo, isRoot);
                if (effectiveRemoteSnapshot.remotesInfo) {
                    const remoteKeys = Object.keys(effectiveRemoteSnapshot.remotesInfo);
                    for (const key of remoteKeys){
                        if (memo[key]) continue;
                        memo[key] = true;
                        const subRemoteInfo = splitId(key);
                        const remoteValue = effectiveRemoteSnapshot.remotesInfo[key];
                        traverseModuleInfo(globalSnapshot, {
                            name: subRemoteInfo.name,
                            version: remoteValue.matchedVersion
                        }, traverse, false, memo, void 0);
                    }
                }
            }
        }
        function generatePreloadAssets(origin, preloadOptions, remote, globalSnapshot, remoteSnapshot) {
            const cssAssets = [];
            const jsAssets = [];
            const entryAssets = [];
            const loadedSharedJsAssets = new Set();
            const loadedSharedCssAssets = new Set();
            const { options } = origin;
            const { preloadConfig: rootPreloadConfig } = preloadOptions;
            const { depsRemote } = rootPreloadConfig;
            const memo = {};
            traverseModuleInfo(globalSnapshot, remote, (moduleInfoSnapshot, remoteInfo, isRoot)=>{
                let preloadConfig;
                if (isRoot) preloadConfig = rootPreloadConfig;
                else if (Array.isArray(depsRemote)) {
                    const findPreloadConfig = depsRemote.find((remoteConfig)=>{
                        if (remoteConfig.nameOrAlias === remoteInfo.name || remoteConfig.nameOrAlias === remoteInfo.alias) return true;
                        return false;
                    });
                    if (!findPreloadConfig) return;
                    preloadConfig = defaultPreloadArgs(findPreloadConfig);
                } else {
                    if (true !== depsRemote) return;
                    preloadConfig = rootPreloadConfig;
                }
                const remoteEntryUrl = sdk.getResourceUrl(moduleInfoSnapshot, getRemoteEntryInfoFromSnapshot(moduleInfoSnapshot).url);
                if (remoteEntryUrl) entryAssets.push({
                    name: remoteInfo.name,
                    moduleInfo: {
                        name: remoteInfo.name,
                        entry: remoteEntryUrl,
                        type: 'remoteEntryType' in moduleInfoSnapshot ? moduleInfoSnapshot.remoteEntryType : 'global',
                        entryGlobalName: 'globalName' in moduleInfoSnapshot ? moduleInfoSnapshot.globalName : remoteInfo.name,
                        shareScope: '',
                        version: 'version' in moduleInfoSnapshot ? moduleInfoSnapshot.version : void 0
                    },
                    url: remoteEntryUrl
                });
                let moduleAssetsInfo = 'modules' in moduleInfoSnapshot ? moduleInfoSnapshot.modules : [];
                const normalizedPreloadExposes = normalizePreloadExposes(preloadConfig.exposes);
                if (normalizedPreloadExposes.length && 'modules' in moduleInfoSnapshot) {
                    var _moduleInfoSnapshot_modules;
                    moduleAssetsInfo = null == moduleInfoSnapshot ? void 0 : null == (_moduleInfoSnapshot_modules = moduleInfoSnapshot.modules) ? void 0 : _moduleInfoSnapshot_modules.reduce((assets, moduleAssetInfo)=>{
                        if ((null == normalizedPreloadExposes ? void 0 : normalizedPreloadExposes.indexOf(moduleAssetInfo.moduleName)) !== -1) assets.push(moduleAssetInfo);
                        return assets;
                    }, []);
                }
                function handleAssets(assets) {
                    const assetsRes = assets.map((asset)=>sdk.getResourceUrl(moduleInfoSnapshot, asset));
                    if (preloadConfig.filter) return assetsRes.filter(preloadConfig.filter);
                    return assetsRes;
                }
                if (moduleAssetsInfo) {
                    const assetsLength = moduleAssetsInfo.length;
                    for(let index = 0; index < assetsLength; index++){
                        const assetsInfo = moduleAssetsInfo[index];
                        const exposeFullPath = `${remoteInfo.name}/${assetsInfo.moduleName}`;
                        origin.remoteHandler.hooks.lifecycle.handlePreloadModule.emit({
                            id: '.' === assetsInfo.moduleName ? remoteInfo.name : exposeFullPath,
                            name: remoteInfo.name,
                            remoteSnapshot: moduleInfoSnapshot,
                            preloadConfig,
                            remote: remoteInfo,
                            origin
                        });
                        const preloaded = getPreloaded(exposeFullPath);
                        if (!preloaded) {
                            if ('all' === preloadConfig.resourceCategory) {
                                cssAssets.push(...handleAssets(assetsInfo.assets.css.async));
                                cssAssets.push(...handleAssets(assetsInfo.assets.css.sync));
                                jsAssets.push(...handleAssets(assetsInfo.assets.js.async));
                                jsAssets.push(...handleAssets(assetsInfo.assets.js.sync));
                            } else if (preloadConfig.resourceCategory = 'sync') {
                                cssAssets.push(...handleAssets(assetsInfo.assets.css.sync));
                                jsAssets.push(...handleAssets(assetsInfo.assets.js.sync));
                            }
                            setPreloaded(exposeFullPath);
                        }
                    }
                }
            }, true, memo, remoteSnapshot);
            if (remoteSnapshot.shared) {
                const collectSharedAssets = (shareInfo, snapshotShared)=>{
                    const registeredShared = getRegisteredShare(origin.shareScopeMap, snapshotShared.sharedName, shareInfo, origin.sharedHandler.hooks.lifecycle.resolveShare);
                    if (registeredShared && 'function' == typeof registeredShared.lib) {
                        snapshotShared.assets.js.sync.forEach((asset)=>{
                            loadedSharedJsAssets.add(asset);
                        });
                        snapshotShared.assets.css.sync.forEach((asset)=>{
                            loadedSharedCssAssets.add(asset);
                        });
                    }
                };
                remoteSnapshot.shared.forEach((shared)=>{
                    var _options_shared;
                    const shareInfos = null == (_options_shared = options.shared) ? void 0 : _options_shared[shared.sharedName];
                    if (!shareInfos) return;
                    const sharedOptions = shared.version ? shareInfos.find((s)=>s.version === shared.version) : shareInfos;
                    if (!sharedOptions) return;
                    const arrayShareInfo = arrayOptions(sharedOptions);
                    arrayShareInfo.forEach((s)=>{
                        collectSharedAssets(s, shared);
                    });
                });
            }
            const needPreloadJsAssets = jsAssets.filter((asset)=>!loadedSharedJsAssets.has(asset));
            const needPreloadCssAssets = cssAssets.filter((asset)=>!loadedSharedCssAssets.has(asset));
            return {
                cssAssets: needPreloadCssAssets,
                jsAssetsWithoutEntry: needPreloadJsAssets,
                entryAssets
            };
        }
        const generatePreloadAssetsPlugin = function() {
            return {
                name: 'generate-preload-assets-plugin',
                async generatePreloadAssets (args) {
                    const { origin, preloadOptions, remoteInfo, remote, globalSnapshot, remoteSnapshot } = args;
                    if (isRemoteInfoWithEntry(remote) && isPureRemoteEntry(remote)) return {
                        cssAssets: [],
                        jsAssetsWithoutEntry: [],
                        entryAssets: [
                            {
                                name: remote.name,
                                url: remote.entry,
                                moduleInfo: {
                                    name: remoteInfo.name,
                                    entry: remote.entry,
                                    type: remoteInfo.type || 'global',
                                    entryGlobalName: '',
                                    shareScope: ''
                                }
                            }
                        ]
                    };
                    assignRemoteInfo(remoteInfo, remoteSnapshot);
                    const assets = generatePreloadAssets(origin, preloadOptions, remoteInfo, globalSnapshot, remoteSnapshot);
                    return assets;
                }
            };
        };
        function getGlobalRemoteInfo(moduleInfo, origin) {
            const hostGlobalSnapshot = getGlobalSnapshotInfoByModuleInfo({
                name: origin.options.name,
                version: origin.options.version
            });
            const globalRemoteInfo = hostGlobalSnapshot && 'remotesInfo' in hostGlobalSnapshot && hostGlobalSnapshot.remotesInfo && getInfoWithoutType(hostGlobalSnapshot.remotesInfo, moduleInfo.name).value;
            if (globalRemoteInfo && globalRemoteInfo.matchedVersion) return {
                hostGlobalSnapshot,
                globalSnapshot: getGlobalSnapshot(),
                remoteSnapshot: getGlobalSnapshotInfoByModuleInfo({
                    name: moduleInfo.name,
                    version: globalRemoteInfo.matchedVersion
                })
            };
            return {
                hostGlobalSnapshot: void 0,
                globalSnapshot: getGlobalSnapshot(),
                remoteSnapshot: getGlobalSnapshotInfoByModuleInfo({
                    name: moduleInfo.name,
                    version: 'version' in moduleInfo ? moduleInfo.version : void 0
                })
            };
        }
        class SnapshotHandler {
            async loadSnapshot(moduleInfo) {
                const { options } = this.HostInstance;
                const { hostGlobalSnapshot, remoteSnapshot, globalSnapshot } = this.getGlobalRemoteInfo(moduleInfo);
                const { remoteSnapshot: globalRemoteSnapshot, globalSnapshot: globalSnapshotRes } = await this.hooks.lifecycle.loadSnapshot.emit({
                    options,
                    moduleInfo,
                    hostGlobalSnapshot,
                    remoteSnapshot,
                    globalSnapshot
                });
                return {
                    remoteSnapshot: globalRemoteSnapshot,
                    globalSnapshot: globalSnapshotRes
                };
            }
            async loadRemoteSnapshotInfo(moduleInfo) {
                const { options } = this.HostInstance;
                await this.hooks.lifecycle.beforeLoadRemoteSnapshot.emit({
                    options,
                    moduleInfo
                });
                let hostSnapshot = getGlobalSnapshotInfoByModuleInfo({
                    name: this.HostInstance.options.name,
                    version: this.HostInstance.options.version
                });
                if (!hostSnapshot) {
                    hostSnapshot = {
                        version: this.HostInstance.options.version || '',
                        remoteEntry: '',
                        remotesInfo: {}
                    };
                    addGlobalSnapshot({
                        [this.HostInstance.options.name]: hostSnapshot
                    });
                }
                if (hostSnapshot && 'remotesInfo' in hostSnapshot && !getInfoWithoutType(hostSnapshot.remotesInfo, moduleInfo.name).value) {
                    if ('version' in moduleInfo || 'entry' in moduleInfo) hostSnapshot.remotesInfo = polyfills._extends({}, null == hostSnapshot ? void 0 : hostSnapshot.remotesInfo, {
                        [moduleInfo.name]: {
                            matchedVersion: 'version' in moduleInfo ? moduleInfo.version : moduleInfo.entry
                        }
                    });
                }
                const { hostGlobalSnapshot, remoteSnapshot, globalSnapshot } = this.getGlobalRemoteInfo(moduleInfo);
                const { remoteSnapshot: globalRemoteSnapshot, globalSnapshot: globalSnapshotRes } = await this.hooks.lifecycle.loadSnapshot.emit({
                    options,
                    moduleInfo,
                    hostGlobalSnapshot,
                    remoteSnapshot,
                    globalSnapshot
                });
                let mSnapshot;
                let gSnapshot;
                if (globalRemoteSnapshot) if (sdk.isManifestProvider(globalRemoteSnapshot)) {
                    const remoteEntry = sdk.isBrowserEnv() ? globalRemoteSnapshot.remoteEntry : globalRemoteSnapshot.ssrRemoteEntry || globalRemoteSnapshot.remoteEntry || '';
                    const moduleSnapshot = await this.getManifestJson(remoteEntry, moduleInfo, {});
                    const globalSnapshotRes = setGlobalSnapshotInfoByModuleInfo(polyfills._extends({}, moduleInfo, {
                        entry: remoteEntry
                    }), moduleSnapshot);
                    mSnapshot = moduleSnapshot;
                    gSnapshot = globalSnapshotRes;
                } else {
                    const { remoteSnapshot: remoteSnapshotRes } = await this.hooks.lifecycle.loadRemoteSnapshot.emit({
                        options: this.HostInstance.options,
                        moduleInfo,
                        remoteSnapshot: globalRemoteSnapshot,
                        from: 'global'
                    });
                    mSnapshot = remoteSnapshotRes;
                    gSnapshot = globalSnapshotRes;
                }
                else if (isRemoteInfoWithEntry(moduleInfo)) {
                    const moduleSnapshot = await this.getManifestJson(moduleInfo.entry, moduleInfo, {});
                    const globalSnapshotRes = setGlobalSnapshotInfoByModuleInfo(moduleInfo, moduleSnapshot);
                    const { remoteSnapshot: remoteSnapshotRes } = await this.hooks.lifecycle.loadRemoteSnapshot.emit({
                        options: this.HostInstance.options,
                        moduleInfo,
                        remoteSnapshot: moduleSnapshot,
                        from: 'global'
                    });
                    mSnapshot = remoteSnapshotRes;
                    gSnapshot = globalSnapshotRes;
                } else error(errorCodes.getShortErrorMsg(errorCodes.RUNTIME_007, errorCodes.runtimeDescMap, {
                    hostName: moduleInfo.name,
                    hostVersion: moduleInfo.version,
                    globalSnapshot: JSON.stringify(globalSnapshotRes)
                }));
                await this.hooks.lifecycle.afterLoadSnapshot.emit({
                    options,
                    moduleInfo,
                    remoteSnapshot: mSnapshot
                });
                return {
                    remoteSnapshot: mSnapshot,
                    globalSnapshot: gSnapshot
                };
            }
            getGlobalRemoteInfo(moduleInfo) {
                return getGlobalRemoteInfo(moduleInfo, this.HostInstance);
            }
            async getManifestJson(manifestUrl, moduleInfo, extraOptions) {
                const getManifest = async ()=>{
                    let manifestJson = this.manifestCache.get(manifestUrl);
                    if (manifestJson) return manifestJson;
                    try {
                        let res = await this.loaderHook.lifecycle.fetch.emit(manifestUrl, {});
                        if (!res || !(res instanceof Response)) res = await fetch(manifestUrl, {});
                        manifestJson = await res.json();
                    } catch (err) {
                        manifestJson = await this.HostInstance.remoteHandler.hooks.lifecycle.errorLoadRemote.emit({
                            id: manifestUrl,
                            error,
                            from: 'runtime',
                            lifecycle: 'afterResolve',
                            origin: this.HostInstance
                        });
                        if (!manifestJson) {
                            delete this.manifestLoading[manifestUrl];
                            error(errorCodes.getShortErrorMsg(errorCodes.RUNTIME_003, errorCodes.runtimeDescMap, {
                                manifestUrl,
                                moduleName: moduleInfo.name
                            }, `${err}`));
                        }
                    }
                    assert(manifestJson.metaData && manifestJson.exposes && manifestJson.shared, `${manifestUrl} is not a federation manifest`);
                    this.manifestCache.set(manifestUrl, manifestJson);
                    return manifestJson;
                };
                const asyncLoadProcess = async ()=>{
                    const manifestJson = await getManifest();
                    const remoteSnapshot = sdk.generateSnapshotFromManifest(manifestJson, {
                        version: manifestUrl
                    });
                    const { remoteSnapshot: remoteSnapshotRes } = await this.hooks.lifecycle.loadRemoteSnapshot.emit({
                        options: this.HostInstance.options,
                        moduleInfo,
                        manifestJson,
                        remoteSnapshot,
                        manifestUrl,
                        from: 'manifest'
                    });
                    return remoteSnapshotRes;
                };
                if (!this.manifestLoading[manifestUrl]) this.manifestLoading[manifestUrl] = asyncLoadProcess().then((res)=>res);
                return this.manifestLoading[manifestUrl];
            }
            constructor(HostInstance){
                this.loadingHostSnapshot = null;
                this.manifestCache = new Map();
                this.hooks = new PluginSystem({
                    beforeLoadRemoteSnapshot: new AsyncHook('beforeLoadRemoteSnapshot'),
                    loadSnapshot: new AsyncWaterfallHook('loadGlobalSnapshot'),
                    loadRemoteSnapshot: new AsyncWaterfallHook('loadRemoteSnapshot'),
                    afterLoadSnapshot: new AsyncWaterfallHook('afterLoadSnapshot')
                });
                this.manifestLoading = Global.__FEDERATION__.__MANIFEST_LOADING__;
                this.HostInstance = HostInstance;
                this.loaderHook = HostInstance.loaderHook;
            }
        }
        class SharedHandler {
            registerShared(globalOptions, userOptions) {
                const { shareInfos, shared } = formatShareConfigs(globalOptions, userOptions);
                const sharedKeys = Object.keys(shareInfos);
                sharedKeys.forEach((sharedKey)=>{
                    const sharedVals = shareInfos[sharedKey];
                    sharedVals.forEach((sharedVal)=>{
                        const registeredShared = getRegisteredShare(this.shareScopeMap, sharedKey, sharedVal, this.hooks.lifecycle.resolveShare);
                        if (!registeredShared && sharedVal && sharedVal.lib) this.setShared({
                            pkgName: sharedKey,
                            lib: sharedVal.lib,
                            get: sharedVal.get,
                            loaded: true,
                            shared: sharedVal,
                            from: userOptions.name
                        });
                    });
                });
                return {
                    shareInfos,
                    shared
                };
            }
            async loadShare(pkgName, extraOptions) {
                const { host } = this;
                const shareInfo = getTargetSharedOptions({
                    pkgName,
                    extraOptions,
                    shareInfos: host.options.shared
                });
                if (null == shareInfo ? void 0 : shareInfo.scope) await Promise.all(shareInfo.scope.map(async (shareScope)=>{
                    await Promise.all(this.initializeSharing(shareScope, {
                        strategy: shareInfo.strategy
                    }));
                }));
                const loadShareRes = await this.hooks.lifecycle.beforeLoadShare.emit({
                    pkgName,
                    shareInfo,
                    shared: host.options.shared,
                    origin: host
                });
                const { shareInfo: shareInfoRes } = loadShareRes;
                assert(shareInfoRes, `Cannot find ${pkgName} Share in the ${host.options.name}. Please ensure that the ${pkgName} Share parameters have been injected`);
                const registeredShared = getRegisteredShare(this.shareScopeMap, pkgName, shareInfoRes, this.hooks.lifecycle.resolveShare);
                const addUseIn = (shared)=>{
                    if (!shared.useIn) shared.useIn = [];
                    addUniqueItem(shared.useIn, host.options.name);
                };
                if (registeredShared && registeredShared.lib) {
                    addUseIn(registeredShared);
                    return registeredShared.lib;
                }
                if (registeredShared && registeredShared.loading && !registeredShared.loaded) {
                    const factory = await registeredShared.loading;
                    registeredShared.loaded = true;
                    if (!registeredShared.lib) registeredShared.lib = factory;
                    addUseIn(registeredShared);
                    return factory;
                }
                if (registeredShared) {
                    const asyncLoadProcess = async ()=>{
                        const factory = await registeredShared.get();
                        shareInfoRes.lib = factory;
                        shareInfoRes.loaded = true;
                        addUseIn(shareInfoRes);
                        const gShared = getRegisteredShare(this.shareScopeMap, pkgName, shareInfoRes, this.hooks.lifecycle.resolveShare);
                        if (gShared) {
                            gShared.lib = factory;
                            gShared.loaded = true;
                        }
                        return factory;
                    };
                    const loading = asyncLoadProcess();
                    this.setShared({
                        pkgName,
                        loaded: false,
                        shared: registeredShared,
                        from: host.options.name,
                        lib: null,
                        loading
                    });
                    return loading;
                }
                {
                    if (null == extraOptions ? void 0 : extraOptions.customShareInfo) return false;
                    const asyncLoadProcess = async ()=>{
                        const factory = await shareInfoRes.get();
                        shareInfoRes.lib = factory;
                        shareInfoRes.loaded = true;
                        addUseIn(shareInfoRes);
                        const gShared = getRegisteredShare(this.shareScopeMap, pkgName, shareInfoRes, this.hooks.lifecycle.resolveShare);
                        if (gShared) {
                            gShared.lib = factory;
                            gShared.loaded = true;
                        }
                        return factory;
                    };
                    const loading = asyncLoadProcess();
                    this.setShared({
                        pkgName,
                        loaded: false,
                        shared: shareInfoRes,
                        from: host.options.name,
                        lib: null,
                        loading
                    });
                    return loading;
                }
            }
            initializeSharing(shareScopeName = DEFAULT_SCOPE, extraOptions) {
                const { host } = this;
                const from = null == extraOptions ? void 0 : extraOptions.from;
                const strategy = null == extraOptions ? void 0 : extraOptions.strategy;
                let initScope = null == extraOptions ? void 0 : extraOptions.initScope;
                const promises = [];
                if ('build' !== from) {
                    const { initTokens } = this;
                    if (!initScope) initScope = [];
                    let initToken = initTokens[shareScopeName];
                    if (!initToken) initToken = initTokens[shareScopeName] = {
                        from: this.host.name
                    };
                    if (initScope.indexOf(initToken) >= 0) return promises;
                    initScope.push(initToken);
                }
                const shareScope = this.shareScopeMap;
                const hostName = host.options.name;
                if (!shareScope[shareScopeName]) shareScope[shareScopeName] = {};
                const scope = shareScope[shareScopeName];
                const register = (name1, shared)=>{
                    var _activeVersion_shareConfig;
                    const { version, eager } = shared;
                    scope[name1] = scope[name1] || {};
                    const versions = scope[name1];
                    const activeVersion = versions[version];
                    const activeVersionEager = Boolean(activeVersion && (activeVersion.eager || (null == (_activeVersion_shareConfig = activeVersion.shareConfig) ? void 0 : _activeVersion_shareConfig.eager)));
                    if (!activeVersion || 'loaded-first' !== activeVersion.strategy && !activeVersion.loaded && (Boolean(!eager) !== !activeVersionEager ? eager : hostName > activeVersion.from)) versions[version] = shared;
                };
                const initFn = (mod)=>mod && mod.init && mod.init(shareScope[shareScopeName], initScope);
                const initRemoteModule = async (key)=>{
                    const { module } = await host.remoteHandler.getRemoteModuleAndOptions({
                        id: key
                    });
                    if (module.getEntry) {
                        let remoteEntryExports;
                        try {
                            remoteEntryExports = await module.getEntry();
                        } catch (error) {
                            remoteEntryExports = await host.remoteHandler.hooks.lifecycle.errorLoadRemote.emit({
                                id: key,
                                error,
                                from: 'runtime',
                                lifecycle: 'beforeLoadShare',
                                origin: host
                            });
                        }
                        if (!module.inited) {
                            await initFn(remoteEntryExports);
                            module.inited = true;
                        }
                    }
                };
                Object.keys(host.options.shared).forEach((shareName)=>{
                    const sharedArr = host.options.shared[shareName];
                    sharedArr.forEach((shared)=>{
                        if (shared.scope.includes(shareScopeName)) register(shareName, shared);
                    });
                });
                if ('version-first' === host.options.shareStrategy || 'version-first' === strategy) host.options.remotes.forEach((remote)=>{
                    if (remote.shareScope === shareScopeName) promises.push(initRemoteModule(remote.name));
                });
                return promises;
            }
            loadShareSync(pkgName, extraOptions) {
                const { host } = this;
                const shareInfo = getTargetSharedOptions({
                    pkgName,
                    extraOptions,
                    shareInfos: host.options.shared
                });
                if (null == shareInfo ? void 0 : shareInfo.scope) shareInfo.scope.forEach((shareScope)=>{
                    this.initializeSharing(shareScope, {
                        strategy: shareInfo.strategy
                    });
                });
                const registeredShared = getRegisteredShare(this.shareScopeMap, pkgName, shareInfo, this.hooks.lifecycle.resolveShare);
                const addUseIn = (shared)=>{
                    if (!shared.useIn) shared.useIn = [];
                    addUniqueItem(shared.useIn, host.options.name);
                };
                if (registeredShared) {
                    if ('function' == typeof registeredShared.lib) {
                        addUseIn(registeredShared);
                        if (!registeredShared.loaded) {
                            registeredShared.loaded = true;
                            if (registeredShared.from === host.options.name) shareInfo.loaded = true;
                        }
                        return registeredShared.lib;
                    }
                    if ('function' == typeof registeredShared.get) {
                        const module = registeredShared.get();
                        if (!(module instanceof Promise)) {
                            addUseIn(registeredShared);
                            this.setShared({
                                pkgName,
                                loaded: true,
                                from: host.options.name,
                                lib: module,
                                shared: registeredShared
                            });
                            return module;
                        }
                    }
                }
                if (shareInfo.lib) {
                    if (!shareInfo.loaded) shareInfo.loaded = true;
                    return shareInfo.lib;
                }
                if (shareInfo.get) {
                    const module = shareInfo.get();
                    if (module instanceof Promise) {
                        const errorCode = (null == extraOptions ? void 0 : extraOptions.from) === 'build' ? errorCodes.RUNTIME_005 : errorCodes.RUNTIME_006;
                        throw new Error(errorCodes.getShortErrorMsg(errorCode, errorCodes.runtimeDescMap, {
                            hostName: host.options.name,
                            sharedPkgName: pkgName
                        }));
                    }
                    shareInfo.lib = module;
                    this.setShared({
                        pkgName,
                        loaded: true,
                        from: host.options.name,
                        lib: shareInfo.lib,
                        shared: shareInfo
                    });
                    return shareInfo.lib;
                }
                throw new Error(errorCodes.getShortErrorMsg(errorCodes.RUNTIME_006, errorCodes.runtimeDescMap, {
                    hostName: host.options.name,
                    sharedPkgName: pkgName
                }));
            }
            initShareScopeMap(scopeName, shareScope, extraOptions = {}) {
                const { host } = this;
                this.shareScopeMap[scopeName] = shareScope;
                this.hooks.lifecycle.initContainerShareScopeMap.emit({
                    shareScope,
                    options: host.options,
                    origin: host,
                    scopeName,
                    hostShareScopeMap: extraOptions.hostShareScopeMap
                });
            }
            setShared({ pkgName, shared, from, lib, loading, loaded, get }) {
                const { version, scope = 'default' } = shared, shareInfo = polyfills._object_without_properties_loose(shared, [
                    "version",
                    "scope"
                ]);
                const scopes = Array.isArray(scope) ? scope : [
                    scope
                ];
                scopes.forEach((sc)=>{
                    if (!this.shareScopeMap[sc]) this.shareScopeMap[sc] = {};
                    if (!this.shareScopeMap[sc][pkgName]) this.shareScopeMap[sc][pkgName] = {};
                    if (!this.shareScopeMap[sc][pkgName][version]) {
                        this.shareScopeMap[sc][pkgName][version] = polyfills._extends({
                            version,
                            scope: [
                                'default'
                            ]
                        }, shareInfo, {
                            lib,
                            loaded,
                            loading
                        });
                        if (get) this.shareScopeMap[sc][pkgName][version].get = get;
                        return;
                    }
                    const registeredShared = this.shareScopeMap[sc][pkgName][version];
                    if (loading && !registeredShared.loading) registeredShared.loading = loading;
                });
            }
            _setGlobalShareScopeMap(hostOptions) {
                const globalShareScopeMap = getGlobalShareScope();
                const identifier = hostOptions.id || hostOptions.name;
                if (identifier && !globalShareScopeMap[identifier]) globalShareScopeMap[identifier] = this.shareScopeMap;
            }
            constructor(host){
                this.hooks = new PluginSystem({
                    afterResolve: new AsyncWaterfallHook('afterResolve'),
                    beforeLoadShare: new AsyncWaterfallHook('beforeLoadShare'),
                    loadShare: new AsyncHook(),
                    resolveShare: new SyncWaterfallHook('resolveShare'),
                    initContainerShareScopeMap: new SyncWaterfallHook('initContainerShareScopeMap')
                });
                this.host = host;
                this.shareScopeMap = {};
                this.initTokens = {};
                this._setGlobalShareScopeMap(host.options);
            }
        }
        class RemoteHandler {
            formatAndRegisterRemote(globalOptions, userOptions) {
                const userRemotes = userOptions.remotes || [];
                return userRemotes.reduce((res, remote)=>{
                    this.registerRemote(remote, res, {
                        force: false
                    });
                    return res;
                }, globalOptions.remotes);
            }
            setIdToRemoteMap(id, remoteMatchInfo) {
                const { remote, expose } = remoteMatchInfo;
                const { name: name1, alias } = remote;
                this.idToRemoteMap[id] = {
                    name: remote.name,
                    expose
                };
                if (alias && id.startsWith(name1)) {
                    const idWithAlias = id.replace(name1, alias);
                    this.idToRemoteMap[idWithAlias] = {
                        name: remote.name,
                        expose
                    };
                    return;
                }
                if (alias && id.startsWith(alias)) {
                    const idWithName = id.replace(alias, name1);
                    this.idToRemoteMap[idWithName] = {
                        name: remote.name,
                        expose
                    };
                }
            }
            async loadRemote(id, options) {
                const { host } = this;
                try {
                    const { loadFactory = true } = options || {
                        loadFactory: true
                    };
                    const { module, moduleOptions, remoteMatchInfo } = await this.getRemoteModuleAndOptions({
                        id
                    });
                    const { pkgNameOrAlias, remote, expose, id: idRes, remoteSnapshot } = remoteMatchInfo;
                    const moduleOrFactory = await module.get(idRes, expose, options, remoteSnapshot);
                    const moduleWrapper = await this.hooks.lifecycle.onLoad.emit({
                        id: idRes,
                        pkgNameOrAlias,
                        expose,
                        exposeModule: loadFactory ? moduleOrFactory : void 0,
                        exposeModuleFactory: loadFactory ? void 0 : moduleOrFactory,
                        remote,
                        options: moduleOptions,
                        moduleInstance: module,
                        origin: host
                    });
                    this.setIdToRemoteMap(id, remoteMatchInfo);
                    if ('function' == typeof moduleWrapper) return moduleWrapper;
                    return moduleOrFactory;
                } catch (error) {
                    const { from = 'runtime' } = options || {
                        from: 'runtime'
                    };
                    const failOver = await this.hooks.lifecycle.errorLoadRemote.emit({
                        id,
                        error,
                        from,
                        lifecycle: 'onLoad',
                        origin: host
                    });
                    if (!failOver) throw error;
                    return failOver;
                }
            }
            async preloadRemote(preloadOptions) {
                const { host } = this;
                await this.hooks.lifecycle.beforePreloadRemote.emit({
                    preloadOps: preloadOptions,
                    options: host.options,
                    origin: host
                });
                const preloadOps = formatPreloadArgs(host.options.remotes, preloadOptions);
                await Promise.all(preloadOps.map(async (ops)=>{
                    const { remote } = ops;
                    const remoteInfo = getRemoteInfo(remote);
                    const { globalSnapshot, remoteSnapshot } = await host.snapshotHandler.loadRemoteSnapshotInfo(remote);
                    const assets = await this.hooks.lifecycle.generatePreloadAssets.emit({
                        origin: host,
                        preloadOptions: ops,
                        remote,
                        remoteInfo,
                        globalSnapshot,
                        remoteSnapshot
                    });
                    if (!assets) return;
                    preloadAssets(remoteInfo, host, assets);
                }));
            }
            registerRemotes(remotes, options) {
                const { host } = this;
                remotes.forEach((remote)=>{
                    this.registerRemote(remote, host.options.remotes, {
                        force: null == options ? void 0 : options.force
                    });
                });
            }
            async getRemoteModuleAndOptions(options) {
                const { host } = this;
                const { id } = options;
                let loadRemoteArgs;
                try {
                    loadRemoteArgs = await this.hooks.lifecycle.beforeRequest.emit({
                        id,
                        options: host.options,
                        origin: host
                    });
                } catch (error) {
                    loadRemoteArgs = await this.hooks.lifecycle.errorLoadRemote.emit({
                        id,
                        options: host.options,
                        origin: host,
                        from: 'runtime',
                        error,
                        lifecycle: 'beforeRequest'
                    });
                    if (!loadRemoteArgs) throw error;
                }
                const { id: idRes } = loadRemoteArgs;
                const remoteSplitInfo = matchRemoteWithNameAndExpose(host.options.remotes, idRes);
                assert(remoteSplitInfo, errorCodes.getShortErrorMsg(errorCodes.RUNTIME_004, errorCodes.runtimeDescMap, {
                    hostName: host.options.name,
                    requestId: idRes
                }));
                const { remote: rawRemote } = remoteSplitInfo;
                const remoteInfo = getRemoteInfo(rawRemote);
                const matchInfo = await host.sharedHandler.hooks.lifecycle.afterResolve.emit(polyfills._extends({
                    id: idRes
                }, remoteSplitInfo, {
                    options: host.options,
                    origin: host,
                    remoteInfo
                }));
                const { remote, expose } = matchInfo;
                assert(remote && expose, `The 'beforeRequest' hook was executed, but it failed to return the correct 'remote' and 'expose' values while loading ${idRes}.`);
                let module = host.moduleCache.get(remote.name);
                const moduleOptions = {
                    host: host,
                    remoteInfo
                };
                if (!module) {
                    module = new Module(moduleOptions);
                    host.moduleCache.set(remote.name, module);
                }
                return {
                    module,
                    moduleOptions,
                    remoteMatchInfo: matchInfo
                };
            }
            registerRemote(remote, targetRemotes, options) {
                const { host } = this;
                const normalizeRemote = ()=>{
                    if (remote.alias) {
                        const findEqual = targetRemotes.find((item)=>{
                            var _item_alias;
                            return remote.alias && (item.name.startsWith(remote.alias) || (null == (_item_alias = item.alias) ? void 0 : _item_alias.startsWith(remote.alias)));
                        });
                        assert(!findEqual, `The alias ${remote.alias} of remote ${remote.name} is not allowed to be the prefix of ${findEqual && findEqual.name} name or alias`);
                    }
                    if ('entry' in remote) {
                        if (sdk.isBrowserEnv() && !remote.entry.startsWith('http')) remote.entry = new URL(remote.entry, window.location.origin).href;
                    }
                    if (!remote.shareScope) remote.shareScope = DEFAULT_SCOPE;
                    if (!remote.type) remote.type = DEFAULT_REMOTE_TYPE;
                };
                this.hooks.lifecycle.beforeRegisterRemote.emit({
                    remote,
                    origin: host
                });
                const registeredRemote = targetRemotes.find((item)=>item.name === remote.name);
                if (registeredRemote) {
                    const messages = [
                        `The remote "${remote.name}" is already registered.`,
                        'Please note that overriding it may cause unexpected errors.'
                    ];
                    if (null == options ? void 0 : options.force) {
                        this.removeRemote(registeredRemote);
                        normalizeRemote();
                        targetRemotes.push(remote);
                        this.hooks.lifecycle.registerRemote.emit({
                            remote,
                            origin: host
                        });
                        sdk.warn(messages.join(' '));
                    }
                } else {
                    normalizeRemote();
                    targetRemotes.push(remote);
                    this.hooks.lifecycle.registerRemote.emit({
                        remote,
                        origin: host
                    });
                }
            }
            removeRemote(remote) {
                try {
                    const { host } = this;
                    const { name: name1 } = remote;
                    const remoteIndex = host.options.remotes.findIndex((item)=>item.name === name1);
                    if (-1 !== remoteIndex) host.options.remotes.splice(remoteIndex, 1);
                    const loadedModule = host.moduleCache.get(remote.name);
                    if (loadedModule) {
                        const remoteInfo = loadedModule.remoteInfo;
                        const key = remoteInfo.entryGlobalName;
                        if (CurrentGlobal[key]) {
                            var _Object_getOwnPropertyDescriptor;
                            if (null == (_Object_getOwnPropertyDescriptor = Object.getOwnPropertyDescriptor(CurrentGlobal, key)) ? void 0 : _Object_getOwnPropertyDescriptor.configurable) delete CurrentGlobal[key];
                            else CurrentGlobal[key] = void 0;
                        }
                        const remoteEntryUniqueKey = getRemoteEntryUniqueKey(loadedModule.remoteInfo);
                        if (globalLoading[remoteEntryUniqueKey]) delete globalLoading[remoteEntryUniqueKey];
                        host.snapshotHandler.manifestCache.delete(remoteInfo.entry);
                        let remoteInsId = remoteInfo.buildVersion ? sdk.composeKeyWithSeparator(remoteInfo.name, remoteInfo.buildVersion) : remoteInfo.name;
                        const remoteInsIndex = CurrentGlobal.__FEDERATION__.__INSTANCES__.findIndex((ins)=>{
                            if (remoteInfo.buildVersion) return ins.options.id === remoteInsId;
                            return ins.name === remoteInsId;
                        });
                        if (-1 !== remoteInsIndex) {
                            const remoteIns = CurrentGlobal.__FEDERATION__.__INSTANCES__[remoteInsIndex];
                            remoteInsId = remoteIns.options.id || remoteInsId;
                            const globalShareScopeMap = getGlobalShareScope();
                            let isAllSharedNotUsed = true;
                            const needDeleteKeys = [];
                            Object.keys(globalShareScopeMap).forEach((instId)=>{
                                const shareScopeMap = globalShareScopeMap[instId];
                                shareScopeMap && Object.keys(shareScopeMap).forEach((shareScope)=>{
                                    const shareScopeVal = shareScopeMap[shareScope];
                                    shareScopeVal && Object.keys(shareScopeVal).forEach((shareName)=>{
                                        const sharedPkgs = shareScopeVal[shareName];
                                        sharedPkgs && Object.keys(sharedPkgs).forEach((shareVersion)=>{
                                            const shared = sharedPkgs[shareVersion];
                                            if (shared && 'object' == typeof shared && shared.from === remoteInfo.name) if (shared.loaded || shared.loading) {
                                                shared.useIn = shared.useIn.filter((usedHostName)=>usedHostName !== remoteInfo.name);
                                                if (shared.useIn.length) isAllSharedNotUsed = false;
                                                else needDeleteKeys.push([
                                                    instId,
                                                    shareScope,
                                                    shareName,
                                                    shareVersion
                                                ]);
                                            } else needDeleteKeys.push([
                                                instId,
                                                shareScope,
                                                shareName,
                                                shareVersion
                                            ]);
                                        });
                                    });
                                });
                            });
                            if (isAllSharedNotUsed) {
                                remoteIns.shareScopeMap = {};
                                delete globalShareScopeMap[remoteInsId];
                            }
                            needDeleteKeys.forEach(([insId, shareScope, shareName, shareVersion])=>{
                                var _globalShareScopeMap_insId_shareScope_shareName, _globalShareScopeMap_insId_shareScope, _globalShareScopeMap_insId;
                                null == (_globalShareScopeMap_insId = globalShareScopeMap[insId]) || null == (_globalShareScopeMap_insId_shareScope = _globalShareScopeMap_insId[shareScope]) || null == (_globalShareScopeMap_insId_shareScope_shareName = _globalShareScopeMap_insId_shareScope[shareName]) || delete _globalShareScopeMap_insId_shareScope_shareName[shareVersion];
                            });
                            CurrentGlobal.__FEDERATION__.__INSTANCES__.splice(remoteInsIndex, 1);
                        }
                        const { hostGlobalSnapshot } = getGlobalRemoteInfo(remote, host);
                        if (hostGlobalSnapshot) {
                            const remoteKey = hostGlobalSnapshot && 'remotesInfo' in hostGlobalSnapshot && hostGlobalSnapshot.remotesInfo && getInfoWithoutType(hostGlobalSnapshot.remotesInfo, remote.name).key;
                            if (remoteKey) {
                                delete hostGlobalSnapshot.remotesInfo[remoteKey];
                                if (Boolean(Global.__FEDERATION__.__MANIFEST_LOADING__[remoteKey])) delete Global.__FEDERATION__.__MANIFEST_LOADING__[remoteKey];
                            }
                        }
                        host.moduleCache.delete(remote.name);
                    }
                } catch (err) {
                    logger.log('removeRemote fail: ', err);
                }
            }
            constructor(host){
                this.hooks = new PluginSystem({
                    beforeRegisterRemote: new SyncWaterfallHook('beforeRegisterRemote'),
                    registerRemote: new SyncWaterfallHook('registerRemote'),
                    beforeRequest: new AsyncWaterfallHook('beforeRequest'),
                    onLoad: new AsyncHook('onLoad'),
                    handlePreloadModule: new SyncHook('handlePreloadModule'),
                    errorLoadRemote: new AsyncHook('errorLoadRemote'),
                    beforePreloadRemote: new AsyncHook('beforePreloadRemote'),
                    generatePreloadAssets: new AsyncHook('generatePreloadAssets'),
                    afterPreloadRemote: new AsyncHook(),
                    loadEntry: new AsyncHook()
                });
                this.host = host;
                this.idToRemoteMap = {};
            }
        }
        class FederationHost {
            initOptions(userOptions) {
                this.registerPlugins(userOptions.plugins);
                const options = this.formatOptions(this.options, userOptions);
                this.options = options;
                return options;
            }
            async loadShare(pkgName, extraOptions) {
                return this.sharedHandler.loadShare(pkgName, extraOptions);
            }
            loadShareSync(pkgName, extraOptions) {
                return this.sharedHandler.loadShareSync(pkgName, extraOptions);
            }
            initializeSharing(shareScopeName = DEFAULT_SCOPE, extraOptions) {
                return this.sharedHandler.initializeSharing(shareScopeName, extraOptions);
            }
            initRawContainer(name1, url, container) {
                const remoteInfo = getRemoteInfo({
                    name: name1,
                    entry: url
                });
                const module = new Module({
                    host: this,
                    remoteInfo
                });
                module.remoteEntryExports = container;
                this.moduleCache.set(name1, module);
                return module;
            }
            async loadRemote(id, options) {
                return this.remoteHandler.loadRemote(id, options);
            }
            async preloadRemote(preloadOptions) {
                return this.remoteHandler.preloadRemote(preloadOptions);
            }
            initShareScopeMap(scopeName, shareScope, extraOptions = {}) {
                this.sharedHandler.initShareScopeMap(scopeName, shareScope, extraOptions);
            }
            formatOptions(globalOptions, userOptions) {
                const { shared } = formatShareConfigs(globalOptions, userOptions);
                const { userOptions: userOptionsRes, options: globalOptionsRes } = this.hooks.lifecycle.beforeInit.emit({
                    origin: this,
                    userOptions,
                    options: globalOptions,
                    shareInfo: shared
                });
                const remotes = this.remoteHandler.formatAndRegisterRemote(globalOptionsRes, userOptionsRes);
                const { shared: handledShared } = this.sharedHandler.registerShared(globalOptionsRes, userOptionsRes);
                const plugins = [
                    ...globalOptionsRes.plugins
                ];
                if (userOptionsRes.plugins) userOptionsRes.plugins.forEach((plugin)=>{
                    if (!plugins.includes(plugin)) plugins.push(plugin);
                });
                const optionsRes = polyfills._extends({}, globalOptions, userOptions, {
                    plugins,
                    remotes,
                    shared: handledShared
                });
                this.hooks.lifecycle.init.emit({
                    origin: this,
                    options: optionsRes
                });
                return optionsRes;
            }
            registerPlugins(plugins) {
                const pluginRes = registerPlugins(plugins, [
                    this.hooks,
                    this.remoteHandler.hooks,
                    this.sharedHandler.hooks,
                    this.snapshotHandler.hooks,
                    this.loaderHook,
                    this.bridgeHook
                ]);
                this.options.plugins = this.options.plugins.reduce((res, plugin)=>{
                    if (!plugin) return res;
                    if (res && !res.find((item)=>item.name === plugin.name)) res.push(plugin);
                    return res;
                }, pluginRes || []);
            }
            registerRemotes(remotes, options) {
                return this.remoteHandler.registerRemotes(remotes, options);
            }
            constructor(userOptions){
                this.hooks = new PluginSystem({
                    beforeInit: new SyncWaterfallHook('beforeInit'),
                    init: new SyncHook(),
                    beforeInitContainer: new AsyncWaterfallHook('beforeInitContainer'),
                    initContainer: new AsyncWaterfallHook('initContainer')
                });
                this.version = "0.6.20";
                this.moduleCache = new Map();
                this.loaderHook = new PluginSystem({
                    getModuleInfo: new SyncHook(),
                    createScript: new SyncHook(),
                    createLink: new SyncHook(),
                    fetch: new AsyncHook(),
                    loadEntryError: new AsyncHook(),
                    getModuleFactory: new AsyncHook()
                });
                this.bridgeHook = new PluginSystem({
                    beforeBridgeRender: new SyncHook(),
                    afterBridgeRender: new SyncHook(),
                    beforeBridgeDestroy: new SyncHook(),
                    afterBridgeDestroy: new SyncHook()
                });
                const defaultOptions = {
                    id: getBuilderId(),
                    name: userOptions.name,
                    plugins: [
                        snapshotPlugin(),
                        generatePreloadAssetsPlugin()
                    ],
                    remotes: [],
                    shared: {},
                    inBrowser: sdk.isBrowserEnv()
                };
                this.name = userOptions.name;
                this.options = defaultOptions;
                this.snapshotHandler = new SnapshotHandler(this);
                this.sharedHandler = new SharedHandler(this);
                this.remoteHandler = new RemoteHandler(this);
                this.shareScopeMap = this.sharedHandler.shareScopeMap;
                this.registerPlugins([
                    ...defaultOptions.plugins,
                    ...userOptions.plugins || []
                ]);
                this.options = this.formatOptions(defaultOptions, userOptions);
            }
        }
        var index = /*#__PURE__*/ Object.freeze({
            __proto__: null
        });
        Object.defineProperty(exports, "loadScript", {
            enumerable: true,
            get: function() {
                return sdk.loadScript;
            }
        });
        Object.defineProperty(exports, "loadScriptNode", {
            enumerable: true,
            get: function() {
                return sdk.loadScriptNode;
            }
        });
        exports.CurrentGlobal = CurrentGlobal;
        exports.FederationHost = FederationHost;
        exports.Global = Global;
        exports.Module = Module;
        exports.addGlobalSnapshot = addGlobalSnapshot;
        exports.assert = assert;
        exports.getGlobalFederationConstructor = getGlobalFederationConstructor;
        exports.getGlobalSnapshot = getGlobalSnapshot;
        exports.getInfoWithoutType = getInfoWithoutType;
        exports.getRegisteredShare = getRegisteredShare;
        exports.getRemoteEntry = getRemoteEntry;
        exports.getRemoteInfo = getRemoteInfo;
        exports.helpers = helpers;
        exports.isStaticResourcesEqual = isStaticResourcesEqual;
        exports.matchRemoteWithNameAndExpose = matchRemoteWithNameAndExpose;
        exports.registerGlobalPlugins = registerGlobalPlugins;
        exports.resetFederationGlobalInfo = resetFederationGlobalInfo;
        exports.safeWrapper = safeWrapper;
        exports.satisfy = satisfy;
        exports.setGlobalFederationConstructor = setGlobalFederationConstructor;
        exports.setGlobalFederationInstance = setGlobalFederationInstance;
        exports.types = index;
    },
    "../../node_modules/.pnpm/@module-federation+runtime-core@0.6.20/node_modules/@module-federation/runtime-core/dist/polyfills.cjs.js": function(__unused_webpack_module, exports) {
        function _extends() {
            _extends = Object.assign || function(target) {
                for(var i = 1; i < arguments.length; i++){
                    var source = arguments[i];
                    for(var key in source)if (Object.prototype.hasOwnProperty.call(source, key)) target[key] = source[key];
                }
                return target;
            };
            return _extends.apply(this, arguments);
        }
        function _object_without_properties_loose(source, excluded) {
            if (null == source) return {};
            var target = {};
            var sourceKeys = Object.keys(source);
            var key, i;
            for(i = 0; i < sourceKeys.length; i++){
                key = sourceKeys[i];
                if (!(excluded.indexOf(key) >= 0)) target[key] = source[key];
            }
            return target;
        }
        exports._extends = _extends;
        exports._object_without_properties_loose = _object_without_properties_loose;
    },
    "../../node_modules/.pnpm/@module-federation+runtime-tools@0.8.12/node_modules/@module-federation/runtime-tools/dist/runtime.cjs.js": function(__unused_webpack_module, exports, __webpack_require__) {
        var runtime = __webpack_require__("../../node_modules/.pnpm/@module-federation+runtime@0.8.12/node_modules/@module-federation/runtime/dist/index.cjs.js");
        Object.keys(runtime).forEach(function(k) {
            if ('default' !== k && !Object.prototype.hasOwnProperty.call(exports, k)) Object.defineProperty(exports, k, {
                enumerable: true,
                get: function() {
                    return runtime[k];
                }
            });
        });
    },
    "../../node_modules/.pnpm/@module-federation+runtime@0.8.12/node_modules/@module-federation/runtime/dist/index.cjs.js": function(__unused_webpack_module, exports, __webpack_require__) {
        var runtimeCore = __webpack_require__("../../node_modules/.pnpm/@module-federation+runtime-core@0.6.20/node_modules/@module-federation/runtime-core/dist/index.cjs.js");
        var utils = __webpack_require__("../../node_modules/.pnpm/@module-federation+runtime@0.8.12/node_modules/@module-federation/runtime/dist/utils.cjs.js");
        let FederationInstance = null;
        function init(options) {
            const instance = utils.getGlobalFederationInstance(options.name, options.version);
            if (instance) {
                instance.initOptions(options);
                if (!FederationInstance) FederationInstance = instance;
                return instance;
            }
            {
                const FederationConstructor = runtimeCore.getGlobalFederationConstructor() || runtimeCore.FederationHost;
                FederationInstance = new FederationConstructor(options);
                runtimeCore.setGlobalFederationInstance(FederationInstance);
                return FederationInstance;
            }
        }
        function loadRemote(...args) {
            runtimeCore.assert(FederationInstance, 'Please call init first');
            const loadRemote1 = FederationInstance.loadRemote;
            return loadRemote1.apply(FederationInstance, args);
        }
        function loadShare(...args) {
            runtimeCore.assert(FederationInstance, 'Please call init first');
            const loadShare1 = FederationInstance.loadShare;
            return loadShare1.apply(FederationInstance, args);
        }
        function loadShareSync(...args) {
            runtimeCore.assert(FederationInstance, 'Please call init first');
            const loadShareSync1 = FederationInstance.loadShareSync;
            return loadShareSync1.apply(FederationInstance, args);
        }
        function preloadRemote(...args) {
            runtimeCore.assert(FederationInstance, 'Please call init first');
            return FederationInstance.preloadRemote.apply(FederationInstance, args);
        }
        function registerRemotes(...args) {
            runtimeCore.assert(FederationInstance, 'Please call init first');
            return FederationInstance.registerRemotes.apply(FederationInstance, args);
        }
        function registerPlugins(...args) {
            runtimeCore.assert(FederationInstance, 'Please call init first');
            return FederationInstance.registerPlugins.apply(FederationInstance, args);
        }
        function getInstance() {
            return FederationInstance;
        }
        runtimeCore.setGlobalFederationConstructor(runtimeCore.FederationHost);
        Object.defineProperty(exports, "FederationHost", {
            enumerable: true,
            get: function() {
                return runtimeCore.FederationHost;
            }
        });
        Object.defineProperty(exports, "Module", {
            enumerable: true,
            get: function() {
                return runtimeCore.Module;
            }
        });
        Object.defineProperty(exports, "getRemoteEntry", {
            enumerable: true,
            get: function() {
                return runtimeCore.getRemoteEntry;
            }
        });
        Object.defineProperty(exports, "getRemoteInfo", {
            enumerable: true,
            get: function() {
                return runtimeCore.getRemoteInfo;
            }
        });
        Object.defineProperty(exports, "loadScript", {
            enumerable: true,
            get: function() {
                return runtimeCore.loadScript;
            }
        });
        Object.defineProperty(exports, "loadScriptNode", {
            enumerable: true,
            get: function() {
                return runtimeCore.loadScriptNode;
            }
        });
        Object.defineProperty(exports, "registerGlobalPlugins", {
            enumerable: true,
            get: function() {
                return runtimeCore.registerGlobalPlugins;
            }
        });
        exports.getInstance = getInstance;
        exports.init = init;
        exports.loadRemote = loadRemote;
        exports.loadShare = loadShare;
        exports.loadShareSync = loadShareSync;
        exports.preloadRemote = preloadRemote;
        exports.registerPlugins = registerPlugins;
        exports.registerRemotes = registerRemotes;
    },
    "../../node_modules/.pnpm/@module-federation+runtime@0.8.12/node_modules/@module-federation/runtime/dist/utils.cjs.js": function(__unused_webpack_module, exports, __webpack_require__) {
        var runtimeCore = __webpack_require__("../../node_modules/.pnpm/@module-federation+runtime-core@0.6.20/node_modules/@module-federation/runtime-core/dist/index.cjs.js");
        function getBuilderId() {
            return 'undefined' != typeof FEDERATION_BUILD_IDENTIFIER ? FEDERATION_BUILD_IDENTIFIER : '';
        }
        function getGlobalFederationInstance(name1, version) {
            const buildId = getBuilderId();
            return runtimeCore.CurrentGlobal.__FEDERATION__.__INSTANCES__.find((GMInstance)=>{
                if (buildId && GMInstance.options.id === getBuilderId()) return true;
                if (GMInstance.options.name === name1 && !GMInstance.options.version && !version) return true;
                if (GMInstance.options.name === name1 && version && GMInstance.options.version === version) return true;
                return false;
            });
        }
        exports.getGlobalFederationInstance = getGlobalFederationInstance;
    },
    "../../node_modules/.pnpm/@module-federation+sdk@0.8.12/node_modules/@module-federation/sdk/dist/index.cjs.js": function(__unused_webpack_module, exports, __webpack_require__) {
        var isomorphicRslog = __webpack_require__("../../node_modules/.pnpm/isomorphic-rslog@0.0.7/node_modules/isomorphic-rslog/dist/browser/index.cjs");
        var polyfills = __webpack_require__("../../node_modules/.pnpm/@module-federation+sdk@0.8.12/node_modules/@module-federation/sdk/dist/polyfills.cjs.js");
        const FederationModuleManifest = 'federation-manifest.json';
        const MANIFEST_EXT = '.json';
        const BROWSER_LOG_KEY = 'FEDERATION_DEBUG';
        const BROWSER_LOG_VALUE = '1';
        const NameTransformSymbol = {
            AT: '@',
            HYPHEN: '-',
            SLASH: '/'
        };
        const NameTransformMap = {
            [NameTransformSymbol.AT]: 'scope_',
            [NameTransformSymbol.HYPHEN]: '_',
            [NameTransformSymbol.SLASH]: '__'
        };
        const EncodedNameTransformMap = {
            [NameTransformMap[NameTransformSymbol.AT]]: NameTransformSymbol.AT,
            [NameTransformMap[NameTransformSymbol.HYPHEN]]: NameTransformSymbol.HYPHEN,
            [NameTransformMap[NameTransformSymbol.SLASH]]: NameTransformSymbol.SLASH
        };
        const SEPARATOR = ':';
        const ManifestFileName = 'mf-manifest.json';
        const StatsFileName = 'mf-stats.json';
        const MFModuleType = {
            NPM: 'npm',
            APP: 'app'
        };
        const MODULE_DEVTOOL_IDENTIFIER = '__MF_DEVTOOLS_MODULE_INFO__';
        const ENCODE_NAME_PREFIX = 'ENCODE_NAME_PREFIX';
        const TEMP_DIR = '.federation';
        const MFPrefetchCommon = {
            identifier: 'MFDataPrefetch',
            globalKey: '__PREFETCH__',
            library: 'mf-data-prefetch',
            exportsKey: '__PREFETCH_EXPORTS__',
            fileName: 'bootstrap.js'
        };
        var ContainerPlugin = /*#__PURE__*/ Object.freeze({
            __proto__: null
        });
        var ContainerReferencePlugin = /*#__PURE__*/ Object.freeze({
            __proto__: null
        });
        var ModuleFederationPlugin = /*#__PURE__*/ Object.freeze({
            __proto__: null
        });
        var SharePlugin = /*#__PURE__*/ Object.freeze({
            __proto__: null
        });
        function isBrowserEnv() {
            return 'undefined' != typeof window;
        }
        function isBrowserDebug() {
            try {
                if (isBrowserEnv() && window.localStorage) return localStorage.getItem(BROWSER_LOG_KEY) === BROWSER_LOG_VALUE;
            } catch (error) {}
            return false;
        }
        function isDebugMode() {
            if ('undefined' != typeof process && process.env && process.env['FEDERATION_DEBUG']) return Boolean(process.env['FEDERATION_DEBUG']);
            if ('undefined' != typeof FEDERATION_DEBUG && Boolean(FEDERATION_DEBUG)) return true;
            return isBrowserDebug();
        }
        const getProcessEnv = function() {
            return 'undefined' != typeof process && process.env ? process.env : {};
        };
        const PREFIX = '[ Module Federation ]';
        function setDebug(loggerInstance) {
            if (isDebugMode()) loggerInstance.level = 'verbose';
        }
        function setPrefix(loggerInstance, prefix) {
            loggerInstance.labels = {
                warn: `${prefix} Warn`,
                error: `${prefix} Error`,
                success: `${prefix} Success`,
                info: `${prefix} Info`,
                ready: `${prefix} Ready`,
                debug: `${prefix} Debug`
            };
        }
        function createLogger(prefix) {
            const loggerInstance = isomorphicRslog.createLogger({
                labels: {
                    warn: `${PREFIX} Warn`,
                    error: `${PREFIX} Error`,
                    success: `${PREFIX} Success`,
                    info: `${PREFIX} Info`,
                    ready: `${PREFIX} Ready`,
                    debug: `${PREFIX} Debug`
                }
            });
            setDebug(loggerInstance);
            setPrefix(loggerInstance, prefix);
            return loggerInstance;
        }
        const logger = createLogger(PREFIX);
        const LOG_CATEGORY = '[ Federation Runtime ]';
        const parseEntry = (str, devVerOrUrl, separator = SEPARATOR)=>{
            const strSplit = str.split(separator);
            const devVersionOrUrl = 'development' === getProcessEnv()['NODE_ENV'] && devVerOrUrl;
            const defaultVersion = '*';
            const isEntry = (s)=>s.startsWith('http') || s.includes(MANIFEST_EXT);
            if (strSplit.length >= 2) {
                let [name1, ...versionOrEntryArr] = strSplit;
                if (str.startsWith(separator)) {
                    versionOrEntryArr = [
                        devVersionOrUrl || strSplit.slice(-1)[0]
                    ];
                    name1 = strSplit.slice(0, -1).join(separator);
                }
                let versionOrEntry = devVersionOrUrl || versionOrEntryArr.join(separator);
                if (isEntry(versionOrEntry)) return {
                    name: name1,
                    entry: versionOrEntry
                };
                return {
                    name: name1,
                    version: versionOrEntry || defaultVersion
                };
            }
            if (1 === strSplit.length) {
                const [name1] = strSplit;
                if (devVersionOrUrl && isEntry(devVersionOrUrl)) return {
                    name: name1,
                    entry: devVersionOrUrl
                };
                return {
                    name: name1,
                    version: devVersionOrUrl || defaultVersion
                };
            }
            throw `Invalid entry value: ${str}`;
        };
        const composeKeyWithSeparator = function(...args) {
            if (!args.length) return '';
            return args.reduce((sum, cur)=>{
                if (!cur) return sum;
                if (!sum) return cur;
                return `${sum}${SEPARATOR}${cur}`;
            }, '');
        };
        const encodeName = function(name1, prefix = '', withExt = false) {
            try {
                const ext = withExt ? '.js' : '';
                return `${prefix}${name1.replace(new RegExp(`${NameTransformSymbol.AT}`, 'g'), NameTransformMap[NameTransformSymbol.AT]).replace(new RegExp(`${NameTransformSymbol.HYPHEN}`, 'g'), NameTransformMap[NameTransformSymbol.HYPHEN]).replace(new RegExp(`${NameTransformSymbol.SLASH}`, 'g'), NameTransformMap[NameTransformSymbol.SLASH])}${ext}`;
            } catch (err) {
                throw err;
            }
        };
        const decodeName = function(name1, prefix, withExt) {
            try {
                let decodedName = name1;
                if (prefix) {
                    if (!decodedName.startsWith(prefix)) return decodedName;
                    decodedName = decodedName.replace(new RegExp(prefix, 'g'), '');
                }
                decodedName = decodedName.replace(new RegExp(`${NameTransformMap[NameTransformSymbol.AT]}`, 'g'), EncodedNameTransformMap[NameTransformMap[NameTransformSymbol.AT]]).replace(new RegExp(`${NameTransformMap[NameTransformSymbol.SLASH]}`, 'g'), EncodedNameTransformMap[NameTransformMap[NameTransformSymbol.SLASH]]).replace(new RegExp(`${NameTransformMap[NameTransformSymbol.HYPHEN]}`, 'g'), EncodedNameTransformMap[NameTransformMap[NameTransformSymbol.HYPHEN]]);
                if (withExt) decodedName = decodedName.replace('.js', '');
                return decodedName;
            } catch (err) {
                throw err;
            }
        };
        const generateExposeFilename = (exposeName, withExt)=>{
            if (!exposeName) return '';
            let expose = exposeName;
            if ('.' === expose) expose = 'default_export';
            if (expose.startsWith('./')) expose = expose.replace('./', '');
            return encodeName(expose, '__federation_expose_', withExt);
        };
        const generateShareFilename = (pkgName, withExt)=>{
            if (!pkgName) return '';
            return encodeName(pkgName, '__federation_shared_', withExt);
        };
        const getResourceUrl = (module, sourceUrl)=>{
            if ('getPublicPath' in module) {
                let publicPath;
                publicPath = module.getPublicPath.startsWith('function') ? new Function('return ' + module.getPublicPath)()() : new Function(module.getPublicPath)();
                return `${publicPath}${sourceUrl}`;
            }
            if ('publicPath' in module) return `${module.publicPath}${sourceUrl}`;
            console.warn('Cannot get resource URL. If in debug mode, please ignore.', module, sourceUrl);
            return '';
        };
        const assert = (condition, msg)=>{
            if (!condition) error(msg);
        };
        const error = (msg)=>{
            throw new Error(`${LOG_CATEGORY}: ${msg}`);
        };
        const warn = (msg)=>{
            console.warn(`${LOG_CATEGORY}: ${msg}`);
        };
        function safeToString(info) {
            try {
                return JSON.stringify(info, null, 2);
            } catch (e) {
                return '';
            }
        }
        const VERSION_PATTERN_REGEXP = /^([\d^=v<>~]|[*xX]$)/;
        function isRequiredVersion(str) {
            return VERSION_PATTERN_REGEXP.test(str);
        }
        const simpleJoinRemoteEntry = (rPath, rName)=>{
            if (!rPath) return rName;
            const transformPath = (str)=>{
                if ('.' === str) return '';
                if (str.startsWith('./')) return str.replace('./', '');
                if (str.startsWith('/')) {
                    const strWithoutSlash = str.slice(1);
                    if (strWithoutSlash.endsWith('/')) return strWithoutSlash.slice(0, -1);
                    return strWithoutSlash;
                }
                return str;
            };
            const transformedPath = transformPath(rPath);
            if (!transformedPath) return rName;
            if (transformedPath.endsWith('/')) return `${transformedPath}${rName}`;
            return `${transformedPath}/${rName}`;
        };
        function inferAutoPublicPath(url) {
            return url.replace(/#.*$/, '').replace(/\?.*$/, '').replace(/\/[^\/]+$/, '/');
        }
        function generateSnapshotFromManifest(manifest, options = {}) {
            var _manifest_metaData, _manifest_metaData1;
            const { remotes = {}, overrides = {}, version } = options;
            let remoteSnapshot;
            const getPublicPath = ()=>{
                if (!('publicPath' in manifest.metaData)) return manifest.metaData.getPublicPath;
                if ('auto' === manifest.metaData.publicPath && version) return inferAutoPublicPath(version);
                return manifest.metaData.publicPath;
            };
            const overridesKeys = Object.keys(overrides);
            let remotesInfo = {};
            if (!Object.keys(remotes).length) {
                var _manifest_remotes;
                remotesInfo = (null == (_manifest_remotes = manifest.remotes) ? void 0 : _manifest_remotes.reduce((res, next)=>{
                    let matchedVersion;
                    const name1 = next.federationContainerName;
                    matchedVersion = overridesKeys.includes(name1) ? overrides[name1] : 'version' in next ? next.version : next.entry;
                    res[name1] = {
                        matchedVersion
                    };
                    return res;
                }, {})) || {};
            }
            Object.keys(remotes).forEach((key)=>remotesInfo[key] = {
                    matchedVersion: overridesKeys.includes(key) ? overrides[key] : remotes[key]
                });
            const { remoteEntry: { path: remoteEntryPath, name: remoteEntryName, type: remoteEntryType }, types: remoteTypes, buildInfo: { buildVersion }, globalName, ssrRemoteEntry } = manifest.metaData;
            const { exposes } = manifest;
            let basicRemoteSnapshot = {
                version: version ? version : '',
                buildVersion,
                globalName,
                remoteEntry: simpleJoinRemoteEntry(remoteEntryPath, remoteEntryName),
                remoteEntryType,
                remoteTypes: simpleJoinRemoteEntry(remoteTypes.path, remoteTypes.name),
                remoteTypesZip: remoteTypes.zip || '',
                remoteTypesAPI: remoteTypes.api || '',
                remotesInfo,
                shared: null == manifest ? void 0 : manifest.shared.map((item)=>({
                        assets: item.assets,
                        sharedName: item.name,
                        version: item.version
                    })),
                modules: null == exposes ? void 0 : exposes.map((expose)=>({
                        moduleName: expose.name,
                        modulePath: expose.path,
                        assets: expose.assets
                    }))
            };
            if (null == (_manifest_metaData = manifest.metaData) ? void 0 : _manifest_metaData.prefetchInterface) {
                const prefetchInterface = manifest.metaData.prefetchInterface;
                basicRemoteSnapshot = polyfills._extends({}, basicRemoteSnapshot, {
                    prefetchInterface
                });
            }
            if (null == (_manifest_metaData1 = manifest.metaData) ? void 0 : _manifest_metaData1.prefetchEntry) {
                const { path, name: name1, type } = manifest.metaData.prefetchEntry;
                basicRemoteSnapshot = polyfills._extends({}, basicRemoteSnapshot, {
                    prefetchEntry: simpleJoinRemoteEntry(path, name1),
                    prefetchEntryType: type
                });
            }
            remoteSnapshot = 'publicPath' in manifest.metaData ? polyfills._extends({}, basicRemoteSnapshot, {
                publicPath: getPublicPath()
            }) : polyfills._extends({}, basicRemoteSnapshot, {
                getPublicPath: getPublicPath()
            });
            if (ssrRemoteEntry) {
                const fullSSRRemoteEntry = simpleJoinRemoteEntry(ssrRemoteEntry.path, ssrRemoteEntry.name);
                remoteSnapshot.ssrRemoteEntry = fullSSRRemoteEntry;
                remoteSnapshot.ssrRemoteEntryType = ssrRemoteEntry.type || 'commonjs-module';
            }
            return remoteSnapshot;
        }
        function isManifestProvider(moduleInfo) {
            if ('remoteEntry' in moduleInfo && moduleInfo.remoteEntry.includes(MANIFEST_EXT)) return true;
            return false;
        }
        async function safeWrapper(callback, disableWarn) {
            try {
                const res = await callback();
                return res;
            } catch (e) {
                disableWarn || warn(e);
                return;
            }
        }
        function isStaticResourcesEqual(url1, url2) {
            const REG_EXP = /^(https?:)?\/\//i;
            const relativeUrl1 = url1.replace(REG_EXP, '').replace(/\/$/, '');
            const relativeUrl2 = url2.replace(REG_EXP, '').replace(/\/$/, '');
            return relativeUrl1 === relativeUrl2;
        }
        function createScript(info) {
            let script = null;
            let needAttach = true;
            let timeout = 20000;
            let timeoutId;
            const scripts = document.getElementsByTagName("script");
            for(let i = 0; i < scripts.length; i++){
                const s = scripts[i];
                const scriptSrc = s.getAttribute('src');
                if (scriptSrc && isStaticResourcesEqual(scriptSrc, info.url)) {
                    script = s;
                    needAttach = false;
                    break;
                }
            }
            if (!script) {
                const attrs = info.attrs;
                script = document.createElement("script");
                script.type = (null == attrs ? void 0 : attrs['type']) === 'module' ? 'module' : "text/javascript";
                let createScriptRes;
                if (info.createScriptHook) {
                    createScriptRes = info.createScriptHook(info.url, info.attrs);
                    if (createScriptRes instanceof HTMLScriptElement) script = createScriptRes;
                    else if ('object' == typeof createScriptRes) {
                        if ("script" in createScriptRes && createScriptRes.script) script = createScriptRes.script;
                        if ('timeout' in createScriptRes && createScriptRes.timeout) timeout = createScriptRes.timeout;
                    }
                }
                if (!script.src) script.src = info.url;
                if (attrs && !createScriptRes) Object.keys(attrs).forEach((name1)=>{
                    if (script) {
                        if ('async' === name1 || 'defer' === name1) script[name1] = attrs[name1];
                        else if (!script.getAttribute(name1)) script.setAttribute(name1, attrs[name1]);
                    }
                });
            }
            const onScriptComplete = async (prev, event)=>{
                clearTimeout(timeoutId);
                const onScriptCompleteCallback = ()=>{
                    if ((null == event ? void 0 : event.type) === 'error') (null == info ? void 0 : info.onErrorCallback) && (null == info || info.onErrorCallback(event));
                    else (null == info ? void 0 : info.cb) && (null == info || info.cb());
                };
                if (script) {
                    script.onerror = null;
                    script.onload = null;
                    safeWrapper(()=>{
                        const { needDeleteScript = true } = info;
                        if (needDeleteScript) (null == script ? void 0 : script.parentNode) && script.parentNode.removeChild(script);
                    });
                    if (prev && 'function' == typeof prev) {
                        const result = prev(event);
                        if (result instanceof Promise) {
                            const res = await result;
                            onScriptCompleteCallback();
                            return res;
                        }
                        onScriptCompleteCallback();
                        return result;
                    }
                }
                onScriptCompleteCallback();
            };
            script.onerror = onScriptComplete.bind(null, script.onerror);
            script.onload = onScriptComplete.bind(null, script.onload);
            timeoutId = setTimeout(()=>{
                onScriptComplete(null, new Error(`Remote script "${info.url}" time-outed.`));
            }, timeout);
            return {
                script,
                needAttach
            };
        }
        function createLink(info) {
            let link = null;
            let needAttach = true;
            const links = document.getElementsByTagName('link');
            for(let i = 0; i < links.length; i++){
                const l = links[i];
                const linkHref = l.getAttribute('href');
                const linkRef = l.getAttribute('ref');
                if (linkHref && isStaticResourcesEqual(linkHref, info.url) && linkRef === info.attrs['ref']) {
                    link = l;
                    needAttach = false;
                    break;
                }
            }
            if (!link) {
                link = document.createElement('link');
                link.setAttribute('href', info.url);
                let createLinkRes;
                const attrs = info.attrs;
                if (info.createLinkHook) {
                    createLinkRes = info.createLinkHook(info.url, attrs);
                    if (createLinkRes instanceof HTMLLinkElement) link = createLinkRes;
                }
                if (attrs && !createLinkRes) Object.keys(attrs).forEach((name1)=>{
                    if (link && !link.getAttribute(name1)) link.setAttribute(name1, attrs[name1]);
                });
            }
            const onLinkComplete = (prev, event)=>{
                const onLinkCompleteCallback = ()=>{
                    if ((null == event ? void 0 : event.type) === 'error') (null == info ? void 0 : info.onErrorCallback) && (null == info || info.onErrorCallback(event));
                    else (null == info ? void 0 : info.cb) && (null == info || info.cb());
                };
                if (link) {
                    link.onerror = null;
                    link.onload = null;
                    safeWrapper(()=>{
                        const { needDeleteLink = true } = info;
                        if (needDeleteLink) (null == link ? void 0 : link.parentNode) && link.parentNode.removeChild(link);
                    });
                    if (prev) {
                        const res = prev(event);
                        onLinkCompleteCallback();
                        return res;
                    }
                }
                onLinkCompleteCallback();
            };
            link.onerror = onLinkComplete.bind(null, link.onerror);
            link.onload = onLinkComplete.bind(null, link.onload);
            return {
                link,
                needAttach
            };
        }
        function loadScript(url, info) {
            const { attrs = {}, createScriptHook } = info;
            return new Promise((resolve, reject)=>{
                const { script, needAttach } = createScript({
                    url,
                    cb: resolve,
                    onErrorCallback: reject,
                    attrs: polyfills._extends({
                        fetchpriority: 'high'
                    }, attrs),
                    createScriptHook,
                    needDeleteScript: true
                });
                needAttach && document.head.appendChild(script);
            });
        }
        function importNodeModule(name1) {
            if (!name1) throw new Error('import specifier is required');
            const importModule = new Function('name', "return import(name)");
            return importModule(name1).then((res)=>res).catch((error)=>{
                console.error(`Error importing module ${name1}:`, error);
                throw error;
            });
        }
        const loadNodeFetch = async ()=>{
            const fetchModule = await importNodeModule('node-fetch');
            return fetchModule.default || fetchModule;
        };
        const lazyLoaderHookFetch = async (input, init, loaderHook)=>{
            const hook = (url, init)=>loaderHook.lifecycle.fetch.emit(url, init);
            const res = await hook(input, init || {});
            if (!res || !(res instanceof Response)) {
                const fetchFunction = 'undefined' == typeof fetch ? await loadNodeFetch() : fetch;
                return fetchFunction(input, init || {});
            }
            return res;
        };
        function createScriptNode(url, cb, attrs, loaderHook) {
            if (null == loaderHook ? void 0 : loaderHook.createScriptHook) {
                const hookResult = loaderHook.createScriptHook(url);
                if (hookResult && 'object' == typeof hookResult && 'url' in hookResult) url = hookResult.url;
            }
            let urlObj;
            try {
                urlObj = new URL(url);
            } catch (e) {
                console.error('Error constructing URL:', e);
                cb(new Error(`Invalid URL: ${e}`));
                return;
            }
            const getFetch = async ()=>{
                if (null == loaderHook ? void 0 : loaderHook.fetch) return (input, init)=>lazyLoaderHookFetch(input, init, loaderHook);
                return 'undefined' == typeof fetch ? loadNodeFetch() : fetch;
            };
            const handleScriptFetch = async (f, urlObj)=>{
                try {
                    var _vm_constants;
                    const res = await f(urlObj.href);
                    const data = await res.text();
                    const [path, vm] = await Promise.all([
                        importNodeModule('path'),
                        importNodeModule('vm')
                    ]);
                    const scriptContext = {
                        exports: {},
                        module: {
                            exports: {}
                        }
                    };
                    const urlDirname = urlObj.pathname.split('/').slice(0, -1).join('/');
                    const filename = path.basename(urlObj.pathname);
                    var _vm_constants_USE_MAIN_CONTEXT_DEFAULT_LOADER;
                    const script = new vm.Script(`(function(exports, module, require, __dirname, __filename) {${data}\n})`, {
                        filename,
                        importModuleDynamically: null != (_vm_constants_USE_MAIN_CONTEXT_DEFAULT_LOADER = null == (_vm_constants = vm.constants) ? void 0 : _vm_constants.USE_MAIN_CONTEXT_DEFAULT_LOADER) ? _vm_constants_USE_MAIN_CONTEXT_DEFAULT_LOADER : importNodeModule
                    });
                    script.runInThisContext()(scriptContext.exports, scriptContext.module, eval('require'), urlDirname, filename);
                    const exportedInterface = scriptContext.module.exports || scriptContext.exports;
                    if (attrs && exportedInterface && attrs['globalName']) {
                        const container = exportedInterface[attrs['globalName']] || exportedInterface;
                        cb(void 0, container);
                        return;
                    }
                    cb(void 0, exportedInterface);
                } catch (e) {
                    cb(e instanceof Error ? e : new Error(`Script execution error: ${e}`));
                }
            };
            getFetch().then(async (f)=>{
                if ((null == attrs ? void 0 : attrs['type']) === 'esm' || (null == attrs ? void 0 : attrs['type']) === 'module') return loadModule(urlObj.href, {
                    fetch: f,
                    vm: await importNodeModule('vm')
                }).then(async (module)=>{
                    await module.evaluate();
                    cb(void 0, module.namespace);
                }).catch((e)=>{
                    cb(e instanceof Error ? e : new Error(`Script execution error: ${e}`));
                });
                handleScriptFetch(f, urlObj);
            }).catch((err)=>{
                cb(err);
            });
        }
        function loadScriptNode(url, info) {
            return new Promise((resolve, reject)=>{
                createScriptNode(url, (error, scriptContext)=>{
                    if (error) reject(error);
                    else {
                        var _info_attrs, _info_attrs1;
                        const remoteEntryKey = (null == info ? void 0 : null == (_info_attrs = info.attrs) ? void 0 : _info_attrs['globalName']) || `__FEDERATION_${null == info ? void 0 : null == (_info_attrs1 = info.attrs) ? void 0 : _info_attrs1['name']}:custom__`;
                        const entryExports = globalThis[remoteEntryKey] = scriptContext;
                        resolve(entryExports);
                    }
                }, info.attrs, info.loaderHook);
            });
        }
        async function loadModule(url, options) {
            const { fetch: fetch1, vm } = options;
            const response = await fetch1(url);
            const code = await response.text();
            const module = new vm.SourceTextModule(code, {
                importModuleDynamically: async (specifier, script)=>{
                    const resolvedUrl = new URL(specifier, url).href;
                    return loadModule(resolvedUrl, options);
                }
            });
            await module.link(async (specifier)=>{
                const resolvedUrl = new URL(specifier, url).href;
                const module = await loadModule(resolvedUrl, options);
                return module;
            });
            return module;
        }
        function normalizeOptions(enableDefault, defaultOptions, key) {
            return function(options) {
                if (false === options) return false;
                if (void 0 === options) if (enableDefault) return defaultOptions;
                else return false;
                if (true === options) return defaultOptions;
                if (options && 'object' == typeof options) return polyfills._extends({}, defaultOptions, options);
                throw new Error(`Unexpected type for \`${key}\`, expect boolean/undefined/object, got: ${typeof options}`);
            };
        }
        exports.BROWSER_LOG_KEY = BROWSER_LOG_KEY;
        exports.BROWSER_LOG_VALUE = BROWSER_LOG_VALUE;
        exports.ENCODE_NAME_PREFIX = ENCODE_NAME_PREFIX;
        exports.EncodedNameTransformMap = EncodedNameTransformMap;
        exports.FederationModuleManifest = FederationModuleManifest;
        exports.MANIFEST_EXT = MANIFEST_EXT;
        exports.MFModuleType = MFModuleType;
        exports.MFPrefetchCommon = MFPrefetchCommon;
        exports.MODULE_DEVTOOL_IDENTIFIER = MODULE_DEVTOOL_IDENTIFIER;
        exports.ManifestFileName = ManifestFileName;
        exports.NameTransformMap = NameTransformMap;
        exports.NameTransformSymbol = NameTransformSymbol;
        exports.SEPARATOR = SEPARATOR;
        exports.StatsFileName = StatsFileName;
        exports.TEMP_DIR = TEMP_DIR;
        exports.assert = assert;
        exports.composeKeyWithSeparator = composeKeyWithSeparator;
        exports.containerPlugin = ContainerPlugin;
        exports.containerReferencePlugin = ContainerReferencePlugin;
        exports.createLink = createLink;
        exports.createLogger = createLogger;
        exports.createScript = createScript;
        exports.createScriptNode = createScriptNode;
        exports.decodeName = decodeName;
        exports.encodeName = encodeName;
        exports.error = error;
        exports.generateExposeFilename = generateExposeFilename;
        exports.generateShareFilename = generateShareFilename;
        exports.generateSnapshotFromManifest = generateSnapshotFromManifest;
        exports.getProcessEnv = getProcessEnv;
        exports.getResourceUrl = getResourceUrl;
        exports.inferAutoPublicPath = inferAutoPublicPath;
        exports.isBrowserEnv = isBrowserEnv;
        exports.isDebugMode = isDebugMode;
        exports.isManifestProvider = isManifestProvider;
        exports.isRequiredVersion = isRequiredVersion;
        exports.isStaticResourcesEqual = isStaticResourcesEqual;
        exports.loadScript = loadScript;
        exports.loadScriptNode = loadScriptNode;
        exports.logger = logger;
        exports.moduleFederationPlugin = ModuleFederationPlugin;
        exports.normalizeOptions = normalizeOptions;
        exports.parseEntry = parseEntry;
        exports.safeToString = safeToString;
        exports.safeWrapper = safeWrapper;
        exports.sharePlugin = SharePlugin;
        exports.simpleJoinRemoteEntry = simpleJoinRemoteEntry;
        exports.warn = warn;
    },
    "../../node_modules/.pnpm/@module-federation+sdk@0.8.12/node_modules/@module-federation/sdk/dist/polyfills.cjs.js": function(__unused_webpack_module, exports) {
        function _extends() {
            _extends = Object.assign || function(target) {
                for(var i = 1; i < arguments.length; i++){
                    var source = arguments[i];
                    for(var key in source)if (Object.prototype.hasOwnProperty.call(source, key)) target[key] = source[key];
                }
                return target;
            };
            return _extends.apply(this, arguments);
        }
        exports._extends = _extends;
    },
    "../../node_modules/.pnpm/dayjs@1.11.19/node_modules/dayjs/dayjs.min.js": function(module) {
        !function(t, e) {
            module.exports = e();
        }(0, function() {
            "use strict";
            var t = 1e3, e = 6e4, n = 36e5, r = "millisecond", i = "second", s = "minute", u = "hour", a = "day", o = "week", c = "month", f = "quarter", h = "year", d = "date", l = "Invalid Date", $ = /^(\d{4})[-/]?(\d{1,2})?[-/]?(\d{0,2})[Tt\s]*(\d{1,2})?:?(\d{1,2})?:?(\d{1,2})?[.:]?(\d+)?$/, y = /\[([^\]]+)]|Y{1,4}|M{1,4}|D{1,2}|d{1,4}|H{1,2}|h{1,2}|a|A|m{1,2}|s{1,2}|Z{1,2}|SSS/g, M = {
                name: "en",
                weekdays: "Sunday_Monday_Tuesday_Wednesday_Thursday_Friday_Saturday".split("_"),
                months: "January_February_March_April_May_June_July_August_September_October_November_December".split("_"),
                ordinal: function(t) {
                    var e = [
                        "th",
                        "st",
                        "nd",
                        "rd"
                    ], n = t % 100;
                    return "[" + t + (e[(n - 20) % 10] || e[n] || e[0]) + "]";
                }
            }, m = function(t, e, n) {
                var r = String(t);
                return !r || r.length >= e ? t : "" + Array(e + 1 - r.length).join(n) + t;
            }, v = {
                s: m,
                z: function(t) {
                    var e = -t.utcOffset(), n = Math.abs(e), r = Math.floor(n / 60), i = n % 60;
                    return (e <= 0 ? "+" : "-") + m(r, 2, "0") + ":" + m(i, 2, "0");
                },
                m: function t(e, n) {
                    if (e.date() < n.date()) return -t(n, e);
                    var r = 12 * (n.year() - e.year()) + (n.month() - e.month()), i = e.clone().add(r, c), s = n - i < 0, u = e.clone().add(r + (s ? -1 : 1), c);
                    return +(-(r + (n - i) / (s ? i - u : u - i)) || 0);
                },
                a: function(t) {
                    return t < 0 ? Math.ceil(t) || 0 : Math.floor(t);
                },
                p: function(t) {
                    return ({
                        M: c,
                        y: h,
                        w: o,
                        d: a,
                        D: d,
                        h: u,
                        m: s,
                        s: i,
                        ms: r,
                        Q: f
                    })[t] || String(t || "").toLowerCase().replace(/s$/, "");
                },
                u: function(t) {
                    return void 0 === t;
                }
            }, g = "en", D = {};
            D[g] = M;
            var p = "$isDayjsObject", S = function(t) {
                return t instanceof _ || !(!t || !t[p]);
            }, w = function t(e, n, r) {
                var i;
                if (!e) return g;
                if ("string" == typeof e) {
                    var s = e.toLowerCase();
                    D[s] && (i = s), n && (D[s] = n, i = s);
                    var u = e.split("-");
                    if (!i && u.length > 1) return t(u[0]);
                } else {
                    var a = e.name;
                    D[a] = e, i = a;
                }
                return !r && i && (g = i), i || !r && g;
            }, O = function(t, e) {
                if (S(t)) return t.clone();
                var n = "object" == typeof e ? e : {};
                return n.date = t, n.args = arguments, new _(n);
            }, b = v;
            b.l = w, b.i = S, b.w = function(t, e) {
                return O(t, {
                    locale: e.$L,
                    utc: e.$u,
                    x: e.$x,
                    $offset: e.$offset
                });
            };
            var _ = function() {
                function M(t) {
                    this.$L = w(t.locale, null, !0), this.parse(t), this.$x = this.$x || t.x || {}, this[p] = !0;
                }
                var m = M.prototype;
                return m.parse = function(t) {
                    this.$d = function(t) {
                        var e = t.date, n = t.utc;
                        if (null === e) return new Date(NaN);
                        if (b.u(e)) return new Date;
                        if (e instanceof Date) return new Date(e);
                        if ("string" == typeof e && !/Z$/i.test(e)) {
                            var r = e.match($);
                            if (r) {
                                var i = r[2] - 1 || 0, s = (r[7] || "0").substring(0, 3);
                                return n ? new Date(Date.UTC(r[1], i, r[3] || 1, r[4] || 0, r[5] || 0, r[6] || 0, s)) : new Date(r[1], i, r[3] || 1, r[4] || 0, r[5] || 0, r[6] || 0, s);
                            }
                        }
                        return new Date(e);
                    }(t), this.init();
                }, m.init = function() {
                    var t = this.$d;
                    this.$y = t.getFullYear(), this.$M = t.getMonth(), this.$D = t.getDate(), this.$W = t.getDay(), this.$H = t.getHours(), this.$m = t.getMinutes(), this.$s = t.getSeconds(), this.$ms = t.getMilliseconds();
                }, m.$utils = function() {
                    return b;
                }, m.isValid = function() {
                    return this.$d.toString() !== l;
                }, m.isSame = function(t, e) {
                    var n = O(t);
                    return this.startOf(e) <= n && n <= this.endOf(e);
                }, m.isAfter = function(t, e) {
                    return O(t) < this.startOf(e);
                }, m.isBefore = function(t, e) {
                    return this.endOf(e) < O(t);
                }, m.$g = function(t, e, n) {
                    return b.u(t) ? this[e] : this.set(n, t);
                }, m.unix = function() {
                    return Math.floor(this.valueOf() / 1e3);
                }, m.valueOf = function() {
                    return this.$d.getTime();
                }, m.startOf = function(t, e) {
                    var n = this, r = !!b.u(e) || e, f = b.p(t), l = function(t, e) {
                        var i = b.w(n.$u ? Date.UTC(n.$y, e, t) : new Date(n.$y, e, t), n);
                        return r ? i : i.endOf(a);
                    }, $ = function(t, e) {
                        return b.w(n.toDate()[t].apply(n.toDate("s"), (r ? [
                            0,
                            0,
                            0,
                            0
                        ] : [
                            23,
                            59,
                            59,
                            999
                        ]).slice(e)), n);
                    }, y = this.$W, M = this.$M, m = this.$D, v = "set" + (this.$u ? "UTC" : "");
                    switch(f){
                        case h:
                            return r ? l(1, 0) : l(31, 11);
                        case c:
                            return r ? l(1, M) : l(0, M + 1);
                        case o:
                            var g = this.$locale().weekStart || 0, D = (y < g ? y + 7 : y) - g;
                            return l(r ? m - D : m + (6 - D), M);
                        case a:
                        case d:
                            return $(v + "Hours", 0);
                        case u:
                            return $(v + "Minutes", 1);
                        case s:
                            return $(v + "Seconds", 2);
                        case i:
                            return $(v + "Milliseconds", 3);
                        default:
                            return this.clone();
                    }
                }, m.endOf = function(t) {
                    return this.startOf(t, !1);
                }, m.$set = function(t, e) {
                    var n, o = b.p(t), f = "set" + (this.$u ? "UTC" : ""), l = (n = {}, n[a] = f + "Date", n[d] = f + "Date", n[c] = f + "Month", n[h] = f + "FullYear", n[u] = f + "Hours", n[s] = f + "Minutes", n[i] = f + "Seconds", n[r] = f + "Milliseconds", n)[o], $ = o === a ? this.$D + (e - this.$W) : e;
                    if (o === c || o === h) {
                        var y = this.clone().set(d, 1);
                        y.$d[l]($), y.init(), this.$d = y.set(d, Math.min(this.$D, y.daysInMonth())).$d;
                    } else l && this.$d[l]($);
                    return this.init(), this;
                }, m.set = function(t, e) {
                    return this.clone().$set(t, e);
                }, m.get = function(t) {
                    return this[b.p(t)]();
                }, m.add = function(r, f) {
                    var d, l = this;
                    r = Number(r);
                    var $ = b.p(f), y = function(t) {
                        var e = O(l);
                        return b.w(e.date(e.date() + Math.round(t * r)), l);
                    };
                    if ($ === c) return this.set(c, this.$M + r);
                    if ($ === h) return this.set(h, this.$y + r);
                    if ($ === a) return y(1);
                    if ($ === o) return y(7);
                    var M = (d = {}, d[s] = e, d[u] = n, d[i] = t, d)[$] || 1, m = this.$d.getTime() + r * M;
                    return b.w(m, this);
                }, m.subtract = function(t, e) {
                    return this.add(-1 * t, e);
                }, m.format = function(t) {
                    var e = this, n = this.$locale();
                    if (!this.isValid()) return n.invalidDate || l;
                    var r = t || "YYYY-MM-DDTHH:mm:ssZ", i = b.z(this), s = this.$H, u = this.$m, a = this.$M, o = n.weekdays, c = n.months, f = n.meridiem, h = function(t, n, i, s) {
                        return t && (t[n] || t(e, r)) || i[n].slice(0, s);
                    }, d = function(t) {
                        return b.s(s % 12 || 12, t, "0");
                    }, $ = f || function(t, e, n) {
                        var r = t < 12 ? "AM" : "PM";
                        return n ? r.toLowerCase() : r;
                    };
                    return r.replace(y, function(t, r) {
                        return r || function(t) {
                            switch(t){
                                case "YY":
                                    return String(e.$y).slice(-2);
                                case "YYYY":
                                    return b.s(e.$y, 4, "0");
                                case "M":
                                    return a + 1;
                                case "MM":
                                    return b.s(a + 1, 2, "0");
                                case "MMM":
                                    return h(n.monthsShort, a, c, 3);
                                case "MMMM":
                                    return h(c, a);
                                case "D":
                                    return e.$D;
                                case "DD":
                                    return b.s(e.$D, 2, "0");
                                case "d":
                                    return String(e.$W);
                                case "dd":
                                    return h(n.weekdaysMin, e.$W, o, 2);
                                case "ddd":
                                    return h(n.weekdaysShort, e.$W, o, 3);
                                case "dddd":
                                    return o[e.$W];
                                case "H":
                                    return String(s);
                                case "HH":
                                    return b.s(s, 2, "0");
                                case "h":
                                    return d(1);
                                case "hh":
                                    return d(2);
                                case "a":
                                    return $(s, u, !0);
                                case "A":
                                    return $(s, u, !1);
                                case "m":
                                    return String(u);
                                case "mm":
                                    return b.s(u, 2, "0");
                                case "s":
                                    return String(e.$s);
                                case "ss":
                                    return b.s(e.$s, 2, "0");
                                case "SSS":
                                    return b.s(e.$ms, 3, "0");
                                case "Z":
                                    return i;
                            }
                            return null;
                        }(t) || i.replace(":", "");
                    });
                }, m.utcOffset = function() {
                    return 15 * -Math.round(this.$d.getTimezoneOffset() / 15);
                }, m.diff = function(r, d, l) {
                    var $, y = this, M = b.p(d), m = O(r), v = (m.utcOffset() - this.utcOffset()) * e, g = this - m, D = function() {
                        return b.m(y, m);
                    };
                    switch(M){
                        case h:
                            $ = D() / 12;
                            break;
                        case c:
                            $ = D();
                            break;
                        case f:
                            $ = D() / 3;
                            break;
                        case o:
                            $ = (g - v) / 6048e5;
                            break;
                        case a:
                            $ = (g - v) / 864e5;
                            break;
                        case u:
                            $ = g / n;
                            break;
                        case s:
                            $ = g / e;
                            break;
                        case i:
                            $ = g / t;
                            break;
                        default:
                            $ = g;
                    }
                    return l ? $ : b.a($);
                }, m.daysInMonth = function() {
                    return this.endOf(c).$D;
                }, m.$locale = function() {
                    return D[this.$L];
                }, m.locale = function(t, e) {
                    if (!t) return this.$L;
                    var n = this.clone(), r = w(t, e, !0);
                    return r && (n.$L = r), n;
                }, m.clone = function() {
                    return b.w(this.$d, this);
                }, m.toDate = function() {
                    return new Date(this.valueOf());
                }, m.toJSON = function() {
                    return this.isValid() ? this.toISOString() : null;
                }, m.toISOString = function() {
                    return this.$d.toISOString();
                }, m.toString = function() {
                    return this.$d.toUTCString();
                }, M;
            }(), k = _.prototype;
            return O.prototype = k, [
                [
                    "$ms",
                    r
                ],
                [
                    "$s",
                    i
                ],
                [
                    "$m",
                    s
                ],
                [
                    "$H",
                    u
                ],
                [
                    "$W",
                    a
                ],
                [
                    "$M",
                    c
                ],
                [
                    "$y",
                    h
                ],
                [
                    "$D",
                    d
                ]
            ].forEach(function(t) {
                k[t[1]] = function(e) {
                    return this.$g(e, t[0], t[1]);
                };
            }), O.extend = function(t, e) {
                return t.$i || (t(e, _, O), t.$i = !0), O;
            }, O.locale = w, O.isDayjs = S, O.unix = function(t) {
                return O(1e3 * t);
            }, O.en = D[g], O.Ls = D, O.p = {}, O;
        });
    },
    "../../node_modules/.pnpm/@module-federation+enhanced@0.8.12_@rspack+core@1.7.0_react-dom@18.3.1_react@18.3.1_typescript@5.9.3_webpack@5.104.1/node_modules/@module-federation/enhanced/dist/src/runtime.js": function(__unused_webpack_module, exports, __webpack_require__) {
        var __createBinding = this && this.__createBinding || (Object.create ? function(o, m, k, k2) {
            if (void 0 === k2) k2 = k;
            var desc = Object.getOwnPropertyDescriptor(m, k);
            if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) desc = {
                enumerable: true,
                get: function() {
                    return m[k];
                }
            };
            Object.defineProperty(o, k2, desc);
        } : function(o, m, k, k2) {
            if (void 0 === k2) k2 = k;
            o[k2] = m[k];
        });
        var __exportStar = this && this.__exportStar || function(m, exports) {
            for(var p in m)if ("default" !== p && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
        };
        Object.defineProperty(exports, "__esModule", {
            value: true
        });
        __exportStar(__webpack_require__("../../node_modules/.pnpm/@module-federation+runtime-tools@0.8.12/node_modules/@module-federation/runtime-tools/dist/runtime.cjs.js"), exports);
    },
    "../../node_modules/.pnpm/isomorphic-rslog@0.0.7/node_modules/isomorphic-rslog/dist/browser/index.cjs": function(module) {
        var __defProp = Object.defineProperty;
        var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
        var __getOwnPropNames = Object.getOwnPropertyNames;
        var __hasOwnProp = Object.prototype.hasOwnProperty;
        var __export = (target, all)=>{
            for(var name1 in all)__defProp(target, name1, {
                get: all[name1],
                enumerable: true
            });
        };
        var __copyProps = (to, from, except, desc)=>{
            if (from && "object" == typeof from || "function" == typeof from) {
                for (let key of __getOwnPropNames(from))if (!__hasOwnProp.call(to, key) && key !== except) __defProp(to, key, {
                    get: ()=>from[key],
                    enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable
                });
            }
            return to;
        };
        var __toCommonJS = (mod)=>__copyProps(__defProp({}, "__esModule", {
                value: true
            }), mod);
        var browser_exports = {};
        __export(browser_exports, {
            createLogger: ()=>createLogger2,
            logger: ()=>logger
        });
        module.exports = __toCommonJS(browser_exports);
        var supportsSubstitutions = void 0;
        var supportColor = ()=>{
            if (void 0 !== supportsSubstitutions) return supportsSubstitutions;
            const originalConsoleLog = console.log;
            try {
                const testString = "color test";
                const css = "color: red;";
                supportsSubstitutions = false;
                console.log = (...args)=>{
                    if (args[0] === `%c${testString}` && args[1] === css) supportsSubstitutions = true;
                };
                console.log(`%c${testString}`, css);
            } catch (e) {
                supportsSubstitutions = false;
            } finally{
                console.log = originalConsoleLog;
            }
            return supportsSubstitutions;
        };
        var ansiToCss = {
            bold: "font-weight: bold;",
            red: "color: red;",
            green: "color: green;",
            orange: "color: orange;",
            dodgerblue: "color: dodgerblue;",
            magenta: "color: magenta;",
            gray: "color: gray;"
        };
        var formatter = (key)=>supportColor() ? (input)=>{
                if (Array.isArray(input)) {
                    const [label, style] = input;
                    return [
                        `%c${label.replace("%c", "")}`,
                        style ? `${ansiToCss[key]}${style}` : `${ansiToCss[key] || ""}`
                    ];
                }
                return [
                    `%c${String(input).replace("%c", "")}`,
                    ansiToCss[key] || ""
                ];
            } : (input)=>[
                    String(input)
                ];
        var bold = formatter("bold");
        var red = formatter("red");
        var green = formatter("green");
        var orange = formatter("orange");
        var dodgerblue = formatter("dodgerblue");
        var magenta = formatter("magenta");
        formatter("gray");
        function getLabel(type, logType, labels) {
            let label = [
                ""
            ];
            if ("label" in logType) {
                const labelText = "log" !== type ? labels[type] : void 0;
                label = [
                    labelText || logType.label || ""
                ];
                if (logType.color) {
                    const colorResult = logType.color(label[0]);
                    label = Array.isArray(colorResult) && 2 === colorResult.length ? bold([
                        colorResult[0],
                        colorResult[1]
                    ]) : bold(colorResult[0] || "");
                } else label = bold(label[0]);
            }
            label = label.filter(Boolean);
            return label;
        }
        function finalLog(label, text, args, message) {
            if (label.length) if (Array.isArray(message)) console.log(...label, ...message, ...args);
            else console.log(...label, text, ...args);
            else Array.isArray(message) ? console.log(...message) : console.log(text, ...args);
        }
        var LOG_LEVEL = {
            error: 0,
            warn: 1,
            info: 2,
            log: 3,
            verbose: 4
        };
        var errorStackRegExp = /at\s.*:\d+:\d+[\s\)]*$/;
        var anonymousErrorStackRegExp = /at\s.*\(<anonymous>\)$/;
        var isErrorStackMessage = (message)=>errorStackRegExp.test(message) || anonymousErrorStackRegExp.test(message);
        function validateOptions(options) {
            const validatedOptions = {
                ...options
            };
            if (options.labels && "object" != typeof options.labels) throw new Error("Labels must be an object");
            if (options.level && "string" != typeof options.level) throw new Error("Level must be a string");
            return validatedOptions;
        }
        var createLogger = (options = {}, { getLabel: getLabel2, handleError, finalLog: finalLog2, greet, LOG_TYPES: LOG_TYPES2 })=>{
            const validatedOptions = validateOptions(options);
            let maxLevel = validatedOptions.level || "log";
            let customLabels = validatedOptions.labels || {};
            let log = (type, message, ...args)=>{
                if (LOG_LEVEL[LOG_TYPES2[type].level] > LOG_LEVEL[maxLevel]) return;
                if (null == message) return console.log();
                let logType = LOG_TYPES2[type];
                let text = "";
                const label = getLabel2(type, logType, customLabels);
                if (message instanceof Error) if (message.stack) {
                    let [name1, ...rest] = message.stack.split("\n");
                    if (name1.startsWith("Error: ")) name1 = name1.slice(7);
                    text = `${name1}
${handleError(rest.join("\n"))}`;
                } else text = message.message;
                else if ("error" === logType.level && "string" == typeof message) {
                    let lines = message.split("\n");
                    text = lines.map((line)=>isErrorStackMessage(line) ? handleError(line) : line).join("\n");
                } else text = `${message}`;
                finalLog2(label, text, args, message);
            };
            let logger2 = {
                greet: (message)=>log("log", greet(message))
            };
            Object.keys(LOG_TYPES2).forEach((key)=>{
                logger2[key] = (...args)=>log(key, ...args);
            });
            Object.defineProperty(logger2, "level", {
                get: ()=>maxLevel,
                set (val) {
                    maxLevel = val;
                }
            });
            Object.defineProperty(logger2, "labels", {
                get: ()=>customLabels,
                set (val) {
                    customLabels = val;
                }
            });
            logger2.override = (customLogger)=>{
                Object.assign(logger2, customLogger);
            };
            return logger2;
        };
        var startColor = [
            189,
            255,
            243
        ];
        var endColor = [
            74,
            194,
            154
        ];
        var isWord = (char)=>!/[\s\n]/.test(char);
        function gradient(message) {
            if (!supportColor()) return [
                message
            ];
            const chars = [
                ...message
            ];
            const words = chars.filter(isWord);
            const steps = words.length - 1;
            if (0 === steps) {
                console.log(`%c${message}`, `color: rgb(${startColor.join(",")}); font-weight: bold;`);
                return [
                    message
                ];
            }
            let output = "";
            let styles = [];
            chars.forEach((char)=>{
                if (isWord(char)) {
                    const progress = words.indexOf(char) / steps;
                    const r = Math.round(startColor[0] + (endColor[0] - startColor[0]) * progress);
                    const g = Math.round(startColor[1] + (endColor[1] - startColor[1]) * progress);
                    const b = Math.round(startColor[2] + (endColor[2] - startColor[2]) * progress);
                    output += `%c${char}`;
                    styles.push(`color: rgb(${r},${g},${b}); font-weight: bold;`);
                } else output += char;
            });
            return [
                output,
                ...styles
            ];
        }
        var LOG_TYPES = {
            error: {
                label: "error",
                level: "error",
                color: red
            },
            warn: {
                label: "warn",
                level: "warn",
                color: orange
            },
            info: {
                label: "info",
                level: "info",
                color: dodgerblue
            },
            start: {
                label: "start",
                level: "info",
                color: dodgerblue
            },
            ready: {
                label: "ready",
                level: "info",
                color: green
            },
            success: {
                label: "success",
                level: "info",
                color: green
            },
            log: {
                level: "log"
            },
            debug: {
                label: "debug",
                level: "verbose",
                color: magenta
            }
        };
        function createLogger2(options = {}) {
            return createLogger(options, {
                handleError: (msg)=>msg,
                getLabel,
                gradient,
                finalLog,
                LOG_TYPES,
                greet: (msg)=>gradient(msg)
            });
        }
        var logger = createLogger2();
    }
};
var __webpack_module_cache__ = {};
function __webpack_require__(moduleId) {
    var cachedModule = __webpack_module_cache__[moduleId];
    if (void 0 !== cachedModule) return cachedModule.exports;
    var module = __webpack_module_cache__[moduleId] = {
        exports: {}
    };
    __webpack_modules__[moduleId].call(module.exports, module, module.exports, __webpack_require__);
    return module.exports;
}
(()=>{
    __webpack_require__.n = (module)=>{
        var getter = module && module.__esModule ? ()=>module['default'] : ()=>module;
        __webpack_require__.d(getter, {
            a: getter
        });
        return getter;
    };
})();
(()=>{
    __webpack_require__.d = (exports, definition)=>{
        for(var key in definition)if (__webpack_require__.o(definition, key) && !__webpack_require__.o(exports, key)) Object.defineProperty(exports, key, {
            enumerable: true,
            get: definition[key]
        });
    };
})();
(()=>{
    __webpack_require__.g = (()=>{
        if ('object' == typeof globalThis) return globalThis;
        try {
            return this || new Function('return this')();
        } catch (e) {
            if ('object' == typeof window) return window;
        }
    })();
})();
(()=>{
    __webpack_require__.o = (obj, prop)=>Object.prototype.hasOwnProperty.call(obj, prop);
})();
var dayjs_min = __webpack_require__("../../node_modules/.pnpm/dayjs@1.11.19/node_modules/dayjs/dayjs.min.js");
var dayjs_min_default = /*#__PURE__*/ __webpack_require__.n(dayjs_min);
var logger_LYLogLevel = /*#__PURE__*/ function(LYLogLevel) {
    LYLogLevel[LYLogLevel["NONE"] = 0] = "NONE";
    LYLogLevel[LYLogLevel["ERROR"] = 1] = "ERROR";
    LYLogLevel[LYLogLevel["WARN"] = 2] = "WARN";
    LYLogLevel[LYLogLevel["INFO"] = 3] = "INFO";
    LYLogLevel[LYLogLevel["DEBUG"] = 4] = "DEBUG";
    return LYLogLevel;
}({});
const levelToString = {
    [0]: 'none',
    [1]: 'error',
    [2]: 'warn',
    [3]: 'info',
    [4]: 'debug'
};
class LYDefaultLogFormatter {
    format(level, namespace, args) {
        return `[${namespace}] ${this.formatArgs(args)}`;
    }
    formatArgs(args) {
        return args.map((arg)=>{
            if (arg instanceof Error) return `${arg.name}: ${arg.message}\n${arg.stack}`;
            if ('object' == typeof arg) return JSON.stringify(arg, (key, value)=>{
                if (value instanceof Error) return {
                    name: value.name,
                    message: value.message,
                    stack: value.stack
                };
                return value;
            });
            return String(arg);
        }).join(' ');
    }
}
class LYIndexedDBLogStorage {
    constructor(){
        this._maxLogs = 10000;
        this._logBuffer = [];
        this._bufferSize = 100;
        this._flushInterval = 5000;
        this._isFlushing = false;
        this._printToConsole = false;
        this.init();
    }
    get printToConsole() {
        return this._printToConsole;
    }
    set printToConsole(value) {
        this._printToConsole = value;
    }
    async init() {
        try {
            this._db = await openDB('ly-db', 1, {
                upgrade (db) {
                    const store = db.createObjectStore('logs', {
                        keyPath: 'id'
                    });
                    store.createIndex('by-level', 'level');
                    store.createIndex('by-timestamp', 'timestamp');
                }
            });
            setInterval(()=>this.flushBuffer(), this._flushInterval);
        } catch (error) {
            console.error('IndexedDB 初始化失败:', error);
        }
    }
    generateId() {
        const timestamp = Date.now();
        const random = Math.random().toString(36).substring(2, 8);
        return `${timestamp}-${random}`;
    }
    getMicroTimestamp() {
        const now = performance.now();
        return Math.floor(1000 * now);
    }
    async write(level, message, meta) {
        try {
            if (this._printToConsole) {
                const method = level.toLowerCase();
                const consoleMethod = console[method] || console.log;
                consoleMethod(message);
                if (meta) consoleMethod(meta);
            }
            const logEntry = {
                id: this.generateId(),
                timestamp: this.getMicroTimestamp(),
                level,
                message,
                meta
            };
            this._logBuffer.push(logEntry);
            if (this._logBuffer.length >= this._bufferSize) await this.flushBuffer();
        } catch (error) {
            console.error('日志存储失败:', error);
        }
    }
    async flushBuffer() {
        if (!this._db) return;
        if (0 === this._logBuffer.length || this._isFlushing) return;
        this._isFlushing = true;
        const logsToFlush = [
            ...this._logBuffer
        ];
        try {
            this._logBuffer = [];
            const tx = this._db.transaction('logs', 'readwrite');
            for (const log of logsToFlush)await tx.store.add(log);
            await tx.done;
            await this.cleanupOldLogs();
        } catch (error) {
            console.error('日志刷新失败:', error);
            this._logBuffer = [
                ...this._logBuffer,
                ...logsToFlush
            ];
            if (this._logBuffer.length > this._maxLogs) this._logBuffer = this._logBuffer.slice(-this._maxLogs);
        } finally{
            this._isFlushing = false;
        }
    }
    async cleanupOldLogs() {
        const count = await this._db.count('logs');
        if (count > this._maxLogs) {
            const tx = this._db.transaction('logs', 'readwrite');
            const index = tx.store.index('by-timestamp');
            const cursor = await index.openCursor();
            let deleteCount = count - this._maxLogs;
            while(deleteCount > 0 && cursor){
                await cursor.delete();
                deleteCount--;
                await cursor.continue();
            }
        }
    }
    async getAllLogs() {
        const tx = this._db.transaction('logs', 'readonly');
        const store = tx.store;
        const logs = [];
        let cursor = await store.index('by-timestamp').openCursor();
        while(cursor){
            logs.push(cursor.value);
            cursor = await cursor.continue();
        }
        return logs;
    }
    async download(filename) {
        const logs = await this.getAllLogs();
        const content = logs.map((log)=>{
            const time = dayjs_min_default()(log.timestamp).format('YYYY-MM-DD HH:mm:ss.SSS');
            const level = log.level.toUpperCase().padEnd(5, ' ');
            return `${time} ${level} ${log.message}`;
        }).join('\n');
        const blob = new Blob([
            content
        ], {
            type: 'text/plain'
        });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${filename}.log`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }
}
let formatterImpl = new LYDefaultLogFormatter();
let storageImpl = new LYIndexedDBLogStorage();
if ('development' === process.env.NODE_ENV) storageImpl.printToConsole = true;
function setFormatter(formatter) {
    formatterImpl = formatter;
}
function setStorage(storage) {
    storageImpl = storage;
}
function setPrintToConsole(enabled) {
    storageImpl.printToConsole = enabled;
}
class LYLogger {
    constructor(namespace, level = 3){
        this._level = level;
        this._namespace = namespace;
    }
    get level() {
        return this._level;
    }
    setLevel(level) {
        this._level = level;
    }
    async log(level, ...args) {
        if (0 === this._level || level > this._level) return;
        try {
            const levelStr = levelToString[level];
            const message = formatterImpl.format(levelStr, this._namespace, args);
            await storageImpl.write(levelStr, message);
        } catch (error) {
            console.error('日志记录失败:', error);
        }
    }
    error(...args) {
        this.log(1, ...args);
    }
    warn(...args) {
        this.log(2, ...args);
    }
    info(...args) {
        this.log(3, ...args);
    }
    debug(...args) {
        this.log(4, ...args);
    }
    async download() {
        await storageImpl.download(dayjs_min_default()().format('YYYY-MM-DD HH:mm:ss.SSS'));
    }
}
const logger = new LYLogger('LYLogger');
const classes = {};
events.EventEmitter.prototype.setMaxListeners(10000);
class LYObject extends events.EventEmitter {
    static{
        this._instances = new Map();
    }
    static registerClass(name1, Construct) {
        if (name1 in classes) throw new Error(`class ${name1} already register`);
        classes[name1] = {
            name: name1,
            Construct
        };
    }
    static autoRegister() {
        const className = this.name;
        if (!className || 'LYObject' === className) return;
        if (!(className in classes)) classes[className] = {
            name: className,
            Construct: this
        };
    }
    static getInstance(obj, ...args) {
        const className = 'string' != typeof obj ? LYObject.getClassName(obj) : obj;
        if (this._instances.has(className)) return this._instances.get(className);
        const ctor = this.getClass(className);
        const instance = new ctor(...args);
        this._instances.set(className, instance);
        return instance;
    }
    static getClassName(obj, def) {
        const Construct = 'function' == typeof obj ? obj : obj.constructor;
        const name1 = Object.keys(classes).find((k)=>classes[k].Construct === Construct);
        if (name1) return name1;
        const className = Construct.name;
        if (className && 'Object' !== className) {
            if (def) return def;
            LYObject.autoRegister();
            return className;
        }
        if (def) return def;
        throw new Error(`class ${Construct.name} not registered and cannot be auto-registered`);
    }
    static getClass(name1, def) {
        const Construct = classes[name1]?.Construct || def;
        if (!Construct) throw new Error(`class ${name1} not registered`);
        return Construct;
    }
    static getDerivedClasses(name1) {
        const Construct = 'string' == typeof name1 ? classes[name1]?.Construct : name1;
        if (!Construct) throw new Error(`class ${name1} not registered`);
        return Object.values(classes).reduce((previousValue, currentValue)=>{
            if (currentValue.Construct.prototype instanceof Construct) previousValue.push(currentValue.Construct);
            return previousValue;
        }, []);
    }
    static get classes() {
        return classes;
    }
    constructor(){
        super();
        LYObject.autoRegister();
        this._logger = new LYLogger(LYObject.getClassName(this));
    }
    get className() {
        return LYObject.getClassName(this);
    }
    is(className) {
        const Construct = LYObject.getClass(className);
        if (!Construct) return false;
        return this instanceof Construct;
    }
    get logger() {
        return this._logger;
    }
}
function register(name1) {
    return function(Construct) {
        LYObject.registerClass(name1, Construct);
    };
}
function wait(interval) {
    return new Promise((resolve)=>interval ? setTimeout(resolve, interval) : setTimeout(resolve, 0));
}
class LYError extends Error {
    constructor(message, code = 'UNKNOWN_ERROR', details){
        super(message);
        this.name = this.constructor.name;
        this._code = code;
        this._details = details;
        if (Error.captureStackTrace) Error.captureStackTrace(this, this.constructor);
    }
    get code() {
        return this._code;
    }
    get details() {
        return this._details;
    }
}
class LYCryptoError extends LYError {
    constructor(message, code = 'CRYPTO_ERROR', details){
        super(message, code, details);
    }
}
function _ts_decorate(decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : null === desc ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if ("object" == typeof Reflect && "function" == typeof Reflect.decorate) r = Reflect.decorate(decorators, target, key, desc);
    else for(var i = decorators.length - 1; i >= 0; i--)if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
}
function _ts_metadata(k, v) {
    if ("object" == typeof Reflect && "function" == typeof Reflect.metadata) return Reflect.metadata(k, v);
}
const REMOTE_ENTRY = 'remoteComponentEntry.js';
const REMOTE_MODULE = 'Index';
const envInstances = new Map();
class LYEnv extends LYObject {
    constructor(product){
        super(), this._isOem = false, this._brand = '';
        this._product = product;
        envInstances.set(this._product, this);
    }
    static getInstance(product) {
        return envInstances.get(product);
    }
    set(key, value) {
        this[key] = value;
        this.emit('change', key);
    }
    get(key, def) {
        return key in this ? this[key] : def;
    }
    has(key) {
        return key in this;
    }
    get version() {
        return this._version;
    }
    set version(value) {
        this._version = value;
    }
    get buildVersion() {
        return this._buildVersion;
    }
    set buildVersion(value) {
        this._buildVersion = value;
    }
    get isOem() {
        return this._isOem;
    }
    set isOem(value) {
        this._isOem = value;
    }
    get brand() {
        return this._brand;
    }
    set brand(value) {
        this._brand = value;
    }
    get product() {
        return this._product;
    }
    set product(value) {
        this._product = value;
    }
    get embedProduct() {
        return this._embedProduct;
    }
    set embedProduct(value) {
        this._embedProduct = value;
    }
    get baseUrl() {
        if (!this._baseUrl) return window.origin;
        return this._baseUrl;
    }
    set baseUrl(value) {
        this._baseUrl = value;
    }
    get isRemote() {
        return this._isRemote;
    }
    set isRemote(value) {
        this._isRemote = value;
    }
    get isIframe() {
        return isIframe;
    }
    get isElectron() {
        return isElectron;
    }
    get supportLanguages() {
        return this._supportLanguages;
    }
    set supportLanguages(value) {
        this._supportLanguages = value;
    }
}
LYEnv = _ts_decorate([
    register('LYEnv'),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        String
    ])
], LYEnv);
const isIframe = window.self !== window.top;
const isElectron = window.navigator.userAgent.indexOf('Electron') > -1;
function base_ts_decorate(decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : null === desc ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if ("object" == typeof Reflect && "function" == typeof Reflect.decorate) r = Reflect.decorate(decorators, target, key, desc);
    else for(var i = decorators.length - 1; i >= 0; i--)if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
}
const CONFIG_ELEMENT_ID = 'uci-config';
const METADATA_KEY = Symbol('LYBaseConfigModel');
function base_model(modelType) {
    return function(target, key) {
        if (!target[METADATA_KEY]) target[METADATA_KEY] = {};
        target[METADATA_KEY][key] = {
            type: 'model',
            modelType
        };
    };
}
function base_array(modelType) {
    return function(target, key) {
        if (!target[METADATA_KEY]) target[METADATA_KEY] = {};
        target[METADATA_KEY][key] = {
            type: 'list',
            modelType
        };
    };
}
function load(config, target) {
    Object.entries(config).forEach(([key, value])=>{
        if (null == value) return;
        const metadata = target[METADATA_KEY]?.[key];
        if (!metadata) {
            target[key] = value;
            return;
        }
        if ('model' === metadata.type) {
            if ('object' != typeof value || Array.isArray(value)) throw new Error(`${key} must be an object`);
            target[key] = new metadata.modelType();
            target[key].load(value);
        }
        if ('list' === metadata.type) {
            if (!Array.isArray(value)) throw new Error(`${key} must be an array`);
            target[key] = value.map((item)=>{
                const model = new metadata.modelType();
                model.load(item);
                return model;
            });
        }
        if ('object' === metadata.type) {
            if ('object' != typeof value || Array.isArray(value)) throw new Error(`${key} must be an object`);
            target[key] = Object.entries(value).reduce((acc, [key, value])=>{
                const model = new metadata.modelType();
                model.load(value);
                acc[key] = model;
                return acc;
            }, {});
        }
    });
}
class LYBaseConfigModel {
    clone() {
        return JSON.parse(JSON.stringify(this));
    }
    load(config) {
        load(config, this);
    }
}
class LYBaseConfig extends LYObject {
    static async load(config_url) {
        const instance = this.get();
        await instance.load(config_url);
        return instance;
    }
    static get() {
        return this.getInstance(this);
    }
    async _load_from_url(url) {
        const response = await axios.get(url);
        if (200 !== response.status) return false;
        if ('application/json' !== response.headers['content-type']) return false;
        if (!response.data) return false;
        const result = response.data;
        if ('success' !== result.code) return false;
        if (!result.data) return false;
        load(result.data, this);
        return true;
    }
    _load_from_element() {
        const configElement = document.getElementById(CONFIG_ELEMENT_ID);
        if (!configElement) return false;
        const configMode = configElement.getAttribute('mode');
        if ('none' === configMode) return false;
        let text = configElement.textContent;
        if (!text) throw new Error('Config element text content is empty');
        if ('base64' === configMode) text = atob(text);
        const config = JSON.parse(text);
        load(config, this);
        return true;
    }
    async load(config_url) {
        if (this._load_from_element()) return;
        const success = await this._load_from_url(config_url);
        if (!success) throw new Error(`Failed to load config from ${config_url}`);
    }
}
LYBaseConfig = base_ts_decorate([
    register('LYBaseConfig')
], LYBaseConfig);
function http_ts_decorate(decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : null === desc ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if ("object" == typeof Reflect && "function" == typeof Reflect.decorate) r = Reflect.decorate(decorators, target, key, desc);
    else for(var i = decorators.length - 1; i >= 0; i--)if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
}
function http_ts_metadata(k, v) {
    if ("object" == typeof Reflect && "function" == typeof Reflect.metadata) return Reflect.metadata(k, v);
}
class LYRetryWaitExponential extends LYBaseConfigModel {
    constructor(...args){
        super(...args), this.multiplier = 2, this.min = 1, this.max = 30;
    }
}
class LYHttpRetryConfig extends LYBaseConfigModel {
    constructor(...args){
        super(...args), this.timeoutPerRetry = 10, this.stopAfterDelay = 300, this.waitExponential = new LYRetryWaitExponential();
    }
}
http_ts_decorate([
    base_model(LYRetryWaitExponential),
    http_ts_metadata("design:type", void 0 === LYRetryWaitExponential ? Object : LYRetryWaitExponential)
], LYHttpRetryConfig.prototype, "waitExponential", void 0);
class LYHttpConfig extends LYBaseConfigModel {
    constructor(...args){
        super(...args), this.retry = new LYHttpRetryConfig();
    }
}
http_ts_decorate([
    base_model(LYHttpRetryConfig),
    http_ts_metadata("design:type", void 0 === LYHttpRetryConfig ? Object : LYHttpRetryConfig)
], LYHttpConfig.prototype, "retry", void 0);
class LYCryptoConfig extends LYBaseConfigModel {
    constructor(...args){
        super(...args), this.type = 'default';
    }
}
class LYAppConfig extends LYBaseConfigModel {
    constructor(...args){
        super(...args), this.name = '', this.version = '';
    }
}
class LYAddressConfig extends LYBaseConfigModel {
    constructor(...args){
        super(...args), this.tenantLoginUrl = '/', this.organizationLoginUrl = '/';
    }
}
function config_ts_decorate(decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : null === desc ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if ("object" == typeof Reflect && "function" == typeof Reflect.decorate) r = Reflect.decorate(decorators, target, key, desc);
    else for(var i = decorators.length - 1; i >= 0; i--)if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
}
function config_ts_metadata(k, v) {
    if ("object" == typeof Reflect && "function" == typeof Reflect.metadata) return Reflect.metadata(k, v);
}
class LYConfig extends LYBaseConfig {
    constructor(...args){
        super(...args), this.http = new LYHttpConfig(), this.crypto = new LYCryptoConfig(), this.apps = [], this.address = new LYAddressConfig(), this.host_patterns = [];
    }
}
config_ts_decorate([
    base_model(LYHttpConfig),
    config_ts_metadata("design:type", void 0 === LYHttpConfig ? Object : LYHttpConfig)
], LYConfig.prototype, "http", void 0);
config_ts_decorate([
    base_model(LYCryptoConfig),
    config_ts_metadata("design:type", void 0 === LYCryptoConfig ? Object : LYCryptoConfig)
], LYConfig.prototype, "crypto", void 0);
config_ts_decorate([
    base_array(LYAppConfig),
    config_ts_metadata("design:type", Array)
], LYConfig.prototype, "apps", void 0);
config_ts_decorate([
    base_model(LYAddressConfig),
    config_ts_metadata("design:type", void 0 === LYAddressConfig ? Object : LYAddressConfig)
], LYConfig.prototype, "address", void 0);
LYConfig = config_ts_decorate([
    register('LYConfig')
], LYConfig);
var niceErrors = {
    0: "Invalid value for configuration 'enforceActions', expected 'never', 'always' or 'observed'",
    1: function(annotationType, key) {
        return "Cannot apply '" + annotationType + "' to '" + key.toString() + "': Field not found.";
    },
    5: "'keys()' can only be used on observable objects, arrays, sets and maps",
    6: "'values()' can only be used on observable objects, arrays, sets and maps",
    7: "'entries()' can only be used on observable objects, arrays and maps",
    8: "'set()' can only be used on observable objects, arrays and maps",
    9: "'remove()' can only be used on observable objects, arrays and maps",
    10: "'has()' can only be used on observable objects, arrays and maps",
    11: "'get()' can only be used on observable objects, arrays and maps",
    12: "Invalid annotation",
    13: "Dynamic observable objects cannot be frozen. If you're passing observables to 3rd party component/function that calls Object.freeze, pass copy instead: toJS(observable)",
    14: "Intercept handlers should return nothing or a change object",
    15: "Observable arrays cannot be frozen. If you're passing observables to 3rd party component/function that calls Object.freeze, pass copy instead: toJS(observable)",
    16: "Modification exception: the internal structure of an observable array was changed.",
    17: function(index, length) {
        return "[mobx.array] Index out of bounds, " + index + " is larger than " + length;
    },
    18: "mobx.map requires Map polyfill for the current browser. Check babel-polyfill or core-js/es6/map.js",
    19: function(other) {
        return "Cannot initialize from classes that inherit from Map: " + other.constructor.name;
    },
    20: function(other) {
        return "Cannot initialize map from " + other;
    },
    21: function(dataStructure) {
        return "Cannot convert to map from '" + dataStructure + "'";
    },
    22: "mobx.set requires Set polyfill for the current browser. Check babel-polyfill or core-js/es6/set.js",
    23: "It is not possible to get index atoms from arrays",
    24: function(thing) {
        return "Cannot obtain administration from " + thing;
    },
    25: function(property, name1) {
        return "the entry '" + property + "' does not exist in the observable map '" + name1 + "'";
    },
    26: "please specify a property",
    27: function(property, name1) {
        return "no observable property '" + property.toString() + "' found on the observable object '" + name1 + "'";
    },
    28: function(thing) {
        return "Cannot obtain atom from " + thing;
    },
    29: "Expecting some object",
    30: "invalid action stack. did you forget to finish an action?",
    31: "missing option for computed: get",
    32: function(name1, derivation) {
        return "Cycle detected in computation " + name1 + ": " + derivation;
    },
    33: function(name1) {
        return "The setter of computed value '" + name1 + "' is trying to update itself. Did you intend to update an _observable_ value, instead of the computed property?";
    },
    34: function(name1) {
        return "[ComputedValue '" + name1 + "'] It is not possible to assign a new value to a computed value.";
    },
    35: "There are multiple, different versions of MobX active. Make sure MobX is loaded only once or use `configure({ isolateGlobalState: true })`",
    36: "isolateGlobalState should be called before MobX is running any reactions",
    37: function(method) {
        return "[mobx] `observableArray." + method + "()` mutates the array in-place, which is not allowed inside a derivation. Use `array.slice()." + method + "()` instead";
    },
    38: "'ownKeys()' can only be used on observable objects",
    39: "'defineProperty()' can only be used on observable objects"
};
var errors = "production" !== process.env.NODE_ENV ? niceErrors : {};
function die(error) {
    for(var _len = arguments.length, args = new Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++)args[_key - 1] = arguments[_key];
    if ("production" !== process.env.NODE_ENV) {
        var e = "string" == typeof error ? error : errors[error];
        if ("function" == typeof e) e = e.apply(null, args);
        throw new Error("[MobX] " + e);
    }
    throw new Error("number" == typeof error ? "[MobX] minified error nr: " + error + (args.length ? " " + args.map(String).join(",") : "") + ". Find the full error at: https://github.com/mobxjs/mobx/blob/main/packages/mobx/src/errors.ts" : "[MobX] " + error);
}
var mockGlobal = {};
function getGlobal() {
    if ("undefined" != typeof globalThis) return globalThis;
    if ("undefined" != typeof window) return window;
    if (void 0 !== __webpack_require__.g) return __webpack_require__.g;
    if ("undefined" != typeof self) return self;
    return mockGlobal;
}
var mobx_esm_assign = Object.assign;
var getDescriptor = Object.getOwnPropertyDescriptor;
var mobx_esm_defineProperty = Object.defineProperty;
var objectPrototype = Object.prototype;
var EMPTY_ARRAY = [];
Object.freeze(EMPTY_ARRAY);
var EMPTY_OBJECT = {};
Object.freeze(EMPTY_OBJECT);
var hasProxy = "undefined" != typeof Proxy;
var plainObjectString = /*#__PURE__*/ Object.toString();
function assertProxies() {
    if (!hasProxy) die("production" !== process.env.NODE_ENV ? "`Proxy` objects are not available in the current environment. Please configure MobX to enable a fallback implementation.`" : "Proxy not available");
}
function warnAboutProxyRequirement(msg) {
    if ("production" !== process.env.NODE_ENV && globalState.verifyProxies) die("MobX is currently configured to be able to run in ES5 mode, but in ES5 MobX won't be able to " + msg);
}
function getNextId() {
    return ++globalState.mobxGuid;
}
function once(func) {
    var invoked = false;
    return function() {
        if (invoked) return;
        invoked = true;
        return func.apply(this, arguments);
    };
}
var mobx_esm_noop = function() {};
function isFunction(fn) {
    return "function" == typeof fn;
}
function isStringish(value) {
    var t = typeof value;
    switch(t){
        case "string":
        case "symbol":
        case "number":
            return true;
    }
    return false;
}
function isObject(value) {
    return null !== value && "object" == typeof value;
}
function isPlainObject(value) {
    if (!isObject(value)) return false;
    var proto = Object.getPrototypeOf(value);
    if (null == proto) return true;
    var protoConstructor = Object.hasOwnProperty.call(proto, "constructor") && proto.constructor;
    return "function" == typeof protoConstructor && protoConstructor.toString() === plainObjectString;
}
function isGenerator(obj) {
    var constructor = null == obj ? void 0 : obj.constructor;
    if (!constructor) return false;
    if ("GeneratorFunction" === constructor.name || "GeneratorFunction" === constructor.displayName) return true;
    return false;
}
function addHiddenProp(object, propName, value) {
    mobx_esm_defineProperty(object, propName, {
        enumerable: false,
        writable: true,
        configurable: true,
        value: value
    });
}
function addHiddenFinalProp(object, propName, value) {
    mobx_esm_defineProperty(object, propName, {
        enumerable: false,
        writable: false,
        configurable: true,
        value: value
    });
}
function createInstanceofPredicate(name1, theClass) {
    var propName = "isMobX" + name1;
    theClass.prototype[propName] = true;
    return function(x) {
        return isObject(x) && true === x[propName];
    };
}
function isES6Map(thing) {
    return null != thing && "[object Map]" === Object.prototype.toString.call(thing);
}
function isPlainES6Map(thing) {
    var mapProto = Object.getPrototypeOf(thing);
    var objectProto = Object.getPrototypeOf(mapProto);
    var nullProto = Object.getPrototypeOf(objectProto);
    return null === nullProto;
}
function isES6Set(thing) {
    return null != thing && "[object Set]" === Object.prototype.toString.call(thing);
}
var hasGetOwnPropertySymbols = void 0 !== Object.getOwnPropertySymbols;
function getPlainObjectKeys(object) {
    var keys = Object.keys(object);
    if (!hasGetOwnPropertySymbols) return keys;
    var symbols = Object.getOwnPropertySymbols(object);
    if (!symbols.length) return keys;
    return [].concat(keys, symbols.filter(function(s) {
        return objectPrototype.propertyIsEnumerable.call(object, s);
    }));
}
var mobx_esm_ownKeys = "undefined" != typeof Reflect && Reflect.ownKeys ? Reflect.ownKeys : hasGetOwnPropertySymbols ? function(obj) {
    return Object.getOwnPropertyNames(obj).concat(Object.getOwnPropertySymbols(obj));
} : Object.getOwnPropertyNames;
function stringifyKey(key) {
    if ("string" == typeof key) return key;
    if ("symbol" == typeof key) return key.toString();
    return new String(key).toString();
}
function toPrimitive(value) {
    return null === value ? null : "object" == typeof value ? "" + value : value;
}
function hasProp(target, prop) {
    return objectPrototype.hasOwnProperty.call(target, prop);
}
var mobx_esm_getOwnPropertyDescriptors = Object.getOwnPropertyDescriptors || function(target) {
    var res = {};
    mobx_esm_ownKeys(target).forEach(function(key) {
        res[key] = getDescriptor(target, key);
    });
    return res;
};
function getFlag(flags, mask) {
    return !!(flags & mask);
}
function setFlag(flags, mask, newValue) {
    if (newValue) flags |= mask;
    else flags &= ~mask;
    return flags;
}
function _arrayLikeToArray(r, a) {
    (null == a || a > r.length) && (a = r.length);
    for(var e = 0, n = Array(a); e < a; e++)n[e] = r[e];
    return n;
}
function _defineProperties(e, r) {
    for(var t = 0; t < r.length; t++){
        var o = r[t];
        o.enumerable = o.enumerable || !1, o.configurable = !0, "value" in o && (o.writable = !0), Object.defineProperty(e, _toPropertyKey(o.key), o);
    }
}
function _createClass(e, r, t) {
    return r && _defineProperties(e.prototype, r), t && _defineProperties(e, t), Object.defineProperty(e, "prototype", {
        writable: !1
    }), e;
}
function _createForOfIteratorHelperLoose(r, e) {
    var t = "undefined" != typeof Symbol && r[Symbol.iterator] || r["@@iterator"];
    if (t) return (t = t.call(r)).next.bind(t);
    if (Array.isArray(r) || (t = _unsupportedIterableToArray(r)) || e && r && "number" == typeof r.length) {
        t && (r = t);
        var o = 0;
        return function() {
            return o >= r.length ? {
                done: !0
            } : {
                done: !1,
                value: r[o++]
            };
        };
    }
    throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.");
}
function _extends() {
    return _extends = Object.assign ? Object.assign.bind() : function(n) {
        for(var e = 1; e < arguments.length; e++){
            var t = arguments[e];
            for(var r in t)({}).hasOwnProperty.call(t, r) && (n[r] = t[r]);
        }
        return n;
    }, _extends.apply(null, arguments);
}
function _inheritsLoose(t, o) {
    t.prototype = Object.create(o.prototype), t.prototype.constructor = t, _setPrototypeOf(t, o);
}
function _setPrototypeOf(t, e) {
    return _setPrototypeOf = Object.setPrototypeOf ? Object.setPrototypeOf.bind() : function(t, e) {
        return t.__proto__ = e, t;
    }, _setPrototypeOf(t, e);
}
function _toPrimitive(t, r) {
    if ("object" != typeof t || !t) return t;
    var e = t[Symbol.toPrimitive];
    if (void 0 !== e) {
        var i = e.call(t, r || "default");
        if ("object" != typeof i) return i;
        throw new TypeError("@@toPrimitive must return a primitive value.");
    }
    return ("string" === r ? String : Number)(t);
}
function _toPropertyKey(t) {
    var i = _toPrimitive(t, "string");
    return "symbol" == typeof i ? i : i + "";
}
function _unsupportedIterableToArray(r, a) {
    if (r) {
        if ("string" == typeof r) return _arrayLikeToArray(r, a);
        var t = ({}).toString.call(r).slice(8, -1);
        return "Object" === t && r.constructor && (t = r.constructor.name), "Map" === t || "Set" === t ? Array.from(r) : "Arguments" === t || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(t) ? _arrayLikeToArray(r, a) : void 0;
    }
}
var storedAnnotationsSymbol = /*#__PURE__*/ Symbol("mobx-stored-annotations");
function createDecoratorAnnotation(annotation) {
    function decorator(target, property) {
        if (is20223Decorator(property)) return annotation.decorate_20223_(target, property);
        storeAnnotation(target, property, annotation);
    }
    return Object.assign(decorator, annotation);
}
function storeAnnotation(prototype, key, annotation) {
    if (!hasProp(prototype, storedAnnotationsSymbol)) addHiddenProp(prototype, storedAnnotationsSymbol, _extends({}, prototype[storedAnnotationsSymbol]));
    if ("production" !== process.env.NODE_ENV && isOverride(annotation) && !hasProp(prototype[storedAnnotationsSymbol], key)) {
        var fieldName = prototype.constructor.name + ".prototype." + key.toString();
        die("'" + fieldName + "' is decorated with 'override', but no such decorated member was found on prototype.");
    }
    assertNotDecorated(prototype, annotation, key);
    if (!isOverride(annotation)) prototype[storedAnnotationsSymbol][key] = annotation;
}
function assertNotDecorated(prototype, annotation, key) {
    if ("production" !== process.env.NODE_ENV && !isOverride(annotation) && hasProp(prototype[storedAnnotationsSymbol], key)) {
        var fieldName = prototype.constructor.name + ".prototype." + key.toString();
        var currentAnnotationType = prototype[storedAnnotationsSymbol][key].annotationType_;
        var requestedAnnotationType = annotation.annotationType_;
        die("Cannot apply '@" + requestedAnnotationType + "' to '" + fieldName + "':\nThe field is already decorated with '@" + currentAnnotationType + "'.\nRe-decorating fields is not allowed.\nUse '@override' decorator for methods overridden by subclass.");
    }
}
function collectStoredAnnotations(target) {
    if (!hasProp(target, storedAnnotationsSymbol)) addHiddenProp(target, storedAnnotationsSymbol, _extends({}, target[storedAnnotationsSymbol]));
    return target[storedAnnotationsSymbol];
}
function is20223Decorator(context) {
    return "object" == typeof context && "string" == typeof context["kind"];
}
function assert20223DecoratorType(context, types) {
    if ("production" !== process.env.NODE_ENV && !types.includes(context.kind)) die("The decorator applied to '" + String(context.name) + "' cannot be used on a " + context.kind + " element");
}
var $mobx = /*#__PURE__*/ Symbol("mobx administration");
var mobx_esm_Atom = /*#__PURE__*/ function() {
    function Atom(name_) {
        if (void 0 === name_) name_ = "production" !== process.env.NODE_ENV ? "Atom@" + getNextId() : "Atom";
        this.name_ = void 0;
        this.flags_ = 0;
        this.observers_ = new Set();
        this.lastAccessedBy_ = 0;
        this.lowestObserverState_ = mobx_esm_IDerivationState_.NOT_TRACKING_;
        this.onBOL = void 0;
        this.onBUOL = void 0;
        this.name_ = name_;
    }
    var _proto = Atom.prototype;
    _proto.onBO = function() {
        if (this.onBOL) this.onBOL.forEach(function(listener) {
            return listener();
        });
    };
    _proto.onBUO = function() {
        if (this.onBUOL) this.onBUOL.forEach(function(listener) {
            return listener();
        });
    };
    _proto.reportObserved = function() {
        return reportObserved(this);
    };
    _proto.reportChanged = function() {
        startBatch();
        propagateChanged(this);
        endBatch();
    };
    _proto.toString = function() {
        return this.name_;
    };
    return _createClass(Atom, [
        {
            key: "isBeingObserved",
            get: function() {
                return getFlag(this.flags_, Atom.isBeingObservedMask_);
            },
            set: function(newValue) {
                this.flags_ = setFlag(this.flags_, Atom.isBeingObservedMask_, newValue);
            }
        },
        {
            key: "isPendingUnobservation",
            get: function() {
                return getFlag(this.flags_, Atom.isPendingUnobservationMask_);
            },
            set: function(newValue) {
                this.flags_ = setFlag(this.flags_, Atom.isPendingUnobservationMask_, newValue);
            }
        },
        {
            key: "diffValue",
            get: function() {
                return getFlag(this.flags_, Atom.diffValueMask_) ? 1 : 0;
            },
            set: function(newValue) {
                this.flags_ = setFlag(this.flags_, Atom.diffValueMask_, 1 === newValue);
            }
        }
    ]);
}();
mobx_esm_Atom.isBeingObservedMask_ = 1;
mobx_esm_Atom.isPendingUnobservationMask_ = 2;
mobx_esm_Atom.diffValueMask_ = 4;
var isAtom = /*#__PURE__*/ createInstanceofPredicate("Atom", mobx_esm_Atom);
function mobx_esm_createAtom(name1, onBecomeObservedHandler, onBecomeUnobservedHandler) {
    if (void 0 === onBecomeObservedHandler) onBecomeObservedHandler = mobx_esm_noop;
    if (void 0 === onBecomeUnobservedHandler) onBecomeUnobservedHandler = mobx_esm_noop;
    var atom = new mobx_esm_Atom(name1);
    if (onBecomeObservedHandler !== mobx_esm_noop) onBecomeObserved(atom, onBecomeObservedHandler);
    if (onBecomeUnobservedHandler !== mobx_esm_noop) mobx_esm_onBecomeUnobserved(atom, onBecomeUnobservedHandler);
    return atom;
}
function identityComparer(a, b) {
    return a === b;
}
function structuralComparer(a, b) {
    return deepEqual(a, b);
}
function shallowComparer(a, b) {
    return deepEqual(a, b, 1);
}
function defaultComparer(a, b) {
    if (Object.is) return Object.is(a, b);
    return a === b ? 0 !== a || 1 / a === 1 / b : a !== a && b !== b;
}
var comparer = {
    identity: identityComparer,
    structural: structuralComparer,
    default: defaultComparer,
    shallow: shallowComparer
};
function deepEnhancer(v, _, name1) {
    if (isObservable(v)) return v;
    if (Array.isArray(v)) return mobx_esm_observable.array(v, {
        name: name1
    });
    if (isPlainObject(v)) return mobx_esm_observable.object(v, void 0, {
        name: name1
    });
    if (isES6Map(v)) return mobx_esm_observable.map(v, {
        name: name1
    });
    if (isES6Set(v)) return mobx_esm_observable.set(v, {
        name: name1
    });
    if ("function" == typeof v && !mobx_esm_isAction(v) && !isFlow(v)) if (isGenerator(v)) return mobx_esm_flow(v);
    else return mobx_esm_autoAction(name1, v);
    return v;
}
function shallowEnhancer(v, _, name1) {
    if (null == v) return v;
    if (isObservableObject(v) || mobx_esm_isObservableArray(v) || isObservableMap(v) || isObservableSet(v)) return v;
    if (Array.isArray(v)) return mobx_esm_observable.array(v, {
        name: name1,
        deep: false
    });
    if (isPlainObject(v)) return mobx_esm_observable.object(v, void 0, {
        name: name1,
        deep: false
    });
    if (isES6Map(v)) return mobx_esm_observable.map(v, {
        name: name1,
        deep: false
    });
    if (isES6Set(v)) return mobx_esm_observable.set(v, {
        name: name1,
        deep: false
    });
    if ("production" !== process.env.NODE_ENV) die("The shallow modifier / decorator can only used in combination with arrays, objects, maps and sets");
}
function referenceEnhancer(newValue) {
    return newValue;
}
function refStructEnhancer(v, oldValue) {
    if ("production" !== process.env.NODE_ENV && isObservable(v)) die("observable.struct should not be used with observable values");
    if (deepEqual(v, oldValue)) return oldValue;
    return v;
}
var OVERRIDE = "override";
function isOverride(annotation) {
    return annotation.annotationType_ === OVERRIDE;
}
function createActionAnnotation(name1, options) {
    return {
        annotationType_: name1,
        options_: options,
        make_: make_$1,
        extend_: extend_$1,
        decorate_20223_: decorate_20223_$1
    };
}
function make_$1(adm, key, descriptor, source) {
    var _this$options_;
    if (null != (_this$options_ = this.options_) && _this$options_.bound) return null === this.extend_(adm, key, descriptor, false) ? 0 : 1;
    if (source === adm.target_) return null === this.extend_(adm, key, descriptor, false) ? 0 : 2;
    if (mobx_esm_isAction(descriptor.value)) return 1;
    var actionDescriptor = createActionDescriptor(adm, this, key, descriptor, false);
    mobx_esm_defineProperty(source, key, actionDescriptor);
    return 2;
}
function extend_$1(adm, key, descriptor, proxyTrap) {
    var actionDescriptor = createActionDescriptor(adm, this, key, descriptor);
    return adm.defineProperty_(key, actionDescriptor, proxyTrap);
}
function decorate_20223_$1(mthd, context) {
    if ("production" !== process.env.NODE_ENV) assert20223DecoratorType(context, [
        "method",
        "field"
    ]);
    var kind = context.kind, name1 = context.name, addInitializer = context.addInitializer;
    var ann = this;
    var _createAction = function(m) {
        var _ann$options_$name, _ann$options_, _ann$options_$autoAct, _ann$options_2;
        return createAction(null != (_ann$options_$name = null == (_ann$options_ = ann.options_) ? void 0 : _ann$options_.name) ? _ann$options_$name : name1.toString(), m, null != (_ann$options_$autoAct = null == (_ann$options_2 = ann.options_) ? void 0 : _ann$options_2.autoAction) ? _ann$options_$autoAct : false);
    };
    if ("field" == kind) return function(initMthd) {
        var _ann$options_3;
        var mthd = initMthd;
        if (!mobx_esm_isAction(mthd)) mthd = _createAction(mthd);
        if (null != (_ann$options_3 = ann.options_) && _ann$options_3.bound) {
            mthd = mthd.bind(this);
            mthd.isMobxAction = true;
        }
        return mthd;
    };
    if ("method" == kind) {
        var _this$options_2;
        if (!mobx_esm_isAction(mthd)) mthd = _createAction(mthd);
        if (null != (_this$options_2 = this.options_) && _this$options_2.bound) addInitializer(function() {
            var self1 = this;
            var bound = self1[name1].bind(self1);
            bound.isMobxAction = true;
            self1[name1] = bound;
        });
        return mthd;
    }
    die("Cannot apply '" + ann.annotationType_ + "' to '" + String(name1) + "' (kind: " + kind + "):\n'" + ann.annotationType_ + "' can only be used on properties with a function value.");
}
function assertActionDescriptor(adm, _ref, key, _ref2) {
    var annotationType_ = _ref.annotationType_;
    var value = _ref2.value;
    if ("production" !== process.env.NODE_ENV && !isFunction(value)) die("Cannot apply '" + annotationType_ + "' to '" + adm.name_ + "." + key.toString() + "':\n'" + annotationType_ + "' can only be used on properties with a function value.");
}
function createActionDescriptor(adm, annotation, key, descriptor, safeDescriptors) {
    var _annotation$options_, _annotation$options_$, _annotation$options_2, _annotation$options_$2, _annotation$options_3, _annotation$options_4, _adm$proxy_2;
    if (void 0 === safeDescriptors) safeDescriptors = globalState.safeDescriptors;
    assertActionDescriptor(adm, annotation, key, descriptor);
    var value = descriptor.value;
    if (null != (_annotation$options_ = annotation.options_) && _annotation$options_.bound) {
        var _adm$proxy_;
        value = value.bind(null != (_adm$proxy_ = adm.proxy_) ? _adm$proxy_ : adm.target_);
    }
    return {
        value: createAction(null != (_annotation$options_$ = null == (_annotation$options_2 = annotation.options_) ? void 0 : _annotation$options_2.name) ? _annotation$options_$ : key.toString(), value, null != (_annotation$options_$2 = null == (_annotation$options_3 = annotation.options_) ? void 0 : _annotation$options_3.autoAction) ? _annotation$options_$2 : false, null != (_annotation$options_4 = annotation.options_) && _annotation$options_4.bound ? null != (_adm$proxy_2 = adm.proxy_) ? _adm$proxy_2 : adm.target_ : void 0),
        configurable: safeDescriptors ? adm.isPlainObject_ : true,
        enumerable: false,
        writable: !safeDescriptors
    };
}
function createFlowAnnotation(name1, options) {
    return {
        annotationType_: name1,
        options_: options,
        make_: make_$2,
        extend_: extend_$2,
        decorate_20223_: decorate_20223_$2
    };
}
function make_$2(adm, key, descriptor, source) {
    var _this$options_;
    if (source === adm.target_) return null === this.extend_(adm, key, descriptor, false) ? 0 : 2;
    if (null != (_this$options_ = this.options_) && _this$options_.bound && (!hasProp(adm.target_, key) || !isFlow(adm.target_[key]))) {
        if (null === this.extend_(adm, key, descriptor, false)) return 0;
    }
    if (isFlow(descriptor.value)) return 1;
    var flowDescriptor = createFlowDescriptor(adm, this, key, descriptor, false, false);
    mobx_esm_defineProperty(source, key, flowDescriptor);
    return 2;
}
function extend_$2(adm, key, descriptor, proxyTrap) {
    var _this$options_2;
    var flowDescriptor = createFlowDescriptor(adm, this, key, descriptor, null == (_this$options_2 = this.options_) ? void 0 : _this$options_2.bound);
    return adm.defineProperty_(key, flowDescriptor, proxyTrap);
}
function decorate_20223_$2(mthd, context) {
    var _this$options_3;
    if ("production" !== process.env.NODE_ENV) assert20223DecoratorType(context, [
        "method"
    ]);
    var name1 = context.name, addInitializer = context.addInitializer;
    if (!isFlow(mthd)) mthd = mobx_esm_flow(mthd);
    if (null != (_this$options_3 = this.options_) && _this$options_3.bound) addInitializer(function() {
        var self1 = this;
        var bound = self1[name1].bind(self1);
        bound.isMobXFlow = true;
        self1[name1] = bound;
    });
    return mthd;
}
function assertFlowDescriptor(adm, _ref, key, _ref2) {
    var annotationType_ = _ref.annotationType_;
    var value = _ref2.value;
    if ("production" !== process.env.NODE_ENV && !isFunction(value)) die("Cannot apply '" + annotationType_ + "' to '" + adm.name_ + "." + key.toString() + "':\n'" + annotationType_ + "' can only be used on properties with a generator function value.");
}
function createFlowDescriptor(adm, annotation, key, descriptor, bound, safeDescriptors) {
    if (void 0 === safeDescriptors) safeDescriptors = globalState.safeDescriptors;
    assertFlowDescriptor(adm, annotation, key, descriptor);
    var value = descriptor.value;
    if (!isFlow(value)) value = mobx_esm_flow(value);
    if (bound) {
        var _adm$proxy_;
        value = value.bind(null != (_adm$proxy_ = adm.proxy_) ? _adm$proxy_ : adm.target_);
        value.isMobXFlow = true;
    }
    return {
        value: value,
        configurable: safeDescriptors ? adm.isPlainObject_ : true,
        enumerable: false,
        writable: !safeDescriptors
    };
}
function createComputedAnnotation(name1, options) {
    return {
        annotationType_: name1,
        options_: options,
        make_: make_$3,
        extend_: extend_$3,
        decorate_20223_: decorate_20223_$3
    };
}
function make_$3(adm, key, descriptor) {
    return null === this.extend_(adm, key, descriptor, false) ? 0 : 1;
}
function extend_$3(adm, key, descriptor, proxyTrap) {
    assertComputedDescriptor(adm, this, key, descriptor);
    return adm.defineComputedProperty_(key, _extends({}, this.options_, {
        get: descriptor.get,
        set: descriptor.set
    }), proxyTrap);
}
function decorate_20223_$3(get, context) {
    if ("production" !== process.env.NODE_ENV) assert20223DecoratorType(context, [
        "getter"
    ]);
    var ann = this;
    var key = context.name, addInitializer = context.addInitializer;
    addInitializer(function() {
        var adm = asObservableObject(this)[$mobx];
        var options = _extends({}, ann.options_, {
            get: get,
            context: this
        });
        options.name || (options.name = "production" !== process.env.NODE_ENV ? adm.name_ + "." + key.toString() : "ObservableObject." + key.toString());
        adm.values_.set(key, new mobx_esm_ComputedValue(options));
    });
    return function() {
        return this[$mobx].getObservablePropValue_(key);
    };
}
function assertComputedDescriptor(adm, _ref, key, _ref2) {
    var annotationType_ = _ref.annotationType_;
    var get = _ref2.get;
    if ("production" !== process.env.NODE_ENV && !get) die("Cannot apply '" + annotationType_ + "' to '" + adm.name_ + "." + key.toString() + "':\n'" + annotationType_ + "' can only be used on getter(+setter) properties.");
}
function createObservableAnnotation(name1, options) {
    return {
        annotationType_: name1,
        options_: options,
        make_: make_$4,
        extend_: extend_$4,
        decorate_20223_: decorate_20223_$4
    };
}
function make_$4(adm, key, descriptor) {
    return null === this.extend_(adm, key, descriptor, false) ? 0 : 1;
}
function extend_$4(adm, key, descriptor, proxyTrap) {
    var _this$options_$enhanc, _this$options_;
    assertObservableDescriptor(adm, this, key, descriptor);
    return adm.defineObservableProperty_(key, descriptor.value, null != (_this$options_$enhanc = null == (_this$options_ = this.options_) ? void 0 : _this$options_.enhancer) ? _this$options_$enhanc : deepEnhancer, proxyTrap);
}
function decorate_20223_$4(desc, context) {
    if ("production" !== process.env.NODE_ENV) {
        if ("field" === context.kind) throw die("Please use `@observable accessor " + String(context.name) + "` instead of `@observable " + String(context.name) + "`");
        assert20223DecoratorType(context, [
            "accessor"
        ]);
    }
    var ann = this;
    var kind = context.kind, name1 = context.name;
    var initializedObjects = new WeakSet();
    function initializeObservable(target, value) {
        var _ann$options_$enhance, _ann$options_;
        var adm = asObservableObject(target)[$mobx];
        var observable = new mobx_esm_ObservableValue(value, null != (_ann$options_$enhance = null == (_ann$options_ = ann.options_) ? void 0 : _ann$options_.enhancer) ? _ann$options_$enhance : deepEnhancer, "production" !== process.env.NODE_ENV ? adm.name_ + "." + name1.toString() : "ObservableObject." + name1.toString(), false);
        adm.values_.set(name1, observable);
        initializedObjects.add(target);
    }
    if ("accessor" == kind) return {
        get: function() {
            if (!initializedObjects.has(this)) initializeObservable(this, desc.get.call(this));
            return this[$mobx].getObservablePropValue_(name1);
        },
        set: function(value) {
            if (!initializedObjects.has(this)) initializeObservable(this, value);
            return this[$mobx].setObservablePropValue_(name1, value);
        },
        init: function(value) {
            if (!initializedObjects.has(this)) initializeObservable(this, value);
            return value;
        }
    };
}
function assertObservableDescriptor(adm, _ref, key, descriptor) {
    var annotationType_ = _ref.annotationType_;
    if ("production" !== process.env.NODE_ENV && !("value" in descriptor)) die("Cannot apply '" + annotationType_ + "' to '" + adm.name_ + "." + key.toString() + "':\n'" + annotationType_ + "' cannot be used on getter/setter properties");
}
var AUTO = "true";
var autoAnnotation = /*#__PURE__*/ createAutoAnnotation();
function createAutoAnnotation(options) {
    return {
        annotationType_: AUTO,
        options_: options,
        make_: make_$5,
        extend_: extend_$5,
        decorate_20223_: decorate_20223_$5
    };
}
function make_$5(adm, key, descriptor, source) {
    var _this$options_3, _this$options_4;
    if (descriptor.get) return mobx_esm_computed.make_(adm, key, descriptor, source);
    if (descriptor.set) {
        var set = mobx_esm_isAction(descriptor.set) ? descriptor.set : createAction(key.toString(), descriptor.set);
        if (source === adm.target_) return null === adm.defineProperty_(key, {
            configurable: globalState.safeDescriptors ? adm.isPlainObject_ : true,
            set: set
        }) ? 0 : 2;
        mobx_esm_defineProperty(source, key, {
            configurable: true,
            set: set
        });
        return 2;
    }
    if (source !== adm.target_ && "function" == typeof descriptor.value) {
        var _this$options_2;
        if (isGenerator(descriptor.value)) {
            var _this$options_;
            var flowAnnotation = null != (_this$options_ = this.options_) && _this$options_.autoBind ? mobx_esm_flow.bound : mobx_esm_flow;
            return flowAnnotation.make_(adm, key, descriptor, source);
        }
        var actionAnnotation = null != (_this$options_2 = this.options_) && _this$options_2.autoBind ? mobx_esm_autoAction.bound : mobx_esm_autoAction;
        return actionAnnotation.make_(adm, key, descriptor, source);
    }
    var observableAnnotation = (null == (_this$options_3 = this.options_) ? void 0 : _this$options_3.deep) === false ? mobx_esm_observable.ref : mobx_esm_observable;
    if ("function" == typeof descriptor.value && null != (_this$options_4 = this.options_) && _this$options_4.autoBind) {
        var _adm$proxy_;
        descriptor.value = descriptor.value.bind(null != (_adm$proxy_ = adm.proxy_) ? _adm$proxy_ : adm.target_);
    }
    return observableAnnotation.make_(adm, key, descriptor, source);
}
function extend_$5(adm, key, descriptor, proxyTrap) {
    var _this$options_5, _this$options_6;
    if (descriptor.get) return mobx_esm_computed.extend_(adm, key, descriptor, proxyTrap);
    if (descriptor.set) return adm.defineProperty_(key, {
        configurable: globalState.safeDescriptors ? adm.isPlainObject_ : true,
        set: createAction(key.toString(), descriptor.set)
    }, proxyTrap);
    if ("function" == typeof descriptor.value && null != (_this$options_5 = this.options_) && _this$options_5.autoBind) {
        var _adm$proxy_2;
        descriptor.value = descriptor.value.bind(null != (_adm$proxy_2 = adm.proxy_) ? _adm$proxy_2 : adm.target_);
    }
    var observableAnnotation = (null == (_this$options_6 = this.options_) ? void 0 : _this$options_6.deep) === false ? mobx_esm_observable.ref : mobx_esm_observable;
    return observableAnnotation.extend_(adm, key, descriptor, proxyTrap);
}
function decorate_20223_$5(desc, context) {
    die("'" + this.annotationType_ + "' cannot be used as a decorator");
}
var OBSERVABLE = "observable";
var OBSERVABLE_REF = "observable.ref";
var OBSERVABLE_SHALLOW = "observable.shallow";
var OBSERVABLE_STRUCT = "observable.struct";
var defaultCreateObservableOptions = {
    deep: true,
    name: void 0,
    defaultDecorator: void 0,
    proxy: true
};
Object.freeze(defaultCreateObservableOptions);
function asCreateObservableOptions(thing) {
    return thing || defaultCreateObservableOptions;
}
var mobx_esm_observableAnnotation = /*#__PURE__*/ createObservableAnnotation(OBSERVABLE);
var observableRefAnnotation = /*#__PURE__*/ createObservableAnnotation(OBSERVABLE_REF, {
    enhancer: referenceEnhancer
});
var observableShallowAnnotation = /*#__PURE__*/ createObservableAnnotation(OBSERVABLE_SHALLOW, {
    enhancer: shallowEnhancer
});
var observableStructAnnotation = /*#__PURE__*/ createObservableAnnotation(OBSERVABLE_STRUCT, {
    enhancer: refStructEnhancer
});
var observableDecoratorAnnotation = /*#__PURE__*/ createDecoratorAnnotation(mobx_esm_observableAnnotation);
function getEnhancerFromOptions(options) {
    return true === options.deep ? deepEnhancer : false === options.deep ? referenceEnhancer : getEnhancerFromAnnotation(options.defaultDecorator);
}
function getAnnotationFromOptions(options) {
    var _options$defaultDecor;
    return options ? null != (_options$defaultDecor = options.defaultDecorator) ? _options$defaultDecor : createAutoAnnotation(options) : void 0;
}
function getEnhancerFromAnnotation(annotation) {
    var _annotation$options_$, _annotation$options_;
    return annotation ? null != (_annotation$options_$ = null == (_annotation$options_ = annotation.options_) ? void 0 : _annotation$options_.enhancer) ? _annotation$options_$ : deepEnhancer : deepEnhancer;
}
function createObservable(v, arg2, arg3) {
    if (is20223Decorator(arg2)) return mobx_esm_observableAnnotation.decorate_20223_(v, arg2);
    if (isStringish(arg2)) return void storeAnnotation(v, arg2, mobx_esm_observableAnnotation);
    if (isObservable(v)) return v;
    if (isPlainObject(v)) return mobx_esm_observable.object(v, arg2, arg3);
    if (Array.isArray(v)) return mobx_esm_observable.array(v, arg2);
    if (isES6Map(v)) return mobx_esm_observable.map(v, arg2);
    if (isES6Set(v)) return mobx_esm_observable.set(v, arg2);
    if ("object" == typeof v && null !== v) return v;
    return mobx_esm_observable.box(v, arg2);
}
mobx_esm_assign(createObservable, observableDecoratorAnnotation);
var observableFactories = {
    box: function(value, options) {
        var o = asCreateObservableOptions(options);
        return new mobx_esm_ObservableValue(value, getEnhancerFromOptions(o), o.name, true, o.equals);
    },
    array: function(initialValues, options) {
        var o = asCreateObservableOptions(options);
        return (false === globalState.useProxies || false === o.proxy ? createLegacyArray : createObservableArray)(initialValues, getEnhancerFromOptions(o), o.name);
    },
    map: function(initialValues, options) {
        var o = asCreateObservableOptions(options);
        return new mobx_esm_ObservableMap(initialValues, getEnhancerFromOptions(o), o.name);
    },
    set: function(initialValues, options) {
        var o = asCreateObservableOptions(options);
        return new mobx_esm_ObservableSet(initialValues, getEnhancerFromOptions(o), o.name);
    },
    object: function(props, decorators, options) {
        return initObservable(function() {
            return extendObservable(false === globalState.useProxies || (null == options ? void 0 : options.proxy) === false ? asObservableObject({}, options) : asDynamicObservableObject({}, options), props, decorators);
        });
    },
    ref: /*#__PURE__*/ createDecoratorAnnotation(observableRefAnnotation),
    shallow: /*#__PURE__*/ createDecoratorAnnotation(observableShallowAnnotation),
    deep: observableDecoratorAnnotation,
    struct: /*#__PURE__*/ createDecoratorAnnotation(observableStructAnnotation)
};
var mobx_esm_observable = /*#__PURE__*/ mobx_esm_assign(createObservable, observableFactories);
var COMPUTED = "computed";
var COMPUTED_STRUCT = "computed.struct";
var computedAnnotation = /*#__PURE__*/ createComputedAnnotation(COMPUTED);
var computedStructAnnotation = /*#__PURE__*/ createComputedAnnotation(COMPUTED_STRUCT, {
    equals: comparer.structural
});
var mobx_esm_computed = function(arg1, arg2) {
    if (is20223Decorator(arg2)) return computedAnnotation.decorate_20223_(arg1, arg2);
    if (isStringish(arg2)) return storeAnnotation(arg1, arg2, computedAnnotation);
    if (isPlainObject(arg1)) return createDecoratorAnnotation(createComputedAnnotation(COMPUTED, arg1));
    if ("production" !== process.env.NODE_ENV) {
        if (!isFunction(arg1)) die("First argument to `computed` should be an expression.");
        if (isFunction(arg2)) die("A setter as second argument is no longer supported, use `{ set: fn }` option instead");
    }
    var opts = isPlainObject(arg2) ? arg2 : {};
    opts.get = arg1;
    opts.name || (opts.name = arg1.name || "");
    return new mobx_esm_ComputedValue(opts);
};
Object.assign(mobx_esm_computed, computedAnnotation);
mobx_esm_computed.struct = /*#__PURE__*/ createDecoratorAnnotation(computedStructAnnotation);
var _getDescriptor$config, mobx_esm_getDescriptor;
var currentActionId = 0;
var nextActionId = 1;
var isFunctionNameConfigurable = null != (_getDescriptor$config = null == (mobx_esm_getDescriptor = /*#__PURE__*/ getDescriptor(function() {}, "name")) ? void 0 : mobx_esm_getDescriptor.configurable) ? _getDescriptor$config : false;
var tmpNameDescriptor = {
    value: "action",
    configurable: true,
    writable: false,
    enumerable: false
};
function createAction(actionName, fn, autoAction, ref) {
    if (void 0 === autoAction) autoAction = false;
    if ("production" !== process.env.NODE_ENV) {
        if (!isFunction(fn)) die("`action` can only be invoked on functions");
        if ("string" != typeof actionName || !actionName) die("actions should have valid names, got: '" + actionName + "'");
    }
    function res() {
        return executeAction(actionName, autoAction, fn, ref || this, arguments);
    }
    res.isMobxAction = true;
    res.toString = function() {
        return fn.toString();
    };
    if (isFunctionNameConfigurable) {
        tmpNameDescriptor.value = actionName;
        mobx_esm_defineProperty(res, "name", tmpNameDescriptor);
    }
    return res;
}
function executeAction(actionName, canRunAsDerivation, fn, scope, args) {
    var runInfo = _startAction(actionName, canRunAsDerivation, scope, args);
    try {
        return fn.apply(scope, args);
    } catch (err) {
        runInfo.error_ = err;
        throw err;
    } finally{
        _endAction(runInfo);
    }
}
function _startAction(actionName, canRunAsDerivation, scope, args) {
    var notifySpy_ = "production" !== process.env.NODE_ENV && isSpyEnabled() && !!actionName;
    var startTime_ = 0;
    if ("production" !== process.env.NODE_ENV && notifySpy_) {
        startTime_ = Date.now();
        var flattenedArgs = args ? Array.from(args) : EMPTY_ARRAY;
        spyReportStart({
            type: ACTION,
            name: actionName,
            object: scope,
            arguments: flattenedArgs
        });
    }
    var prevDerivation_ = globalState.trackingDerivation;
    var runAsAction = !canRunAsDerivation || !prevDerivation_;
    startBatch();
    var prevAllowStateChanges_ = globalState.allowStateChanges;
    if (runAsAction) {
        untrackedStart();
        prevAllowStateChanges_ = allowStateChangesStart(true);
    }
    var prevAllowStateReads_ = allowStateReadsStart(true);
    var runInfo = {
        runAsAction_: runAsAction,
        prevDerivation_: prevDerivation_,
        prevAllowStateChanges_: prevAllowStateChanges_,
        prevAllowStateReads_: prevAllowStateReads_,
        notifySpy_: notifySpy_,
        startTime_: startTime_,
        actionId_: nextActionId++,
        parentActionId_: currentActionId
    };
    currentActionId = runInfo.actionId_;
    return runInfo;
}
function _endAction(runInfo) {
    if (currentActionId !== runInfo.actionId_) die(30);
    currentActionId = runInfo.parentActionId_;
    if (void 0 !== runInfo.error_) globalState.suppressReactionErrors = true;
    allowStateChangesEnd(runInfo.prevAllowStateChanges_);
    allowStateReadsEnd(runInfo.prevAllowStateReads_);
    endBatch();
    if (runInfo.runAsAction_) untrackedEnd(runInfo.prevDerivation_);
    if ("production" !== process.env.NODE_ENV && runInfo.notifySpy_) spyReportEnd({
        time: Date.now() - runInfo.startTime_
    });
    globalState.suppressReactionErrors = false;
}
function mobx_esm_allowStateChanges(allowStateChanges, func) {
    var prev = allowStateChangesStart(allowStateChanges);
    try {
        return func();
    } finally{
        allowStateChangesEnd(prev);
    }
}
function allowStateChangesStart(allowStateChanges) {
    var prev = globalState.allowStateChanges;
    globalState.allowStateChanges = allowStateChanges;
    return prev;
}
function allowStateChangesEnd(prev) {
    globalState.allowStateChanges = prev;
}
var CREATE = "create";
var mobx_esm_ObservableValue = /*#__PURE__*/ function(_Atom) {
    function ObservableValue(value, enhancer, name_, notifySpy, equals) {
        var _this;
        if (void 0 === name_) name_ = "production" !== process.env.NODE_ENV ? "ObservableValue@" + getNextId() : "ObservableValue";
        if (void 0 === notifySpy) notifySpy = true;
        if (void 0 === equals) equals = comparer["default"];
        _this = _Atom.call(this, name_) || this;
        _this.enhancer = void 0;
        _this.name_ = void 0;
        _this.equals = void 0;
        _this.hasUnreportedChange_ = false;
        _this.interceptors_ = void 0;
        _this.changeListeners_ = void 0;
        _this.value_ = void 0;
        _this.dehancer = void 0;
        _this.enhancer = enhancer;
        _this.name_ = name_;
        _this.equals = equals;
        _this.value_ = enhancer(value, void 0, name_);
        if ("production" !== process.env.NODE_ENV && notifySpy && isSpyEnabled()) {
            var _this$value_;
            spyReport({
                type: CREATE,
                object: _this,
                observableKind: "value",
                debugObjectName: _this.name_,
                newValue: "" + (null == (_this$value_ = _this.value_) ? void 0 : _this$value_.toString())
            });
        }
        return _this;
    }
    _inheritsLoose(ObservableValue, _Atom);
    var _proto = ObservableValue.prototype;
    _proto.dehanceValue = function(value) {
        if (void 0 !== this.dehancer) return this.dehancer(value);
        return value;
    };
    _proto.set = function(newValue) {
        var oldValue = this.value_;
        newValue = this.prepareNewValue_(newValue);
        if (newValue !== globalState.UNCHANGED) {
            var notifySpy = isSpyEnabled();
            if ("production" !== process.env.NODE_ENV && notifySpy) spyReportStart({
                type: UPDATE,
                object: this,
                observableKind: "value",
                debugObjectName: this.name_,
                newValue: newValue,
                oldValue: oldValue
            });
            this.setNewValue_(newValue);
            if ("production" !== process.env.NODE_ENV && notifySpy) spyReportEnd();
        }
    };
    _proto.prepareNewValue_ = function(newValue) {
        checkIfStateModificationsAreAllowed(this);
        if (hasInterceptors(this)) {
            var change = interceptChange(this, {
                object: this,
                type: UPDATE,
                newValue: newValue
            });
            if (!change) return globalState.UNCHANGED;
            newValue = change.newValue;
        }
        newValue = this.enhancer(newValue, this.value_, this.name_);
        return this.equals(this.value_, newValue) ? globalState.UNCHANGED : newValue;
    };
    _proto.setNewValue_ = function(newValue) {
        var oldValue = this.value_;
        this.value_ = newValue;
        this.reportChanged();
        if (hasListeners(this)) notifyListeners(this, {
            type: UPDATE,
            object: this,
            newValue: newValue,
            oldValue: oldValue
        });
    };
    _proto.get = function() {
        this.reportObserved();
        return this.dehanceValue(this.value_);
    };
    _proto.intercept_ = function(handler) {
        return registerInterceptor(this, handler);
    };
    _proto.observe_ = function(listener, fireImmediately) {
        if (fireImmediately) listener({
            observableKind: "value",
            debugObjectName: this.name_,
            object: this,
            type: UPDATE,
            newValue: this.value_,
            oldValue: void 0
        });
        return registerListener(this, listener);
    };
    _proto.raw = function() {
        return this.value_;
    };
    _proto.toJSON = function() {
        return this.get();
    };
    _proto.toString = function() {
        return this.name_ + "[" + this.value_ + "]";
    };
    _proto.valueOf = function() {
        return toPrimitive(this.get());
    };
    _proto[Symbol.toPrimitive] = function() {
        return this.valueOf();
    };
    return ObservableValue;
}(mobx_esm_Atom);
var mobx_esm_ComputedValue = /*#__PURE__*/ function() {
    function ComputedValue(options) {
        this.dependenciesState_ = mobx_esm_IDerivationState_.NOT_TRACKING_;
        this.observing_ = [];
        this.newObserving_ = null;
        this.observers_ = new Set();
        this.runId_ = 0;
        this.lastAccessedBy_ = 0;
        this.lowestObserverState_ = mobx_esm_IDerivationState_.UP_TO_DATE_;
        this.unboundDepsCount_ = 0;
        this.value_ = new mobx_esm_CaughtException(null);
        this.name_ = void 0;
        this.triggeredBy_ = void 0;
        this.flags_ = 0;
        this.derivation = void 0;
        this.setter_ = void 0;
        this.isTracing_ = mobx_esm_TraceMode.NONE;
        this.scope_ = void 0;
        this.equals_ = void 0;
        this.requiresReaction_ = void 0;
        this.keepAlive_ = void 0;
        this.onBOL = void 0;
        this.onBUOL = void 0;
        if (!options.get) die(31);
        this.derivation = options.get;
        this.name_ = options.name || ("production" !== process.env.NODE_ENV ? "ComputedValue@" + getNextId() : "ComputedValue");
        if (options.set) this.setter_ = createAction("production" !== process.env.NODE_ENV ? this.name_ + "-setter" : "ComputedValue-setter", options.set);
        this.equals_ = options.equals || (options.compareStructural || options.struct ? comparer.structural : comparer["default"]);
        this.scope_ = options.context;
        this.requiresReaction_ = options.requiresReaction;
        this.keepAlive_ = !!options.keepAlive;
    }
    var _proto = ComputedValue.prototype;
    _proto.onBecomeStale_ = function() {
        propagateMaybeChanged(this);
    };
    _proto.onBO = function() {
        if (this.onBOL) this.onBOL.forEach(function(listener) {
            return listener();
        });
    };
    _proto.onBUO = function() {
        if (this.onBUOL) this.onBUOL.forEach(function(listener) {
            return listener();
        });
    };
    _proto.get = function() {
        if (this.isComputing) die(32, this.name_, this.derivation);
        if (0 !== globalState.inBatch || 0 !== this.observers_.size || this.keepAlive_) {
            reportObserved(this);
            if (shouldCompute(this)) {
                var prevTrackingContext = globalState.trackingContext;
                if (this.keepAlive_ && !prevTrackingContext) globalState.trackingContext = this;
                if (this.trackAndCompute()) propagateChangeConfirmed(this);
                globalState.trackingContext = prevTrackingContext;
            }
        } else if (shouldCompute(this)) {
            this.warnAboutUntrackedRead_();
            startBatch();
            this.value_ = this.computeValue_(false);
            endBatch();
        }
        var result = this.value_;
        if (isCaughtException(result)) throw result.cause;
        return result;
    };
    _proto.set = function(value) {
        if (this.setter_) {
            if (this.isRunningSetter) die(33, this.name_);
            this.isRunningSetter = true;
            try {
                this.setter_.call(this.scope_, value);
            } finally{
                this.isRunningSetter = false;
            }
        } else die(34, this.name_);
    };
    _proto.trackAndCompute = function() {
        var oldValue = this.value_;
        var wasSuspended = this.dependenciesState_ === mobx_esm_IDerivationState_.NOT_TRACKING_;
        var newValue = this.computeValue_(true);
        var changed = wasSuspended || isCaughtException(oldValue) || isCaughtException(newValue) || !this.equals_(oldValue, newValue);
        if (changed) {
            this.value_ = newValue;
            if ("production" !== process.env.NODE_ENV && isSpyEnabled()) spyReport({
                observableKind: "computed",
                debugObjectName: this.name_,
                object: this.scope_,
                type: "update",
                oldValue: oldValue,
                newValue: newValue
            });
        }
        return changed;
    };
    _proto.computeValue_ = function(track) {
        this.isComputing = true;
        var prev = allowStateChangesStart(false);
        var res;
        if (track) res = trackDerivedFunction(this, this.derivation, this.scope_);
        else if (true === globalState.disableErrorBoundaries) res = this.derivation.call(this.scope_);
        else try {
            res = this.derivation.call(this.scope_);
        } catch (e) {
            res = new mobx_esm_CaughtException(e);
        }
        allowStateChangesEnd(prev);
        this.isComputing = false;
        return res;
    };
    _proto.suspend_ = function() {
        if (!this.keepAlive_) {
            clearObserving(this);
            this.value_ = void 0;
            if ("production" !== process.env.NODE_ENV && this.isTracing_ !== mobx_esm_TraceMode.NONE) console.log("[mobx.trace] Computed value '" + this.name_ + "' was suspended and it will recompute on the next access.");
        }
    };
    _proto.observe_ = function(listener, fireImmediately) {
        var _this = this;
        var firstTime = true;
        var prevValue = void 0;
        return mobx_esm_autorun(function() {
            var newValue = _this.get();
            if (!firstTime || fireImmediately) {
                var prevU = untrackedStart();
                listener({
                    observableKind: "computed",
                    debugObjectName: _this.name_,
                    type: UPDATE,
                    object: _this,
                    newValue: newValue,
                    oldValue: prevValue
                });
                untrackedEnd(prevU);
            }
            firstTime = false;
            prevValue = newValue;
        });
    };
    _proto.warnAboutUntrackedRead_ = function() {
        if (!("production" !== process.env.NODE_ENV)) return;
        if (this.isTracing_ !== mobx_esm_TraceMode.NONE) console.log("[mobx.trace] Computed value '" + this.name_ + "' is being read outside a reactive context. Doing a full recompute.");
        if ("boolean" == typeof this.requiresReaction_ ? this.requiresReaction_ : globalState.computedRequiresReaction) console.warn("[mobx] Computed value '" + this.name_ + "' is being read outside a reactive context. Doing a full recompute.");
    };
    _proto.toString = function() {
        return this.name_ + "[" + this.derivation.toString() + "]";
    };
    _proto.valueOf = function() {
        return toPrimitive(this.get());
    };
    _proto[Symbol.toPrimitive] = function() {
        return this.valueOf();
    };
    return _createClass(ComputedValue, [
        {
            key: "isComputing",
            get: function() {
                return getFlag(this.flags_, ComputedValue.isComputingMask_);
            },
            set: function(newValue) {
                this.flags_ = setFlag(this.flags_, ComputedValue.isComputingMask_, newValue);
            }
        },
        {
            key: "isRunningSetter",
            get: function() {
                return getFlag(this.flags_, ComputedValue.isRunningSetterMask_);
            },
            set: function(newValue) {
                this.flags_ = setFlag(this.flags_, ComputedValue.isRunningSetterMask_, newValue);
            }
        },
        {
            key: "isBeingObserved",
            get: function() {
                return getFlag(this.flags_, ComputedValue.isBeingObservedMask_);
            },
            set: function(newValue) {
                this.flags_ = setFlag(this.flags_, ComputedValue.isBeingObservedMask_, newValue);
            }
        },
        {
            key: "isPendingUnobservation",
            get: function() {
                return getFlag(this.flags_, ComputedValue.isPendingUnobservationMask_);
            },
            set: function(newValue) {
                this.flags_ = setFlag(this.flags_, ComputedValue.isPendingUnobservationMask_, newValue);
            }
        },
        {
            key: "diffValue",
            get: function() {
                return getFlag(this.flags_, ComputedValue.diffValueMask_) ? 1 : 0;
            },
            set: function(newValue) {
                this.flags_ = setFlag(this.flags_, ComputedValue.diffValueMask_, 1 === newValue);
            }
        }
    ]);
}();
mobx_esm_ComputedValue.isComputingMask_ = 1;
mobx_esm_ComputedValue.isRunningSetterMask_ = 2;
mobx_esm_ComputedValue.isBeingObservedMask_ = 4;
mobx_esm_ComputedValue.isPendingUnobservationMask_ = 8;
mobx_esm_ComputedValue.diffValueMask_ = 16;
var isComputedValue = /*#__PURE__*/ createInstanceofPredicate("ComputedValue", mobx_esm_ComputedValue);
var mobx_esm_IDerivationState_;
(function(IDerivationState_) {
    IDerivationState_[IDerivationState_["NOT_TRACKING_"] = -1] = "NOT_TRACKING_";
    IDerivationState_[IDerivationState_["UP_TO_DATE_"] = 0] = "UP_TO_DATE_";
    IDerivationState_[IDerivationState_["POSSIBLY_STALE_"] = 1] = "POSSIBLY_STALE_";
    IDerivationState_[IDerivationState_["STALE_"] = 2] = "STALE_";
})(mobx_esm_IDerivationState_ || (mobx_esm_IDerivationState_ = {}));
var mobx_esm_TraceMode;
(function(TraceMode) {
    TraceMode[TraceMode["NONE"] = 0] = "NONE";
    TraceMode[TraceMode["LOG"] = 1] = "LOG";
    TraceMode[TraceMode["BREAK"] = 2] = "BREAK";
})(mobx_esm_TraceMode || (mobx_esm_TraceMode = {}));
var mobx_esm_CaughtException = function(cause) {
    this.cause = void 0;
    this.cause = cause;
};
function isCaughtException(e) {
    return e instanceof mobx_esm_CaughtException;
}
function shouldCompute(derivation) {
    switch(derivation.dependenciesState_){
        case mobx_esm_IDerivationState_.UP_TO_DATE_:
            return false;
        case mobx_esm_IDerivationState_.NOT_TRACKING_:
        case mobx_esm_IDerivationState_.STALE_:
            return true;
        case mobx_esm_IDerivationState_.POSSIBLY_STALE_:
            var prevAllowStateReads = allowStateReadsStart(true);
            var prevUntracked = untrackedStart();
            var obs = derivation.observing_, l = obs.length;
            for(var i = 0; i < l; i++){
                var obj = obs[i];
                if (isComputedValue(obj)) {
                    if (globalState.disableErrorBoundaries) obj.get();
                    else try {
                        obj.get();
                    } catch (e) {
                        untrackedEnd(prevUntracked);
                        allowStateReadsEnd(prevAllowStateReads);
                        return true;
                    }
                    if (derivation.dependenciesState_ === mobx_esm_IDerivationState_.STALE_) {
                        untrackedEnd(prevUntracked);
                        allowStateReadsEnd(prevAllowStateReads);
                        return true;
                    }
                }
            }
            changeDependenciesStateTo0(derivation);
            untrackedEnd(prevUntracked);
            allowStateReadsEnd(prevAllowStateReads);
            return false;
    }
}
function checkIfStateModificationsAreAllowed(atom) {
    if (!("production" !== process.env.NODE_ENV)) return;
    var hasObservers = atom.observers_.size > 0;
    if (!globalState.allowStateChanges && (hasObservers || "always" === globalState.enforceActions)) console.warn("[MobX] " + (globalState.enforceActions ? "Since strict-mode is enabled, changing (observed) observable values without using an action is not allowed. Tried to modify: " : "Side effects like changing state are not allowed at this point. Are you trying to modify state from, for example, a computed value or the render function of a React component? You can wrap side effects in 'runInAction' (or decorate functions with 'action') if needed. Tried to modify: ") + atom.name_);
}
function checkIfStateReadsAreAllowed(observable) {
    if ("production" !== process.env.NODE_ENV && !globalState.allowStateReads && globalState.observableRequiresReaction) console.warn("[mobx] Observable '" + observable.name_ + "' being read outside a reactive context.");
}
function trackDerivedFunction(derivation, f, context) {
    var prevAllowStateReads = allowStateReadsStart(true);
    changeDependenciesStateTo0(derivation);
    derivation.newObserving_ = new Array(0 === derivation.runId_ ? 100 : derivation.observing_.length);
    derivation.unboundDepsCount_ = 0;
    derivation.runId_ = ++globalState.runId;
    var prevTracking = globalState.trackingDerivation;
    globalState.trackingDerivation = derivation;
    globalState.inBatch++;
    var result;
    if (true === globalState.disableErrorBoundaries) result = f.call(context);
    else try {
        result = f.call(context);
    } catch (e) {
        result = new mobx_esm_CaughtException(e);
    }
    globalState.inBatch--;
    globalState.trackingDerivation = prevTracking;
    bindDependencies(derivation);
    warnAboutDerivationWithoutDependencies(derivation);
    allowStateReadsEnd(prevAllowStateReads);
    return result;
}
function warnAboutDerivationWithoutDependencies(derivation) {
    if (!("production" !== process.env.NODE_ENV)) return;
    if (0 !== derivation.observing_.length) return;
    if ("boolean" == typeof derivation.requiresObservable_ ? derivation.requiresObservable_ : globalState.reactionRequiresObservable) console.warn("[mobx] Derivation '" + derivation.name_ + "' is created/updated without reading any observable value.");
}
function bindDependencies(derivation) {
    var prevObserving = derivation.observing_;
    var observing = derivation.observing_ = derivation.newObserving_;
    var lowestNewObservingDerivationState = mobx_esm_IDerivationState_.UP_TO_DATE_;
    var i0 = 0, l = derivation.unboundDepsCount_;
    for(var i = 0; i < l; i++){
        var dep = observing[i];
        if (0 === dep.diffValue) {
            dep.diffValue = 1;
            if (i0 !== i) observing[i0] = dep;
            i0++;
        }
        if (dep.dependenciesState_ > lowestNewObservingDerivationState) lowestNewObservingDerivationState = dep.dependenciesState_;
    }
    observing.length = i0;
    derivation.newObserving_ = null;
    l = prevObserving.length;
    while(l--){
        var _dep = prevObserving[l];
        if (0 === _dep.diffValue) removeObserver(_dep, derivation);
        _dep.diffValue = 0;
    }
    while(i0--){
        var _dep2 = observing[i0];
        if (1 === _dep2.diffValue) {
            _dep2.diffValue = 0;
            addObserver(_dep2, derivation);
        }
    }
    if (lowestNewObservingDerivationState !== mobx_esm_IDerivationState_.UP_TO_DATE_) {
        derivation.dependenciesState_ = lowestNewObservingDerivationState;
        derivation.onBecomeStale_();
    }
}
function clearObserving(derivation) {
    var obs = derivation.observing_;
    derivation.observing_ = [];
    var i = obs.length;
    while(i--)removeObserver(obs[i], derivation);
    derivation.dependenciesState_ = mobx_esm_IDerivationState_.NOT_TRACKING_;
}
function untracked(action) {
    var prev = untrackedStart();
    try {
        return action();
    } finally{
        untrackedEnd(prev);
    }
}
function untrackedStart() {
    var prev = globalState.trackingDerivation;
    globalState.trackingDerivation = null;
    return prev;
}
function untrackedEnd(prev) {
    globalState.trackingDerivation = prev;
}
function allowStateReadsStart(allowStateReads) {
    var prev = globalState.allowStateReads;
    globalState.allowStateReads = allowStateReads;
    return prev;
}
function allowStateReadsEnd(prev) {
    globalState.allowStateReads = prev;
}
function changeDependenciesStateTo0(derivation) {
    if (derivation.dependenciesState_ === mobx_esm_IDerivationState_.UP_TO_DATE_) return;
    derivation.dependenciesState_ = mobx_esm_IDerivationState_.UP_TO_DATE_;
    var obs = derivation.observing_;
    var i = obs.length;
    while(i--)obs[i].lowestObserverState_ = mobx_esm_IDerivationState_.UP_TO_DATE_;
}
var mobx_esm_MobXGlobals = function() {
    this.version = 6;
    this.UNCHANGED = {};
    this.trackingDerivation = null;
    this.trackingContext = null;
    this.runId = 0;
    this.mobxGuid = 0;
    this.inBatch = 0;
    this.pendingUnobservations = [];
    this.pendingReactions = [];
    this.isRunningReactions = false;
    this.allowStateChanges = false;
    this.allowStateReads = true;
    this.enforceActions = true;
    this.spyListeners = [];
    this.globalReactionErrorHandlers = [];
    this.computedRequiresReaction = false;
    this.reactionRequiresObservable = false;
    this.observableRequiresReaction = false;
    this.disableErrorBoundaries = false;
    this.suppressReactionErrors = false;
    this.useProxies = true;
    this.verifyProxies = false;
    this.safeDescriptors = true;
};
var canMergeGlobalState = true;
var isolateCalled = false;
var globalState = /*#__PURE__*/ function() {
    var global = /*#__PURE__*/ getGlobal();
    if (global.__mobxInstanceCount > 0 && !global.__mobxGlobals) canMergeGlobalState = false;
    if (global.__mobxGlobals && global.__mobxGlobals.version !== new mobx_esm_MobXGlobals().version) canMergeGlobalState = false;
    if (canMergeGlobalState) if (global.__mobxGlobals) {
        global.__mobxInstanceCount += 1;
        if (!global.__mobxGlobals.UNCHANGED) global.__mobxGlobals.UNCHANGED = {};
        return global.__mobxGlobals;
    } else {
        global.__mobxInstanceCount = 1;
        return global.__mobxGlobals = /*#__PURE__*/ new mobx_esm_MobXGlobals();
    }
    setTimeout(function() {
        if (!isolateCalled) die(35);
    }, 1);
    return new mobx_esm_MobXGlobals();
}();
function isolateGlobalState() {
    if (globalState.pendingReactions.length || globalState.inBatch || globalState.isRunningReactions) die(36);
    isolateCalled = true;
    if (canMergeGlobalState) {
        var global = getGlobal();
        if (0 === --global.__mobxInstanceCount) global.__mobxGlobals = void 0;
        globalState = new mobx_esm_MobXGlobals();
    }
}
function addObserver(observable, node) {
    observable.observers_.add(node);
    if (observable.lowestObserverState_ > node.dependenciesState_) observable.lowestObserverState_ = node.dependenciesState_;
}
function removeObserver(observable, node) {
    observable.observers_["delete"](node);
    if (0 === observable.observers_.size) queueForUnobservation(observable);
}
function queueForUnobservation(observable) {
    if (false === observable.isPendingUnobservation) {
        observable.isPendingUnobservation = true;
        globalState.pendingUnobservations.push(observable);
    }
}
function startBatch() {
    globalState.inBatch++;
}
function endBatch() {
    if (0 === --globalState.inBatch) {
        runReactions();
        var list = globalState.pendingUnobservations;
        for(var i = 0; i < list.length; i++){
            var observable = list[i];
            observable.isPendingUnobservation = false;
            if (0 === observable.observers_.size) {
                if (observable.isBeingObserved) {
                    observable.isBeingObserved = false;
                    observable.onBUO();
                }
                if (observable instanceof mobx_esm_ComputedValue) observable.suspend_();
            }
        }
        globalState.pendingUnobservations = [];
    }
}
function reportObserved(observable) {
    checkIfStateReadsAreAllowed(observable);
    var derivation = globalState.trackingDerivation;
    if (null !== derivation) {
        if (derivation.runId_ !== observable.lastAccessedBy_) {
            observable.lastAccessedBy_ = derivation.runId_;
            derivation.newObserving_[derivation.unboundDepsCount_++] = observable;
            if (!observable.isBeingObserved && globalState.trackingContext) {
                observable.isBeingObserved = true;
                observable.onBO();
            }
        }
        return observable.isBeingObserved;
    }
    if (0 === observable.observers_.size && globalState.inBatch > 0) queueForUnobservation(observable);
    return false;
}
function propagateChanged(observable) {
    if (observable.lowestObserverState_ === mobx_esm_IDerivationState_.STALE_) return;
    observable.lowestObserverState_ = mobx_esm_IDerivationState_.STALE_;
    observable.observers_.forEach(function(d) {
        if (d.dependenciesState_ === mobx_esm_IDerivationState_.UP_TO_DATE_) {
            if ("production" !== process.env.NODE_ENV && d.isTracing_ !== mobx_esm_TraceMode.NONE) logTraceInfo(d, observable);
            d.onBecomeStale_();
        }
        d.dependenciesState_ = mobx_esm_IDerivationState_.STALE_;
    });
}
function propagateChangeConfirmed(observable) {
    if (observable.lowestObserverState_ === mobx_esm_IDerivationState_.STALE_) return;
    observable.lowestObserverState_ = mobx_esm_IDerivationState_.STALE_;
    observable.observers_.forEach(function(d) {
        if (d.dependenciesState_ === mobx_esm_IDerivationState_.POSSIBLY_STALE_) {
            d.dependenciesState_ = mobx_esm_IDerivationState_.STALE_;
            if ("production" !== process.env.NODE_ENV && d.isTracing_ !== mobx_esm_TraceMode.NONE) logTraceInfo(d, observable);
        } else if (d.dependenciesState_ === mobx_esm_IDerivationState_.UP_TO_DATE_) observable.lowestObserverState_ = mobx_esm_IDerivationState_.UP_TO_DATE_;
    });
}
function propagateMaybeChanged(observable) {
    if (observable.lowestObserverState_ !== mobx_esm_IDerivationState_.UP_TO_DATE_) return;
    observable.lowestObserverState_ = mobx_esm_IDerivationState_.POSSIBLY_STALE_;
    observable.observers_.forEach(function(d) {
        if (d.dependenciesState_ === mobx_esm_IDerivationState_.UP_TO_DATE_) {
            d.dependenciesState_ = mobx_esm_IDerivationState_.POSSIBLY_STALE_;
            d.onBecomeStale_();
        }
    });
}
function logTraceInfo(derivation, observable) {
    console.log("[mobx.trace] '" + derivation.name_ + "' is invalidated due to a change in: '" + observable.name_ + "'");
    if (derivation.isTracing_ === mobx_esm_TraceMode.BREAK) {
        var lines = [];
        printDepTree(getDependencyTree(derivation), lines, 1);
        new Function("debugger;\n/*\nTracing '" + derivation.name_ + "'\n\nYou are entering this break point because derivation '" + derivation.name_ + "' is being traced and '" + observable.name_ + "' is now forcing it to update.\nJust follow the stacktrace you should now see in the devtools to see precisely what piece of your code is causing this update\nThe stackframe you are looking for is at least ~6-8 stack-frames up.\n\n" + (derivation instanceof mobx_esm_ComputedValue ? derivation.derivation.toString().replace(/[*]\//g, "/") : "") + "\n\nThe dependencies for this derivation are:\n\n" + lines.join("\n") + "\n*/\n    ")();
    }
}
function printDepTree(tree, lines, depth) {
    if (lines.length >= 1000) return void lines.push("(and many more)");
    lines.push("" + "\t".repeat(depth - 1) + tree.name);
    if (tree.dependencies) tree.dependencies.forEach(function(child) {
        return printDepTree(child, lines, depth + 1);
    });
}
var mobx_esm_Reaction = /*#__PURE__*/ function() {
    function Reaction(name_, onInvalidate_, errorHandler_, requiresObservable_) {
        if (void 0 === name_) name_ = "production" !== process.env.NODE_ENV ? "Reaction@" + getNextId() : "Reaction";
        this.name_ = void 0;
        this.onInvalidate_ = void 0;
        this.errorHandler_ = void 0;
        this.requiresObservable_ = void 0;
        this.observing_ = [];
        this.newObserving_ = [];
        this.dependenciesState_ = mobx_esm_IDerivationState_.NOT_TRACKING_;
        this.runId_ = 0;
        this.unboundDepsCount_ = 0;
        this.flags_ = 0;
        this.isTracing_ = mobx_esm_TraceMode.NONE;
        this.name_ = name_;
        this.onInvalidate_ = onInvalidate_;
        this.errorHandler_ = errorHandler_;
        this.requiresObservable_ = requiresObservable_;
    }
    var _proto = Reaction.prototype;
    _proto.onBecomeStale_ = function() {
        this.schedule_();
    };
    _proto.schedule_ = function() {
        if (!this.isScheduled) {
            this.isScheduled = true;
            globalState.pendingReactions.push(this);
            runReactions();
        }
    };
    _proto.runReaction_ = function() {
        if (!this.isDisposed) {
            startBatch();
            this.isScheduled = false;
            var prev = globalState.trackingContext;
            globalState.trackingContext = this;
            if (shouldCompute(this)) {
                this.isTrackPending = true;
                try {
                    this.onInvalidate_();
                    if ("production" !== process.env.NODE_ENV && this.isTrackPending && isSpyEnabled()) spyReport({
                        name: this.name_,
                        type: "scheduled-reaction"
                    });
                } catch (e) {
                    this.reportExceptionInDerivation_(e);
                }
            }
            globalState.trackingContext = prev;
            endBatch();
        }
    };
    _proto.track = function(fn) {
        if (this.isDisposed) return;
        startBatch();
        var notify = isSpyEnabled();
        var startTime;
        if ("production" !== process.env.NODE_ENV && notify) {
            startTime = Date.now();
            spyReportStart({
                name: this.name_,
                type: "reaction"
            });
        }
        this.isRunning = true;
        var prevReaction = globalState.trackingContext;
        globalState.trackingContext = this;
        var result = trackDerivedFunction(this, fn, void 0);
        globalState.trackingContext = prevReaction;
        this.isRunning = false;
        this.isTrackPending = false;
        if (this.isDisposed) clearObserving(this);
        if (isCaughtException(result)) this.reportExceptionInDerivation_(result.cause);
        if ("production" !== process.env.NODE_ENV && notify) spyReportEnd({
            time: Date.now() - startTime
        });
        endBatch();
    };
    _proto.reportExceptionInDerivation_ = function(error) {
        var _this = this;
        if (this.errorHandler_) return void this.errorHandler_(error, this);
        if (globalState.disableErrorBoundaries) throw error;
        var message = "production" !== process.env.NODE_ENV ? "[mobx] Encountered an uncaught exception that was thrown by a reaction or observer component, in: '" + this + "'" : "[mobx] uncaught error in '" + this + "'";
        if (globalState.suppressReactionErrors) {
            if ("production" !== process.env.NODE_ENV) console.warn("[mobx] (error in reaction '" + this.name_ + "' suppressed, fix error of causing action below)");
        } else console.error(message, error);
        if ("production" !== process.env.NODE_ENV && isSpyEnabled()) spyReport({
            type: "error",
            name: this.name_,
            message: message,
            error: "" + error
        });
        globalState.globalReactionErrorHandlers.forEach(function(f) {
            return f(error, _this);
        });
    };
    _proto.dispose = function() {
        if (!this.isDisposed) {
            this.isDisposed = true;
            if (!this.isRunning) {
                startBatch();
                clearObserving(this);
                endBatch();
            }
        }
    };
    _proto.getDisposer_ = function(abortSignal) {
        var _this2 = this;
        var dispose = function dispose() {
            _this2.dispose();
            null == abortSignal || null == abortSignal.removeEventListener || abortSignal.removeEventListener("abort", dispose);
        };
        null == abortSignal || null == abortSignal.addEventListener || abortSignal.addEventListener("abort", dispose);
        dispose[$mobx] = this;
        if ("dispose" in Symbol && "symbol" == typeof Symbol.dispose) dispose[Symbol.dispose] = dispose;
        return dispose;
    };
    _proto.toString = function() {
        return "Reaction[" + this.name_ + "]";
    };
    _proto.trace = function(enterBreakPoint) {
        if (void 0 === enterBreakPoint) enterBreakPoint = false;
        trace(this, enterBreakPoint);
    };
    return _createClass(Reaction, [
        {
            key: "isDisposed",
            get: function() {
                return getFlag(this.flags_, Reaction.isDisposedMask_);
            },
            set: function(newValue) {
                this.flags_ = setFlag(this.flags_, Reaction.isDisposedMask_, newValue);
            }
        },
        {
            key: "isScheduled",
            get: function() {
                return getFlag(this.flags_, Reaction.isScheduledMask_);
            },
            set: function(newValue) {
                this.flags_ = setFlag(this.flags_, Reaction.isScheduledMask_, newValue);
            }
        },
        {
            key: "isTrackPending",
            get: function() {
                return getFlag(this.flags_, Reaction.isTrackPendingMask_);
            },
            set: function(newValue) {
                this.flags_ = setFlag(this.flags_, Reaction.isTrackPendingMask_, newValue);
            }
        },
        {
            key: "isRunning",
            get: function() {
                return getFlag(this.flags_, Reaction.isRunningMask_);
            },
            set: function(newValue) {
                this.flags_ = setFlag(this.flags_, Reaction.isRunningMask_, newValue);
            }
        },
        {
            key: "diffValue",
            get: function() {
                return getFlag(this.flags_, Reaction.diffValueMask_) ? 1 : 0;
            },
            set: function(newValue) {
                this.flags_ = setFlag(this.flags_, Reaction.diffValueMask_, 1 === newValue);
            }
        }
    ]);
}();
mobx_esm_Reaction.isDisposedMask_ = 1;
mobx_esm_Reaction.isScheduledMask_ = 2;
mobx_esm_Reaction.isTrackPendingMask_ = 4;
mobx_esm_Reaction.isRunningMask_ = 8;
mobx_esm_Reaction.diffValueMask_ = 16;
var MAX_REACTION_ITERATIONS = 100;
var mobx_esm_reactionScheduler = function(f) {
    return f();
};
function runReactions() {
    if (globalState.inBatch > 0 || globalState.isRunningReactions) return;
    mobx_esm_reactionScheduler(runReactionsHelper);
}
function runReactionsHelper() {
    globalState.isRunningReactions = true;
    var allReactions = globalState.pendingReactions;
    var iterations = 0;
    while(allReactions.length > 0){
        if (++iterations === MAX_REACTION_ITERATIONS) {
            console.error("production" !== process.env.NODE_ENV ? "Reaction doesn't converge to a stable state after " + MAX_REACTION_ITERATIONS + " iterations. Probably there is a cycle in the reactive function: " + allReactions[0] : "[mobx] cycle in reaction: " + allReactions[0]);
            allReactions.splice(0);
        }
        var remainingReactions = allReactions.splice(0);
        for(var i = 0, l = remainingReactions.length; i < l; i++)remainingReactions[i].runReaction_();
    }
    globalState.isRunningReactions = false;
}
var isReaction = /*#__PURE__*/ createInstanceofPredicate("Reaction", mobx_esm_Reaction);
function setReactionScheduler(fn) {
    var baseScheduler = mobx_esm_reactionScheduler;
    mobx_esm_reactionScheduler = function(f) {
        return fn(function() {
            return baseScheduler(f);
        });
    };
}
function isSpyEnabled() {
    return "production" !== process.env.NODE_ENV && !!globalState.spyListeners.length;
}
function spyReport(event) {
    if (!("production" !== process.env.NODE_ENV)) return;
    if (!globalState.spyListeners.length) return;
    var listeners = globalState.spyListeners;
    for(var i = 0, l = listeners.length; i < l; i++)listeners[i](event);
}
function spyReportStart(event) {
    if (!("production" !== process.env.NODE_ENV)) return;
    var change = _extends({}, event, {
        spyReportStart: true
    });
    spyReport(change);
}
var END_EVENT = {
    type: "report-end",
    spyReportEnd: true
};
function spyReportEnd(change) {
    if (!("production" !== process.env.NODE_ENV)) return;
    change ? spyReport(_extends({}, change, {
        type: "report-end",
        spyReportEnd: true
    })) : spyReport(END_EVENT);
}
function spy(listener) {
    if ("production" !== process.env.NODE_ENV) {
        globalState.spyListeners.push(listener);
        return once(function() {
            globalState.spyListeners = globalState.spyListeners.filter(function(l) {
                return l !== listener;
            });
        });
    }
    console.warn("[mobx.spy] Is a no-op in production builds");
    return function() {};
}
var ACTION = "action";
var ACTION_BOUND = "action.bound";
var AUTOACTION = "autoAction";
var AUTOACTION_BOUND = "autoAction.bound";
var DEFAULT_ACTION_NAME = "<unnamed action>";
var mobx_esm_actionAnnotation = /*#__PURE__*/ createActionAnnotation(ACTION);
var actionBoundAnnotation = /*#__PURE__*/ createActionAnnotation(ACTION_BOUND, {
    bound: true
});
var autoActionAnnotation = /*#__PURE__*/ createActionAnnotation(AUTOACTION, {
    autoAction: true
});
var autoActionBoundAnnotation = /*#__PURE__*/ createActionAnnotation(AUTOACTION_BOUND, {
    autoAction: true,
    bound: true
});
function createActionFactory(autoAction) {
    var res = function(arg1, arg2) {
        if (isFunction(arg1)) return createAction(arg1.name || DEFAULT_ACTION_NAME, arg1, autoAction);
        if (isFunction(arg2)) return createAction(arg1, arg2, autoAction);
        if (is20223Decorator(arg2)) return (autoAction ? autoActionAnnotation : mobx_esm_actionAnnotation).decorate_20223_(arg1, arg2);
        if (isStringish(arg2)) return storeAnnotation(arg1, arg2, autoAction ? autoActionAnnotation : mobx_esm_actionAnnotation);
        if (isStringish(arg1)) return createDecoratorAnnotation(createActionAnnotation(autoAction ? AUTOACTION : ACTION, {
            name: arg1,
            autoAction: autoAction
        }));
        if ("production" !== process.env.NODE_ENV) die("Invalid arguments for `action`");
    };
    return res;
}
var mobx_esm_action = /*#__PURE__*/ createActionFactory(false);
Object.assign(mobx_esm_action, mobx_esm_actionAnnotation);
var mobx_esm_autoAction = /*#__PURE__*/ createActionFactory(true);
Object.assign(mobx_esm_autoAction, autoActionAnnotation);
mobx_esm_action.bound = /*#__PURE__*/ createDecoratorAnnotation(actionBoundAnnotation);
mobx_esm_autoAction.bound = /*#__PURE__*/ createDecoratorAnnotation(autoActionBoundAnnotation);
function mobx_esm_runInAction(fn) {
    return executeAction(fn.name || DEFAULT_ACTION_NAME, false, fn, this, void 0);
}
function mobx_esm_isAction(thing) {
    return isFunction(thing) && true === thing.isMobxAction;
}
function mobx_esm_autorun(view, opts) {
    var _opts$name, _opts, _opts2, _opts3;
    if (void 0 === opts) opts = EMPTY_OBJECT;
    if ("production" !== process.env.NODE_ENV) {
        if (!isFunction(view)) die("Autorun expects a function as first argument");
        if (mobx_esm_isAction(view)) die("Autorun does not accept actions since actions are untrackable");
    }
    var name1 = null != (_opts$name = null == (_opts = opts) ? void 0 : _opts.name) ? _opts$name : "production" !== process.env.NODE_ENV ? view.name || "Autorun@" + getNextId() : "Autorun";
    var runSync = !opts.scheduler && !opts.delay;
    var reaction;
    if (runSync) reaction = new mobx_esm_Reaction(name1, function() {
        this.track(reactionRunner);
    }, opts.onError, opts.requiresObservable);
    else {
        var scheduler = createSchedulerFromOptions(opts);
        var isScheduled = false;
        reaction = new mobx_esm_Reaction(name1, function() {
            if (!isScheduled) {
                isScheduled = true;
                scheduler(function() {
                    isScheduled = false;
                    if (!reaction.isDisposed) reaction.track(reactionRunner);
                });
            }
        }, opts.onError, opts.requiresObservable);
    }
    function reactionRunner() {
        view(reaction);
    }
    if (!(null != (_opts2 = opts) && null != (_opts2 = _opts2.signal) && _opts2.aborted)) reaction.schedule_();
    return reaction.getDisposer_(null == (_opts3 = opts) ? void 0 : _opts3.signal);
}
var mobx_esm_run = function(f) {
    return f();
};
function createSchedulerFromOptions(opts) {
    return opts.scheduler ? opts.scheduler : opts.delay ? function(f) {
        return setTimeout(f, opts.delay);
    } : mobx_esm_run;
}
function mobx_esm_reaction(expression, effect, opts) {
    var _opts$name2, _opts4, _opts5;
    if (void 0 === opts) opts = EMPTY_OBJECT;
    if ("production" !== process.env.NODE_ENV) {
        if (!isFunction(expression) || !isFunction(effect)) die("First and second argument to reaction should be functions");
        if (!isPlainObject(opts)) die("Third argument of reactions should be an object");
    }
    var name1 = null != (_opts$name2 = opts.name) ? _opts$name2 : "production" !== process.env.NODE_ENV ? "Reaction@" + getNextId() : "Reaction";
    var effectAction = mobx_esm_action(name1, opts.onError ? wrapErrorHandler(opts.onError, effect) : effect);
    var runSync = !opts.scheduler && !opts.delay;
    var scheduler = createSchedulerFromOptions(opts);
    var firstTime = true;
    var isScheduled = false;
    var value;
    var equals = opts.compareStructural ? comparer.structural : opts.equals || comparer["default"];
    var r = new mobx_esm_Reaction(name1, function() {
        if (firstTime || runSync) reactionRunner();
        else if (!isScheduled) {
            isScheduled = true;
            scheduler(reactionRunner);
        }
    }, opts.onError, opts.requiresObservable);
    function reactionRunner() {
        isScheduled = false;
        if (r.isDisposed) return;
        var changed = false;
        var oldValue = value;
        r.track(function() {
            var nextValue = mobx_esm_allowStateChanges(false, function() {
                return expression(r);
            });
            changed = firstTime || !equals(value, nextValue);
            value = nextValue;
        });
        if (firstTime && opts.fireImmediately) effectAction(value, oldValue, r);
        else if (!firstTime && changed) effectAction(value, oldValue, r);
        firstTime = false;
    }
    if (!(null != (_opts4 = opts) && null != (_opts4 = _opts4.signal) && _opts4.aborted)) r.schedule_();
    return r.getDisposer_(null == (_opts5 = opts) ? void 0 : _opts5.signal);
}
function wrapErrorHandler(errorHandler, baseFn) {
    return function() {
        try {
            return baseFn.apply(this, arguments);
        } catch (e) {
            errorHandler.call(this, e);
        }
    };
}
var ON_BECOME_OBSERVED = "onBO";
var ON_BECOME_UNOBSERVED = "onBUO";
function onBecomeObserved(thing, arg2, arg3) {
    return interceptHook(ON_BECOME_OBSERVED, thing, arg2, arg3);
}
function mobx_esm_onBecomeUnobserved(thing, arg2, arg3) {
    return interceptHook(ON_BECOME_UNOBSERVED, thing, arg2, arg3);
}
function interceptHook(hook, thing, arg2, arg3) {
    var atom = "function" == typeof arg3 ? mobx_esm_getAtom(thing, arg2) : mobx_esm_getAtom(thing);
    var cb = isFunction(arg3) ? arg3 : arg2;
    var listenersKey = hook + "L";
    if (atom[listenersKey]) atom[listenersKey].add(cb);
    else atom[listenersKey] = new Set([
        cb
    ]);
    return function() {
        var hookListeners = atom[listenersKey];
        if (hookListeners) {
            hookListeners["delete"](cb);
            if (0 === hookListeners.size) delete atom[listenersKey];
        }
    };
}
var NEVER = "never";
var ALWAYS = "always";
var OBSERVED = "observed";
function configure(options) {
    if (true === options.isolateGlobalState) isolateGlobalState();
    var useProxies = options.useProxies, enforceActions = options.enforceActions;
    if (void 0 !== useProxies) globalState.useProxies = useProxies === ALWAYS ? true : useProxies === NEVER ? false : "undefined" != typeof Proxy;
    if ("ifavailable" === useProxies) globalState.verifyProxies = true;
    if (void 0 !== enforceActions) {
        var ea = enforceActions === ALWAYS ? ALWAYS : enforceActions === OBSERVED;
        globalState.enforceActions = ea;
        globalState.allowStateChanges = true !== ea && ea !== ALWAYS;
    }
    [
        "computedRequiresReaction",
        "reactionRequiresObservable",
        "observableRequiresReaction",
        "disableErrorBoundaries",
        "safeDescriptors"
    ].forEach(function(key) {
        if (key in options) globalState[key] = !!options[key];
    });
    globalState.allowStateReads = !globalState.observableRequiresReaction;
    if ("production" !== process.env.NODE_ENV && true === globalState.disableErrorBoundaries) console.warn("WARNING: Debug feature only. MobX will NOT recover from errors when `disableErrorBoundaries` is enabled.");
    if (options.reactionScheduler) setReactionScheduler(options.reactionScheduler);
}
function extendObservable(target, properties, annotations, options) {
    if ("production" !== process.env.NODE_ENV) {
        if (arguments.length > 4) die("'extendObservable' expected 2-4 arguments");
        if ("object" != typeof target) die("'extendObservable' expects an object as first argument");
        if (isObservableMap(target)) die("'extendObservable' should not be used on maps, use map.merge instead");
        if (!isPlainObject(properties)) die("'extendObservable' only accepts plain objects as second argument");
        if (isObservable(properties) || isObservable(annotations)) die("Extending an object with another observable (object) is not supported");
    }
    var descriptors = mobx_esm_getOwnPropertyDescriptors(properties);
    initObservable(function() {
        var adm = asObservableObject(target, options)[$mobx];
        mobx_esm_ownKeys(descriptors).forEach(function(key) {
            adm.extend_(key, descriptors[key], annotations ? key in annotations ? annotations[key] : true : true);
        });
    });
    return target;
}
function getDependencyTree(thing, property) {
    return nodeToDependencyTree(mobx_esm_getAtom(thing, property));
}
function nodeToDependencyTree(node) {
    var result = {
        name: node.name_
    };
    if (node.observing_ && node.observing_.length > 0) result.dependencies = unique(node.observing_).map(nodeToDependencyTree);
    return result;
}
function unique(list) {
    return Array.from(new Set(list));
}
var generatorId = 0;
function FlowCancellationError() {
    this.message = "FLOW_CANCELLED";
}
FlowCancellationError.prototype = /*#__PURE__*/ Object.create(Error.prototype);
var mobx_esm_flowAnnotation = /*#__PURE__*/ createFlowAnnotation("flow");
var flowBoundAnnotation = /*#__PURE__*/ createFlowAnnotation("flow.bound", {
    bound: true
});
var mobx_esm_flow = /*#__PURE__*/ Object.assign(function(arg1, arg2) {
    if (is20223Decorator(arg2)) return mobx_esm_flowAnnotation.decorate_20223_(arg1, arg2);
    if (isStringish(arg2)) return storeAnnotation(arg1, arg2, mobx_esm_flowAnnotation);
    if ("production" !== process.env.NODE_ENV && 1 !== arguments.length) die("Flow expects single argument with generator function");
    var generator = arg1;
    var name1 = generator.name || "<unnamed flow>";
    var res = function() {
        var ctx = this;
        var args = arguments;
        var runId = ++generatorId;
        var gen = mobx_esm_action(name1 + " - runid: " + runId + " - init", generator).apply(ctx, args);
        var rejector;
        var pendingPromise = void 0;
        var promise = new Promise(function(resolve, reject) {
            var stepId = 0;
            rejector = reject;
            function onFulfilled(res) {
                pendingPromise = void 0;
                var ret;
                try {
                    ret = mobx_esm_action(name1 + " - runid: " + runId + " - yield " + stepId++, gen.next).call(gen, res);
                } catch (e) {
                    return reject(e);
                }
                next(ret);
            }
            function onRejected(err) {
                pendingPromise = void 0;
                var ret;
                try {
                    ret = mobx_esm_action(name1 + " - runid: " + runId + " - yield " + stepId++, gen["throw"]).call(gen, err);
                } catch (e) {
                    return reject(e);
                }
                next(ret);
            }
            function next(ret) {
                if (isFunction(null == ret ? void 0 : ret.then)) return void ret.then(next, reject);
                if (ret.done) return resolve(ret.value);
                pendingPromise = Promise.resolve(ret.value);
                return pendingPromise.then(onFulfilled, onRejected);
            }
            onFulfilled(void 0);
        });
        promise.cancel = mobx_esm_action(name1 + " - runid: " + runId + " - cancel", function() {
            try {
                if (pendingPromise) cancelPromise(pendingPromise);
                var _res = gen["return"](void 0);
                var yieldedPromise = Promise.resolve(_res.value);
                yieldedPromise.then(mobx_esm_noop, mobx_esm_noop);
                cancelPromise(yieldedPromise);
                rejector(new FlowCancellationError());
            } catch (e) {
                rejector(e);
            }
        });
        return promise;
    };
    res.isMobXFlow = true;
    return res;
}, mobx_esm_flowAnnotation);
mobx_esm_flow.bound = /*#__PURE__*/ createDecoratorAnnotation(flowBoundAnnotation);
function cancelPromise(promise) {
    if (isFunction(promise.cancel)) promise.cancel();
}
function isFlow(fn) {
    return (null == fn ? void 0 : fn.isMobXFlow) === true;
}
function _isComputed(value, property) {
    if (void 0 === property) return isComputedValue(value);
    if (false === isObservableObject(value)) return false;
    if (!value[$mobx].values_.has(property)) return false;
    var atom = mobx_esm_getAtom(value, property);
    return isComputedValue(atom);
}
function isComputed(value) {
    if ("production" !== process.env.NODE_ENV && arguments.length > 1) return die("isComputed expects only 1 argument. Use isComputedProp to inspect the observability of a property");
    return _isComputed(value);
}
function isComputedProp(value, propName) {
    if ("production" !== process.env.NODE_ENV && !isStringish(propName)) return die("isComputed expected a property name as second argument");
    return _isComputed(value, propName);
}
function _isObservable(value, property) {
    if (!value) return false;
    if (void 0 !== property) {
        if ("production" !== process.env.NODE_ENV && (isObservableMap(value) || mobx_esm_isObservableArray(value))) return die("isObservable(object, propertyName) is not supported for arrays and maps. Use map.has or array.length instead.");
        if (isObservableObject(value)) return value[$mobx].values_.has(property);
        return false;
    }
    return isObservableObject(value) || !!value[$mobx] || isAtom(value) || isReaction(value) || isComputedValue(value);
}
function isObservable(value) {
    if ("production" !== process.env.NODE_ENV && 1 !== arguments.length) die("isObservable expects only 1 argument. Use isObservableProp to inspect the observability of a property");
    return _isObservable(value);
}
function mobx_esm_keys(obj) {
    if (isObservableObject(obj)) return obj[$mobx].keys_();
    if (isObservableMap(obj) || isObservableSet(obj)) return Array.from(obj.keys());
    if (mobx_esm_isObservableArray(obj)) return obj.map(function(_, index) {
        return index;
    });
    die(5);
}
function mobx_esm_values(obj) {
    if (isObservableObject(obj)) return mobx_esm_keys(obj).map(function(key) {
        return obj[key];
    });
    if (isObservableMap(obj)) return mobx_esm_keys(obj).map(function(key) {
        return obj.get(key);
    });
    if (isObservableSet(obj)) return Array.from(obj.values());
    if (mobx_esm_isObservableArray(obj)) return obj.slice();
    die(6);
}
function mobx_esm_entries(obj) {
    if (isObservableObject(obj)) return mobx_esm_keys(obj).map(function(key) {
        return [
            key,
            obj[key]
        ];
    });
    if (isObservableMap(obj)) return mobx_esm_keys(obj).map(function(key) {
        return [
            key,
            obj.get(key)
        ];
    });
    if (isObservableSet(obj)) return Array.from(obj.entries());
    if (mobx_esm_isObservableArray(obj)) return obj.map(function(key, index) {
        return [
            index,
            key
        ];
    });
    die(7);
}
function mobx_esm_observe(thing, propOrCb, cbOrFire, fireImmediately) {
    if (isFunction(cbOrFire)) return observeObservableProperty(thing, propOrCb, cbOrFire, fireImmediately);
    return observeObservable(thing, propOrCb, cbOrFire);
}
function observeObservable(thing, listener, fireImmediately) {
    return getAdministration(thing).observe_(listener, fireImmediately);
}
function observeObservableProperty(thing, property, listener, fireImmediately) {
    return getAdministration(thing, property).observe_(listener, fireImmediately);
}
function trace() {
    if (!("production" !== process.env.NODE_ENV)) return;
    var enterBreakPoint = false;
    for(var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++)args[_key] = arguments[_key];
    if ("boolean" == typeof args[args.length - 1]) enterBreakPoint = args.pop();
    var derivation = getAtomFromArgs(args);
    if (!derivation) return die("'trace(break?)' can only be used inside a tracked computed value or a Reaction. Consider passing in the computed value or reaction explicitly");
    if (derivation.isTracing_ === mobx_esm_TraceMode.NONE) console.log("[mobx.trace] '" + derivation.name_ + "' tracing enabled");
    derivation.isTracing_ = enterBreakPoint ? mobx_esm_TraceMode.BREAK : mobx_esm_TraceMode.LOG;
}
function getAtomFromArgs(args) {
    switch(args.length){
        case 0:
            return globalState.trackingDerivation;
        case 1:
            return mobx_esm_getAtom(args[0]);
        case 2:
            return mobx_esm_getAtom(args[0], args[1]);
    }
}
function transaction(action, thisArg) {
    if (void 0 === thisArg) thisArg = void 0;
    startBatch();
    try {
        return action.apply(thisArg);
    } finally{
        endBatch();
    }
}
function getAdm(target) {
    return target[$mobx];
}
var objectProxyTraps = {
    has: function(target, name1) {
        if ("production" !== process.env.NODE_ENV && globalState.trackingDerivation) warnAboutProxyRequirement("detect new properties using the 'in' operator. Use 'has' from 'mobx' instead.");
        return getAdm(target).has_(name1);
    },
    get: function(target, name1) {
        return getAdm(target).get_(name1);
    },
    set: function(target, name1, value) {
        var _getAdm$set_;
        if (!isStringish(name1)) return false;
        if ("production" !== process.env.NODE_ENV && !getAdm(target).values_.has(name1)) warnAboutProxyRequirement("add a new observable property through direct assignment. Use 'set' from 'mobx' instead.");
        return null != (_getAdm$set_ = getAdm(target).set_(name1, value, true)) ? _getAdm$set_ : true;
    },
    deleteProperty: function(target, name1) {
        var _getAdm$delete_;
        if ("production" !== process.env.NODE_ENV) warnAboutProxyRequirement("delete properties from an observable object. Use 'remove' from 'mobx' instead.");
        if (!isStringish(name1)) return false;
        return null != (_getAdm$delete_ = getAdm(target).delete_(name1, true)) ? _getAdm$delete_ : true;
    },
    defineProperty: function(target, name1, descriptor) {
        var _getAdm$definePropert;
        if ("production" !== process.env.NODE_ENV) warnAboutProxyRequirement("define property on an observable object. Use 'defineProperty' from 'mobx' instead.");
        return null != (_getAdm$definePropert = getAdm(target).defineProperty_(name1, descriptor)) ? _getAdm$definePropert : true;
    },
    ownKeys: function(target) {
        if ("production" !== process.env.NODE_ENV && globalState.trackingDerivation) warnAboutProxyRequirement("iterate keys to detect added / removed properties. Use 'keys' from 'mobx' instead.");
        return getAdm(target).ownKeys_();
    },
    preventExtensions: function(target) {
        die(13);
    }
};
function asDynamicObservableObject(target, options) {
    var _target$$mobx, _target$$mobx$proxy_;
    assertProxies();
    target = asObservableObject(target, options);
    return null != (_target$$mobx$proxy_ = (_target$$mobx = target[$mobx]).proxy_) ? _target$$mobx$proxy_ : _target$$mobx.proxy_ = new Proxy(target, objectProxyTraps);
}
function hasInterceptors(interceptable) {
    return void 0 !== interceptable.interceptors_ && interceptable.interceptors_.length > 0;
}
function registerInterceptor(interceptable, handler) {
    var interceptors = interceptable.interceptors_ || (interceptable.interceptors_ = []);
    interceptors.push(handler);
    return once(function() {
        var idx = interceptors.indexOf(handler);
        if (-1 !== idx) interceptors.splice(idx, 1);
    });
}
function interceptChange(interceptable, change) {
    var prevU = untrackedStart();
    try {
        var interceptors = [].concat(interceptable.interceptors_ || []);
        for(var i = 0, l = interceptors.length; i < l; i++){
            change = interceptors[i](change);
            if (change && !change.type) die(14);
            if (!change) break;
        }
        return change;
    } finally{
        untrackedEnd(prevU);
    }
}
function hasListeners(listenable) {
    return void 0 !== listenable.changeListeners_ && listenable.changeListeners_.length > 0;
}
function registerListener(listenable, handler) {
    var listeners = listenable.changeListeners_ || (listenable.changeListeners_ = []);
    listeners.push(handler);
    return once(function() {
        var idx = listeners.indexOf(handler);
        if (-1 !== idx) listeners.splice(idx, 1);
    });
}
function notifyListeners(listenable, change) {
    var prevU = untrackedStart();
    var listeners = listenable.changeListeners_;
    if (!listeners) return;
    listeners = listeners.slice();
    for(var i = 0, l = listeners.length; i < l; i++)listeners[i](change);
    untrackedEnd(prevU);
}
function makeObservable(target, annotations, options) {
    initObservable(function() {
        var adm = asObservableObject(target, options)[$mobx];
        if ("production" !== process.env.NODE_ENV && annotations && target[storedAnnotationsSymbol]) die("makeObservable second arg must be nullish when using decorators. Mixing @decorator syntax with annotations is not supported.");
        null != annotations || (annotations = collectStoredAnnotations(target));
        mobx_esm_ownKeys(annotations).forEach(function(key) {
            return adm.make_(key, annotations[key]);
        });
    });
    return target;
}
var SPLICE = "splice";
var UPDATE = "update";
var MAX_SPLICE_SIZE = 10000;
var arrayTraps = {
    get: function(target, name1) {
        var adm = target[$mobx];
        if (name1 === $mobx) return adm;
        if ("length" === name1) return adm.getArrayLength_();
        if ("string" == typeof name1 && !isNaN(name1)) return adm.get_(parseInt(name1));
        if (hasProp(arrayExtensions, name1)) return arrayExtensions[name1];
        return target[name1];
    },
    set: function(target, name1, value) {
        var adm = target[$mobx];
        if ("length" === name1) adm.setArrayLength_(value);
        if ("symbol" == typeof name1 || isNaN(name1)) target[name1] = value;
        else adm.set_(parseInt(name1), value);
        return true;
    },
    preventExtensions: function() {
        die(15);
    }
};
var mobx_esm_ObservableArrayAdministration = /*#__PURE__*/ function() {
    function ObservableArrayAdministration(name1, enhancer, owned_, legacyMode_) {
        if (void 0 === name1) name1 = "production" !== process.env.NODE_ENV ? "ObservableArray@" + getNextId() : "ObservableArray";
        this.owned_ = void 0;
        this.legacyMode_ = void 0;
        this.atom_ = void 0;
        this.values_ = [];
        this.interceptors_ = void 0;
        this.changeListeners_ = void 0;
        this.enhancer_ = void 0;
        this.dehancer = void 0;
        this.proxy_ = void 0;
        this.lastKnownLength_ = 0;
        this.owned_ = owned_;
        this.legacyMode_ = legacyMode_;
        this.atom_ = new mobx_esm_Atom(name1);
        this.enhancer_ = function(newV, oldV) {
            return enhancer(newV, oldV, "production" !== process.env.NODE_ENV ? name1 + "[..]" : "ObservableArray[..]");
        };
    }
    var _proto = ObservableArrayAdministration.prototype;
    _proto.dehanceValue_ = function(value) {
        if (void 0 !== this.dehancer) return this.dehancer(value);
        return value;
    };
    _proto.dehanceValues_ = function(values) {
        if (void 0 !== this.dehancer && values.length > 0) return values.map(this.dehancer);
        return values;
    };
    _proto.intercept_ = function(handler) {
        return registerInterceptor(this, handler);
    };
    _proto.observe_ = function(listener, fireImmediately) {
        if (void 0 === fireImmediately) fireImmediately = false;
        if (fireImmediately) listener({
            observableKind: "array",
            object: this.proxy_,
            debugObjectName: this.atom_.name_,
            type: "splice",
            index: 0,
            added: this.values_.slice(),
            addedCount: this.values_.length,
            removed: [],
            removedCount: 0
        });
        return registerListener(this, listener);
    };
    _proto.getArrayLength_ = function() {
        this.atom_.reportObserved();
        return this.values_.length;
    };
    _proto.setArrayLength_ = function(newLength) {
        if ("number" != typeof newLength || isNaN(newLength) || newLength < 0) die("Out of range: " + newLength);
        var currentLength = this.values_.length;
        if (newLength === currentLength) return;
        if (newLength > currentLength) {
            var newItems = new Array(newLength - currentLength);
            for(var i = 0; i < newLength - currentLength; i++)newItems[i] = void 0;
            this.spliceWithArray_(currentLength, 0, newItems);
        } else this.spliceWithArray_(newLength, currentLength - newLength);
    };
    _proto.updateArrayLength_ = function(oldLength, delta) {
        if (oldLength !== this.lastKnownLength_) die(16);
        this.lastKnownLength_ += delta;
        if (this.legacyMode_ && delta > 0) reserveArrayBuffer(oldLength + delta + 1);
    };
    _proto.spliceWithArray_ = function(index, deleteCount, newItems) {
        var _this = this;
        checkIfStateModificationsAreAllowed(this.atom_);
        var length = this.values_.length;
        if (void 0 === index) index = 0;
        else if (index > length) index = length;
        else if (index < 0) index = Math.max(0, length + index);
        deleteCount = 1 === arguments.length ? length - index : null == deleteCount ? 0 : Math.max(0, Math.min(deleteCount, length - index));
        if (void 0 === newItems) newItems = EMPTY_ARRAY;
        if (hasInterceptors(this)) {
            var change = interceptChange(this, {
                object: this.proxy_,
                type: SPLICE,
                index: index,
                removedCount: deleteCount,
                added: newItems
            });
            if (!change) return EMPTY_ARRAY;
            deleteCount = change.removedCount;
            newItems = change.added;
        }
        newItems = 0 === newItems.length ? newItems : newItems.map(function(v) {
            return _this.enhancer_(v, void 0);
        });
        if (this.legacyMode_ || "production" !== process.env.NODE_ENV) {
            var lengthDelta = newItems.length - deleteCount;
            this.updateArrayLength_(length, lengthDelta);
        }
        var res = this.spliceItemsIntoValues_(index, deleteCount, newItems);
        if (0 !== deleteCount || 0 !== newItems.length) this.notifyArraySplice_(index, newItems, res);
        return this.dehanceValues_(res);
    };
    _proto.spliceItemsIntoValues_ = function(index, deleteCount, newItems) {
        if (newItems.length < MAX_SPLICE_SIZE) {
            var _this$values_;
            return (_this$values_ = this.values_).splice.apply(_this$values_, [
                index,
                deleteCount
            ].concat(newItems));
        }
        var res = this.values_.slice(index, index + deleteCount);
        var oldItems = this.values_.slice(index + deleteCount);
        this.values_.length += newItems.length - deleteCount;
        for(var i = 0; i < newItems.length; i++)this.values_[index + i] = newItems[i];
        for(var _i = 0; _i < oldItems.length; _i++)this.values_[index + newItems.length + _i] = oldItems[_i];
        return res;
    };
    _proto.notifyArrayChildUpdate_ = function(index, newValue, oldValue) {
        var notifySpy = !this.owned_ && isSpyEnabled();
        var notify = hasListeners(this);
        var change = notify || notifySpy ? {
            observableKind: "array",
            object: this.proxy_,
            type: UPDATE,
            debugObjectName: this.atom_.name_,
            index: index,
            newValue: newValue,
            oldValue: oldValue
        } : null;
        if ("production" !== process.env.NODE_ENV && notifySpy) spyReportStart(change);
        this.atom_.reportChanged();
        if (notify) notifyListeners(this, change);
        if ("production" !== process.env.NODE_ENV && notifySpy) spyReportEnd();
    };
    _proto.notifyArraySplice_ = function(index, added, removed) {
        var notifySpy = !this.owned_ && isSpyEnabled();
        var notify = hasListeners(this);
        var change = notify || notifySpy ? {
            observableKind: "array",
            object: this.proxy_,
            debugObjectName: this.atom_.name_,
            type: SPLICE,
            index: index,
            removed: removed,
            added: added,
            removedCount: removed.length,
            addedCount: added.length
        } : null;
        if ("production" !== process.env.NODE_ENV && notifySpy) spyReportStart(change);
        this.atom_.reportChanged();
        if (notify) notifyListeners(this, change);
        if ("production" !== process.env.NODE_ENV && notifySpy) spyReportEnd();
    };
    _proto.get_ = function(index) {
        if (this.legacyMode_ && index >= this.values_.length) return void console.warn("production" !== process.env.NODE_ENV ? "[mobx.array] Attempt to read an array index (" + index + ") that is out of bounds (" + this.values_.length + "). Please check length first. Out of bound indices will not be tracked by MobX" : "[mobx] Out of bounds read: " + index);
        this.atom_.reportObserved();
        return this.dehanceValue_(this.values_[index]);
    };
    _proto.set_ = function(index, newValue) {
        var values = this.values_;
        if (this.legacyMode_ && index > values.length) die(17, index, values.length);
        if (index < values.length) {
            checkIfStateModificationsAreAllowed(this.atom_);
            var oldValue = values[index];
            if (hasInterceptors(this)) {
                var change = interceptChange(this, {
                    type: UPDATE,
                    object: this.proxy_,
                    index: index,
                    newValue: newValue
                });
                if (!change) return;
                newValue = change.newValue;
            }
            newValue = this.enhancer_(newValue, oldValue);
            var changed = newValue !== oldValue;
            if (changed) {
                values[index] = newValue;
                this.notifyArrayChildUpdate_(index, newValue, oldValue);
            }
        } else {
            var newItems = new Array(index + 1 - values.length);
            for(var i = 0; i < newItems.length - 1; i++)newItems[i] = void 0;
            newItems[newItems.length - 1] = newValue;
            this.spliceWithArray_(values.length, 0, newItems);
        }
    };
    return ObservableArrayAdministration;
}();
function createObservableArray(initialValues, enhancer, name1, owned) {
    if (void 0 === name1) name1 = "production" !== process.env.NODE_ENV ? "ObservableArray@" + getNextId() : "ObservableArray";
    if (void 0 === owned) owned = false;
    assertProxies();
    return initObservable(function() {
        var adm = new mobx_esm_ObservableArrayAdministration(name1, enhancer, owned, false);
        addHiddenFinalProp(adm.values_, $mobx, adm);
        var proxy = new Proxy(adm.values_, arrayTraps);
        adm.proxy_ = proxy;
        if (initialValues && initialValues.length) adm.spliceWithArray_(0, 0, initialValues);
        return proxy;
    });
}
var arrayExtensions = {
    clear: function() {
        return this.splice(0);
    },
    replace: function(newItems) {
        var adm = this[$mobx];
        return adm.spliceWithArray_(0, adm.values_.length, newItems);
    },
    toJSON: function() {
        return this.slice();
    },
    splice: function(index, deleteCount) {
        for(var _len = arguments.length, newItems = new Array(_len > 2 ? _len - 2 : 0), _key = 2; _key < _len; _key++)newItems[_key - 2] = arguments[_key];
        var adm = this[$mobx];
        switch(arguments.length){
            case 0:
                return [];
            case 1:
                return adm.spliceWithArray_(index);
            case 2:
                return adm.spliceWithArray_(index, deleteCount);
        }
        return adm.spliceWithArray_(index, deleteCount, newItems);
    },
    spliceWithArray: function(index, deleteCount, newItems) {
        return this[$mobx].spliceWithArray_(index, deleteCount, newItems);
    },
    push: function() {
        var adm = this[$mobx];
        for(var _len2 = arguments.length, items = new Array(_len2), _key2 = 0; _key2 < _len2; _key2++)items[_key2] = arguments[_key2];
        adm.spliceWithArray_(adm.values_.length, 0, items);
        return adm.values_.length;
    },
    pop: function() {
        return this.splice(Math.max(this[$mobx].values_.length - 1, 0), 1)[0];
    },
    shift: function() {
        return this.splice(0, 1)[0];
    },
    unshift: function() {
        var adm = this[$mobx];
        for(var _len3 = arguments.length, items = new Array(_len3), _key3 = 0; _key3 < _len3; _key3++)items[_key3] = arguments[_key3];
        adm.spliceWithArray_(0, 0, items);
        return adm.values_.length;
    },
    reverse: function() {
        if (globalState.trackingDerivation) die(37, "reverse");
        this.replace(this.slice().reverse());
        return this;
    },
    sort: function() {
        if (globalState.trackingDerivation) die(37, "sort");
        var copy = this.slice();
        copy.sort.apply(copy, arguments);
        this.replace(copy);
        return this;
    },
    remove: function(value) {
        var adm = this[$mobx];
        var idx = adm.dehanceValues_(adm.values_).indexOf(value);
        if (idx > -1) {
            this.splice(idx, 1);
            return true;
        }
        return false;
    }
};
addArrayExtension("at", simpleFunc);
addArrayExtension("concat", simpleFunc);
addArrayExtension("flat", simpleFunc);
addArrayExtension("includes", simpleFunc);
addArrayExtension("indexOf", simpleFunc);
addArrayExtension("join", simpleFunc);
addArrayExtension("lastIndexOf", simpleFunc);
addArrayExtension("slice", simpleFunc);
addArrayExtension("toString", simpleFunc);
addArrayExtension("toLocaleString", simpleFunc);
addArrayExtension("toSorted", simpleFunc);
addArrayExtension("toSpliced", simpleFunc);
addArrayExtension("with", simpleFunc);
addArrayExtension("every", mapLikeFunc);
addArrayExtension("filter", mapLikeFunc);
addArrayExtension("find", mapLikeFunc);
addArrayExtension("findIndex", mapLikeFunc);
addArrayExtension("findLast", mapLikeFunc);
addArrayExtension("findLastIndex", mapLikeFunc);
addArrayExtension("flatMap", mapLikeFunc);
addArrayExtension("forEach", mapLikeFunc);
addArrayExtension("map", mapLikeFunc);
addArrayExtension("some", mapLikeFunc);
addArrayExtension("toReversed", mapLikeFunc);
addArrayExtension("reduce", reduceLikeFunc);
addArrayExtension("reduceRight", reduceLikeFunc);
function addArrayExtension(funcName, funcFactory) {
    if ("function" == typeof Array.prototype[funcName]) arrayExtensions[funcName] = funcFactory(funcName);
}
function simpleFunc(funcName) {
    return function() {
        var adm = this[$mobx];
        adm.atom_.reportObserved();
        var dehancedValues = adm.dehanceValues_(adm.values_);
        return dehancedValues[funcName].apply(dehancedValues, arguments);
    };
}
function mapLikeFunc(funcName) {
    return function(callback, thisArg) {
        var _this2 = this;
        var adm = this[$mobx];
        adm.atom_.reportObserved();
        var dehancedValues = adm.dehanceValues_(adm.values_);
        return dehancedValues[funcName](function(element, index) {
            return callback.call(thisArg, element, index, _this2);
        });
    };
}
function reduceLikeFunc(funcName) {
    return function() {
        var _this3 = this;
        var adm = this[$mobx];
        adm.atom_.reportObserved();
        var dehancedValues = adm.dehanceValues_(adm.values_);
        var callback = arguments[0];
        arguments[0] = function(accumulator, currentValue, index) {
            return callback(accumulator, currentValue, index, _this3);
        };
        return dehancedValues[funcName].apply(dehancedValues, arguments);
    };
}
var isObservableArrayAdministration = /*#__PURE__*/ createInstanceofPredicate("ObservableArrayAdministration", mobx_esm_ObservableArrayAdministration);
function mobx_esm_isObservableArray(thing) {
    return isObject(thing) && isObservableArrayAdministration(thing[$mobx]);
}
var ObservableMapMarker = {};
var ADD = "add";
var DELETE = "delete";
var mobx_esm_ObservableMap = /*#__PURE__*/ function() {
    function ObservableMap(initialData, enhancer_, name_) {
        var _this = this;
        if (void 0 === enhancer_) enhancer_ = deepEnhancer;
        if (void 0 === name_) name_ = "production" !== process.env.NODE_ENV ? "ObservableMap@" + getNextId() : "ObservableMap";
        this.enhancer_ = void 0;
        this.name_ = void 0;
        this[$mobx] = ObservableMapMarker;
        this.data_ = void 0;
        this.hasMap_ = void 0;
        this.keysAtom_ = void 0;
        this.interceptors_ = void 0;
        this.changeListeners_ = void 0;
        this.dehancer = void 0;
        this.enhancer_ = enhancer_;
        this.name_ = name_;
        if (!isFunction(Map)) die(18);
        initObservable(function() {
            _this.keysAtom_ = mobx_esm_createAtom("production" !== process.env.NODE_ENV ? _this.name_ + ".keys()" : "ObservableMap.keys()");
            _this.data_ = new Map();
            _this.hasMap_ = new Map();
            if (initialData) _this.merge(initialData);
        });
    }
    var _proto = ObservableMap.prototype;
    _proto.has_ = function(key) {
        return this.data_.has(key);
    };
    _proto.has = function(key) {
        var _this2 = this;
        if (!globalState.trackingDerivation) return this.has_(key);
        var entry = this.hasMap_.get(key);
        if (!entry) {
            var newEntry = entry = new mobx_esm_ObservableValue(this.has_(key), referenceEnhancer, "production" !== process.env.NODE_ENV ? this.name_ + "." + stringifyKey(key) + "?" : "ObservableMap.key?", false);
            this.hasMap_.set(key, newEntry);
            mobx_esm_onBecomeUnobserved(newEntry, function() {
                return _this2.hasMap_["delete"](key);
            });
        }
        return entry.get();
    };
    _proto.set = function(key, value) {
        var hasKey = this.has_(key);
        if (hasInterceptors(this)) {
            var change = interceptChange(this, {
                type: hasKey ? UPDATE : ADD,
                object: this,
                newValue: value,
                name: key
            });
            if (!change) return this;
            value = change.newValue;
        }
        if (hasKey) this.updateValue_(key, value);
        else this.addValue_(key, value);
        return this;
    };
    _proto["delete"] = function(key) {
        var _this3 = this;
        checkIfStateModificationsAreAllowed(this.keysAtom_);
        if (hasInterceptors(this)) {
            var change = interceptChange(this, {
                type: DELETE,
                object: this,
                name: key
            });
            if (!change) return false;
        }
        if (this.has_(key)) {
            var notifySpy = isSpyEnabled();
            var notify = hasListeners(this);
            var _change = notify || notifySpy ? {
                observableKind: "map",
                debugObjectName: this.name_,
                type: DELETE,
                object: this,
                oldValue: this.data_.get(key).value_,
                name: key
            } : null;
            if ("production" !== process.env.NODE_ENV && notifySpy) spyReportStart(_change);
            transaction(function() {
                var _this3$hasMap_$get;
                _this3.keysAtom_.reportChanged();
                null == (_this3$hasMap_$get = _this3.hasMap_.get(key)) || _this3$hasMap_$get.setNewValue_(false);
                var observable = _this3.data_.get(key);
                observable.setNewValue_(void 0);
                _this3.data_["delete"](key);
            });
            if (notify) notifyListeners(this, _change);
            if ("production" !== process.env.NODE_ENV && notifySpy) spyReportEnd();
            return true;
        }
        return false;
    };
    _proto.updateValue_ = function(key, newValue) {
        var observable = this.data_.get(key);
        newValue = observable.prepareNewValue_(newValue);
        if (newValue !== globalState.UNCHANGED) {
            var notifySpy = isSpyEnabled();
            var notify = hasListeners(this);
            var change = notify || notifySpy ? {
                observableKind: "map",
                debugObjectName: this.name_,
                type: UPDATE,
                object: this,
                oldValue: observable.value_,
                name: key,
                newValue: newValue
            } : null;
            if ("production" !== process.env.NODE_ENV && notifySpy) spyReportStart(change);
            observable.setNewValue_(newValue);
            if (notify) notifyListeners(this, change);
            if ("production" !== process.env.NODE_ENV && notifySpy) spyReportEnd();
        }
    };
    _proto.addValue_ = function(key, newValue) {
        var _this4 = this;
        checkIfStateModificationsAreAllowed(this.keysAtom_);
        transaction(function() {
            var _this4$hasMap_$get;
            var observable = new mobx_esm_ObservableValue(newValue, _this4.enhancer_, "production" !== process.env.NODE_ENV ? _this4.name_ + "." + stringifyKey(key) : "ObservableMap.key", false);
            _this4.data_.set(key, observable);
            newValue = observable.value_;
            null == (_this4$hasMap_$get = _this4.hasMap_.get(key)) || _this4$hasMap_$get.setNewValue_(true);
            _this4.keysAtom_.reportChanged();
        });
        var notifySpy = isSpyEnabled();
        var notify = hasListeners(this);
        var change = notify || notifySpy ? {
            observableKind: "map",
            debugObjectName: this.name_,
            type: ADD,
            object: this,
            name: key,
            newValue: newValue
        } : null;
        if ("production" !== process.env.NODE_ENV && notifySpy) spyReportStart(change);
        if (notify) notifyListeners(this, change);
        if ("production" !== process.env.NODE_ENV && notifySpy) spyReportEnd();
    };
    _proto.get = function(key) {
        if (this.has(key)) return this.dehanceValue_(this.data_.get(key).get());
        return this.dehanceValue_(void 0);
    };
    _proto.dehanceValue_ = function(value) {
        if (void 0 !== this.dehancer) return this.dehancer(value);
        return value;
    };
    _proto.keys = function() {
        this.keysAtom_.reportObserved();
        return this.data_.keys();
    };
    _proto.values = function() {
        var self1 = this;
        var keys = this.keys();
        return makeIterableForMap({
            next: function() {
                var _keys$next = keys.next(), done = _keys$next.done, value = _keys$next.value;
                return {
                    done: done,
                    value: done ? void 0 : self1.get(value)
                };
            }
        });
    };
    _proto.entries = function() {
        var self1 = this;
        var keys = this.keys();
        return makeIterableForMap({
            next: function() {
                var _keys$next2 = keys.next(), done = _keys$next2.done, value = _keys$next2.value;
                return {
                    done: done,
                    value: done ? void 0 : [
                        value,
                        self1.get(value)
                    ]
                };
            }
        });
    };
    _proto[Symbol.iterator] = function() {
        return this.entries();
    };
    _proto.forEach = function(callback, thisArg) {
        for(var _iterator = _createForOfIteratorHelperLoose(this), _step; !(_step = _iterator()).done;){
            var _step$value = _step.value, key = _step$value[0], value = _step$value[1];
            callback.call(thisArg, value, key, this);
        }
    };
    _proto.merge = function(other) {
        var _this5 = this;
        if (isObservableMap(other)) other = new Map(other);
        transaction(function() {
            if (isPlainObject(other)) getPlainObjectKeys(other).forEach(function(key) {
                return _this5.set(key, other[key]);
            });
            else if (Array.isArray(other)) other.forEach(function(_ref) {
                var key = _ref[0], value = _ref[1];
                return _this5.set(key, value);
            });
            else if (isES6Map(other)) {
                if (!isPlainES6Map(other)) die(19, other);
                other.forEach(function(value, key) {
                    return _this5.set(key, value);
                });
            } else if (null != other) die(20, other);
        });
        return this;
    };
    _proto.clear = function() {
        var _this6 = this;
        transaction(function() {
            untracked(function() {
                for(var _iterator2 = _createForOfIteratorHelperLoose(_this6.keys()), _step2; !(_step2 = _iterator2()).done;){
                    var key = _step2.value;
                    _this6["delete"](key);
                }
            });
        });
    };
    _proto.replace = function(values) {
        var _this7 = this;
        transaction(function() {
            var replacementMap = convertToMap(values);
            var orderedData = new Map();
            var keysReportChangedCalled = false;
            for(var _iterator3 = _createForOfIteratorHelperLoose(_this7.data_.keys()), _step3; !(_step3 = _iterator3()).done;){
                var key = _step3.value;
                if (!replacementMap.has(key)) {
                    var deleted = _this7["delete"](key);
                    if (deleted) keysReportChangedCalled = true;
                    else {
                        var value = _this7.data_.get(key);
                        orderedData.set(key, value);
                    }
                }
            }
            for(var _iterator4 = _createForOfIteratorHelperLoose(replacementMap.entries()), _step4; !(_step4 = _iterator4()).done;){
                var _step4$value = _step4.value, _key = _step4$value[0], _value = _step4$value[1];
                var keyExisted = _this7.data_.has(_key);
                _this7.set(_key, _value);
                if (_this7.data_.has(_key)) {
                    var _value2 = _this7.data_.get(_key);
                    orderedData.set(_key, _value2);
                    if (!keyExisted) keysReportChangedCalled = true;
                }
            }
            if (!keysReportChangedCalled) if (_this7.data_.size !== orderedData.size) _this7.keysAtom_.reportChanged();
            else {
                var iter1 = _this7.data_.keys();
                var iter2 = orderedData.keys();
                var next1 = iter1.next();
                var next2 = iter2.next();
                while(!next1.done){
                    if (next1.value !== next2.value) {
                        _this7.keysAtom_.reportChanged();
                        break;
                    }
                    next1 = iter1.next();
                    next2 = iter2.next();
                }
            }
            _this7.data_ = orderedData;
        });
        return this;
    };
    _proto.toString = function() {
        return "[object ObservableMap]";
    };
    _proto.toJSON = function() {
        return Array.from(this);
    };
    _proto.observe_ = function(listener, fireImmediately) {
        if ("production" !== process.env.NODE_ENV && true === fireImmediately) die("`observe` doesn't support fireImmediately=true in combination with maps.");
        return registerListener(this, listener);
    };
    _proto.intercept_ = function(handler) {
        return registerInterceptor(this, handler);
    };
    return _createClass(ObservableMap, [
        {
            key: "size",
            get: function() {
                this.keysAtom_.reportObserved();
                return this.data_.size;
            }
        },
        {
            key: Symbol.toStringTag,
            get: function() {
                return "Map";
            }
        }
    ]);
}();
var isObservableMap = /*#__PURE__*/ createInstanceofPredicate("ObservableMap", mobx_esm_ObservableMap);
function makeIterableForMap(iterator) {
    iterator[Symbol.toStringTag] = "MapIterator";
    return makeIterable(iterator);
}
function convertToMap(dataStructure) {
    if (isES6Map(dataStructure) || isObservableMap(dataStructure)) return dataStructure;
    if (Array.isArray(dataStructure)) return new Map(dataStructure);
    if (!isPlainObject(dataStructure)) return die(21, dataStructure);
    var map = new Map();
    for(var key in dataStructure)map.set(key, dataStructure[key]);
    return map;
}
var ObservableSetMarker = {};
var mobx_esm_ObservableSet = /*#__PURE__*/ function() {
    function ObservableSet(initialData, enhancer, name_) {
        var _this = this;
        if (void 0 === enhancer) enhancer = deepEnhancer;
        if (void 0 === name_) name_ = "production" !== process.env.NODE_ENV ? "ObservableSet@" + getNextId() : "ObservableSet";
        this.name_ = void 0;
        this[$mobx] = ObservableSetMarker;
        this.data_ = new Set();
        this.atom_ = void 0;
        this.changeListeners_ = void 0;
        this.interceptors_ = void 0;
        this.dehancer = void 0;
        this.enhancer_ = void 0;
        this.name_ = name_;
        if (!isFunction(Set)) die(22);
        this.enhancer_ = function(newV, oldV) {
            return enhancer(newV, oldV, name_);
        };
        initObservable(function() {
            _this.atom_ = mobx_esm_createAtom(_this.name_);
            if (initialData) _this.replace(initialData);
        });
    }
    var _proto = ObservableSet.prototype;
    _proto.dehanceValue_ = function(value) {
        if (void 0 !== this.dehancer) return this.dehancer(value);
        return value;
    };
    _proto.clear = function() {
        var _this2 = this;
        transaction(function() {
            untracked(function() {
                for(var _iterator = _createForOfIteratorHelperLoose(_this2.data_.values()), _step; !(_step = _iterator()).done;){
                    var value = _step.value;
                    _this2["delete"](value);
                }
            });
        });
    };
    _proto.forEach = function(callbackFn, thisArg) {
        for(var _iterator2 = _createForOfIteratorHelperLoose(this), _step2; !(_step2 = _iterator2()).done;){
            var value = _step2.value;
            callbackFn.call(thisArg, value, value, this);
        }
    };
    _proto.add = function(value) {
        var _this3 = this;
        checkIfStateModificationsAreAllowed(this.atom_);
        if (hasInterceptors(this)) {
            var change = interceptChange(this, {
                type: ADD,
                object: this,
                newValue: value
            });
            if (!change) return this;
            value = change.newValue;
        }
        if (!this.has(value)) {
            transaction(function() {
                _this3.data_.add(_this3.enhancer_(value, void 0));
                _this3.atom_.reportChanged();
            });
            var notifySpy = "production" !== process.env.NODE_ENV && isSpyEnabled();
            var notify = hasListeners(this);
            var _change = notify || notifySpy ? {
                observableKind: "set",
                debugObjectName: this.name_,
                type: ADD,
                object: this,
                newValue: value
            } : null;
            if (notifySpy && "production" !== process.env.NODE_ENV) spyReportStart(_change);
            if (notify) notifyListeners(this, _change);
            if (notifySpy && "production" !== process.env.NODE_ENV) spyReportEnd();
        }
        return this;
    };
    _proto["delete"] = function(value) {
        var _this4 = this;
        if (hasInterceptors(this)) {
            var change = interceptChange(this, {
                type: DELETE,
                object: this,
                oldValue: value
            });
            if (!change) return false;
        }
        if (this.has(value)) {
            var notifySpy = "production" !== process.env.NODE_ENV && isSpyEnabled();
            var notify = hasListeners(this);
            var _change2 = notify || notifySpy ? {
                observableKind: "set",
                debugObjectName: this.name_,
                type: DELETE,
                object: this,
                oldValue: value
            } : null;
            if (notifySpy && "production" !== process.env.NODE_ENV) spyReportStart(_change2);
            transaction(function() {
                _this4.atom_.reportChanged();
                _this4.data_["delete"](value);
            });
            if (notify) notifyListeners(this, _change2);
            if (notifySpy && "production" !== process.env.NODE_ENV) spyReportEnd();
            return true;
        }
        return false;
    };
    _proto.has = function(value) {
        this.atom_.reportObserved();
        return this.data_.has(this.dehanceValue_(value));
    };
    _proto.entries = function() {
        var values = this.values();
        return makeIterableForSet({
            next: function() {
                var _values$next = values.next(), value = _values$next.value, done = _values$next.done;
                return done ? {
                    value: void 0,
                    done: done
                } : {
                    value: [
                        value,
                        value
                    ],
                    done: done
                };
            }
        });
    };
    _proto.keys = function() {
        return this.values();
    };
    _proto.values = function() {
        this.atom_.reportObserved();
        var self1 = this;
        var values = this.data_.values();
        return makeIterableForSet({
            next: function() {
                var _values$next2 = values.next(), value = _values$next2.value, done = _values$next2.done;
                return done ? {
                    value: void 0,
                    done: done
                } : {
                    value: self1.dehanceValue_(value),
                    done: done
                };
            }
        });
    };
    _proto.intersection = function(otherSet) {
        if (isES6Set(otherSet) && !isObservableSet(otherSet)) return otherSet.intersection(this);
        var dehancedSet = new Set(this);
        return dehancedSet.intersection(otherSet);
    };
    _proto.union = function(otherSet) {
        if (isES6Set(otherSet) && !isObservableSet(otherSet)) return otherSet.union(this);
        var dehancedSet = new Set(this);
        return dehancedSet.union(otherSet);
    };
    _proto.difference = function(otherSet) {
        return new Set(this).difference(otherSet);
    };
    _proto.symmetricDifference = function(otherSet) {
        if (isES6Set(otherSet) && !isObservableSet(otherSet)) return otherSet.symmetricDifference(this);
        var dehancedSet = new Set(this);
        return dehancedSet.symmetricDifference(otherSet);
    };
    _proto.isSubsetOf = function(otherSet) {
        return new Set(this).isSubsetOf(otherSet);
    };
    _proto.isSupersetOf = function(otherSet) {
        return new Set(this).isSupersetOf(otherSet);
    };
    _proto.isDisjointFrom = function(otherSet) {
        if (isES6Set(otherSet) && !isObservableSet(otherSet)) return otherSet.isDisjointFrom(this);
        var dehancedSet = new Set(this);
        return dehancedSet.isDisjointFrom(otherSet);
    };
    _proto.replace = function(other) {
        var _this5 = this;
        if (isObservableSet(other)) other = new Set(other);
        transaction(function() {
            if (Array.isArray(other)) {
                _this5.clear();
                other.forEach(function(value) {
                    return _this5.add(value);
                });
            } else if (isES6Set(other)) {
                _this5.clear();
                other.forEach(function(value) {
                    return _this5.add(value);
                });
            } else if (null != other) die("Cannot initialize set from " + other);
        });
        return this;
    };
    _proto.observe_ = function(listener, fireImmediately) {
        if ("production" !== process.env.NODE_ENV && true === fireImmediately) die("`observe` doesn't support fireImmediately=true in combination with sets.");
        return registerListener(this, listener);
    };
    _proto.intercept_ = function(handler) {
        return registerInterceptor(this, handler);
    };
    _proto.toJSON = function() {
        return Array.from(this);
    };
    _proto.toString = function() {
        return "[object ObservableSet]";
    };
    _proto[Symbol.iterator] = function() {
        return this.values();
    };
    return _createClass(ObservableSet, [
        {
            key: "size",
            get: function() {
                this.atom_.reportObserved();
                return this.data_.size;
            }
        },
        {
            key: Symbol.toStringTag,
            get: function() {
                return "Set";
            }
        }
    ]);
}();
var isObservableSet = /*#__PURE__*/ createInstanceofPredicate("ObservableSet", mobx_esm_ObservableSet);
function makeIterableForSet(iterator) {
    iterator[Symbol.toStringTag] = "SetIterator";
    return makeIterable(iterator);
}
var descriptorCache = /*#__PURE__*/ Object.create(null);
var REMOVE = "remove";
var mobx_esm_ObservableObjectAdministration = /*#__PURE__*/ function() {
    function ObservableObjectAdministration(target_, values_, name_, defaultAnnotation_) {
        if (void 0 === values_) values_ = new Map();
        if (void 0 === defaultAnnotation_) defaultAnnotation_ = autoAnnotation;
        this.target_ = void 0;
        this.values_ = void 0;
        this.name_ = void 0;
        this.defaultAnnotation_ = void 0;
        this.keysAtom_ = void 0;
        this.changeListeners_ = void 0;
        this.interceptors_ = void 0;
        this.proxy_ = void 0;
        this.isPlainObject_ = void 0;
        this.appliedAnnotations_ = void 0;
        this.pendingKeys_ = void 0;
        this.target_ = target_;
        this.values_ = values_;
        this.name_ = name_;
        this.defaultAnnotation_ = defaultAnnotation_;
        this.keysAtom_ = new mobx_esm_Atom("production" !== process.env.NODE_ENV ? this.name_ + ".keys" : "ObservableObject.keys");
        this.isPlainObject_ = isPlainObject(this.target_);
        if ("production" !== process.env.NODE_ENV && !isAnnotation(this.defaultAnnotation_)) die("defaultAnnotation must be valid annotation");
        if ("production" !== process.env.NODE_ENV) this.appliedAnnotations_ = {};
    }
    var _proto = ObservableObjectAdministration.prototype;
    _proto.getObservablePropValue_ = function(key) {
        return this.values_.get(key).get();
    };
    _proto.setObservablePropValue_ = function(key, newValue) {
        var observable = this.values_.get(key);
        if (observable instanceof mobx_esm_ComputedValue) {
            observable.set(newValue);
            return true;
        }
        if (hasInterceptors(this)) {
            var change = interceptChange(this, {
                type: UPDATE,
                object: this.proxy_ || this.target_,
                name: key,
                newValue: newValue
            });
            if (!change) return null;
            newValue = change.newValue;
        }
        newValue = observable.prepareNewValue_(newValue);
        if (newValue !== globalState.UNCHANGED) {
            var notify = hasListeners(this);
            var notifySpy = "production" !== process.env.NODE_ENV && isSpyEnabled();
            var _change = notify || notifySpy ? {
                type: UPDATE,
                observableKind: "object",
                debugObjectName: this.name_,
                object: this.proxy_ || this.target_,
                oldValue: observable.value_,
                name: key,
                newValue: newValue
            } : null;
            if ("production" !== process.env.NODE_ENV && notifySpy) spyReportStart(_change);
            observable.setNewValue_(newValue);
            if (notify) notifyListeners(this, _change);
            if ("production" !== process.env.NODE_ENV && notifySpy) spyReportEnd();
        }
        return true;
    };
    _proto.get_ = function(key) {
        if (globalState.trackingDerivation && !hasProp(this.target_, key)) this.has_(key);
        return this.target_[key];
    };
    _proto.set_ = function(key, value, proxyTrap) {
        if (void 0 === proxyTrap) proxyTrap = false;
        if (!hasProp(this.target_, key)) return this.extend_(key, {
            value: value,
            enumerable: true,
            writable: true,
            configurable: true
        }, this.defaultAnnotation_, proxyTrap);
        if (this.values_.has(key)) return this.setObservablePropValue_(key, value);
        if (proxyTrap) return Reflect.set(this.target_, key, value);
        this.target_[key] = value;
        return true;
    };
    _proto.has_ = function(key) {
        if (!globalState.trackingDerivation) return key in this.target_;
        this.pendingKeys_ || (this.pendingKeys_ = new Map());
        var entry = this.pendingKeys_.get(key);
        if (!entry) {
            entry = new mobx_esm_ObservableValue(key in this.target_, referenceEnhancer, "production" !== process.env.NODE_ENV ? this.name_ + "." + stringifyKey(key) + "?" : "ObservableObject.key?", false);
            this.pendingKeys_.set(key, entry);
        }
        return entry.get();
    };
    _proto.make_ = function(key, annotation) {
        if (true === annotation) annotation = this.defaultAnnotation_;
        if (false === annotation) return;
        assertAnnotable(this, annotation, key);
        if (!(key in this.target_)) {
            var _this$target_$storedA;
            if (null != (_this$target_$storedA = this.target_[storedAnnotationsSymbol]) && _this$target_$storedA[key]) return;
            die(1, annotation.annotationType_, this.name_ + "." + key.toString());
        }
        var source = this.target_;
        while(source && source !== objectPrototype){
            var descriptor = getDescriptor(source, key);
            if (descriptor) {
                var outcome = annotation.make_(this, key, descriptor, source);
                if (0 === outcome) return;
                if (1 === outcome) break;
            }
            source = Object.getPrototypeOf(source);
        }
        recordAnnotationApplied(this, annotation, key);
    };
    _proto.extend_ = function(key, descriptor, annotation, proxyTrap) {
        if (void 0 === proxyTrap) proxyTrap = false;
        if (true === annotation) annotation = this.defaultAnnotation_;
        if (false === annotation) return this.defineProperty_(key, descriptor, proxyTrap);
        assertAnnotable(this, annotation, key);
        var outcome = annotation.extend_(this, key, descriptor, proxyTrap);
        if (outcome) recordAnnotationApplied(this, annotation, key);
        return outcome;
    };
    _proto.defineProperty_ = function(key, descriptor, proxyTrap) {
        if (void 0 === proxyTrap) proxyTrap = false;
        checkIfStateModificationsAreAllowed(this.keysAtom_);
        try {
            startBatch();
            var deleteOutcome = this.delete_(key);
            if (!deleteOutcome) return deleteOutcome;
            if (hasInterceptors(this)) {
                var change = interceptChange(this, {
                    object: this.proxy_ || this.target_,
                    name: key,
                    type: ADD,
                    newValue: descriptor.value
                });
                if (!change) return null;
                var newValue = change.newValue;
                if (descriptor.value !== newValue) descriptor = _extends({}, descriptor, {
                    value: newValue
                });
            }
            if (proxyTrap) {
                if (!Reflect.defineProperty(this.target_, key, descriptor)) return false;
            } else mobx_esm_defineProperty(this.target_, key, descriptor);
            this.notifyPropertyAddition_(key, descriptor.value);
        } finally{
            endBatch();
        }
        return true;
    };
    _proto.defineObservableProperty_ = function(key, value, enhancer, proxyTrap) {
        if (void 0 === proxyTrap) proxyTrap = false;
        checkIfStateModificationsAreAllowed(this.keysAtom_);
        try {
            startBatch();
            var deleteOutcome = this.delete_(key);
            if (!deleteOutcome) return deleteOutcome;
            if (hasInterceptors(this)) {
                var change = interceptChange(this, {
                    object: this.proxy_ || this.target_,
                    name: key,
                    type: ADD,
                    newValue: value
                });
                if (!change) return null;
                value = change.newValue;
            }
            var cachedDescriptor = getCachedObservablePropDescriptor(key);
            var descriptor = {
                configurable: globalState.safeDescriptors ? this.isPlainObject_ : true,
                enumerable: true,
                get: cachedDescriptor.get,
                set: cachedDescriptor.set
            };
            if (proxyTrap) {
                if (!Reflect.defineProperty(this.target_, key, descriptor)) return false;
            } else mobx_esm_defineProperty(this.target_, key, descriptor);
            var observable = new mobx_esm_ObservableValue(value, enhancer, "production" !== process.env.NODE_ENV ? this.name_ + "." + key.toString() : "ObservableObject.key", false);
            this.values_.set(key, observable);
            this.notifyPropertyAddition_(key, observable.value_);
        } finally{
            endBatch();
        }
        return true;
    };
    _proto.defineComputedProperty_ = function(key, options, proxyTrap) {
        if (void 0 === proxyTrap) proxyTrap = false;
        checkIfStateModificationsAreAllowed(this.keysAtom_);
        try {
            startBatch();
            var deleteOutcome = this.delete_(key);
            if (!deleteOutcome) return deleteOutcome;
            if (hasInterceptors(this)) {
                var change = interceptChange(this, {
                    object: this.proxy_ || this.target_,
                    name: key,
                    type: ADD,
                    newValue: void 0
                });
                if (!change) return null;
            }
            options.name || (options.name = "production" !== process.env.NODE_ENV ? this.name_ + "." + key.toString() : "ObservableObject.key");
            options.context = this.proxy_ || this.target_;
            var cachedDescriptor = getCachedObservablePropDescriptor(key);
            var descriptor = {
                configurable: globalState.safeDescriptors ? this.isPlainObject_ : true,
                enumerable: false,
                get: cachedDescriptor.get,
                set: cachedDescriptor.set
            };
            if (proxyTrap) {
                if (!Reflect.defineProperty(this.target_, key, descriptor)) return false;
            } else mobx_esm_defineProperty(this.target_, key, descriptor);
            this.values_.set(key, new mobx_esm_ComputedValue(options));
            this.notifyPropertyAddition_(key, void 0);
        } finally{
            endBatch();
        }
        return true;
    };
    _proto.delete_ = function(key, proxyTrap) {
        if (void 0 === proxyTrap) proxyTrap = false;
        checkIfStateModificationsAreAllowed(this.keysAtom_);
        if (!hasProp(this.target_, key)) return true;
        if (hasInterceptors(this)) {
            var change = interceptChange(this, {
                object: this.proxy_ || this.target_,
                name: key,
                type: REMOVE
            });
            if (!change) return null;
        }
        try {
            var _this$pendingKeys_;
            startBatch();
            var notify = hasListeners(this);
            var notifySpy = "production" !== process.env.NODE_ENV && isSpyEnabled();
            var observable = this.values_.get(key);
            var value = void 0;
            if (!observable && (notify || notifySpy)) {
                var _getDescriptor;
                value = null == (_getDescriptor = getDescriptor(this.target_, key)) ? void 0 : _getDescriptor.value;
            }
            if (proxyTrap) {
                if (!Reflect.deleteProperty(this.target_, key)) return false;
            } else delete this.target_[key];
            if ("production" !== process.env.NODE_ENV) delete this.appliedAnnotations_[key];
            if (observable) {
                this.values_["delete"](key);
                if (observable instanceof mobx_esm_ObservableValue) value = observable.value_;
                propagateChanged(observable);
            }
            this.keysAtom_.reportChanged();
            null == (_this$pendingKeys_ = this.pendingKeys_) || null == (_this$pendingKeys_ = _this$pendingKeys_.get(key)) || _this$pendingKeys_.set(key in this.target_);
            if (notify || notifySpy) {
                var _change2 = {
                    type: REMOVE,
                    observableKind: "object",
                    object: this.proxy_ || this.target_,
                    debugObjectName: this.name_,
                    oldValue: value,
                    name: key
                };
                if ("production" !== process.env.NODE_ENV && notifySpy) spyReportStart(_change2);
                if (notify) notifyListeners(this, _change2);
                if ("production" !== process.env.NODE_ENV && notifySpy) spyReportEnd();
            }
        } finally{
            endBatch();
        }
        return true;
    };
    _proto.observe_ = function(callback, fireImmediately) {
        if ("production" !== process.env.NODE_ENV && true === fireImmediately) die("`observe` doesn't support the fire immediately property for observable objects.");
        return registerListener(this, callback);
    };
    _proto.intercept_ = function(handler) {
        return registerInterceptor(this, handler);
    };
    _proto.notifyPropertyAddition_ = function(key, value) {
        var _this$pendingKeys_2;
        var notify = hasListeners(this);
        var notifySpy = "production" !== process.env.NODE_ENV && isSpyEnabled();
        if (notify || notifySpy) {
            var change = notify || notifySpy ? {
                type: ADD,
                observableKind: "object",
                debugObjectName: this.name_,
                object: this.proxy_ || this.target_,
                name: key,
                newValue: value
            } : null;
            if ("production" !== process.env.NODE_ENV && notifySpy) spyReportStart(change);
            if (notify) notifyListeners(this, change);
            if ("production" !== process.env.NODE_ENV && notifySpy) spyReportEnd();
        }
        null == (_this$pendingKeys_2 = this.pendingKeys_) || null == (_this$pendingKeys_2 = _this$pendingKeys_2.get(key)) || _this$pendingKeys_2.set(true);
        this.keysAtom_.reportChanged();
    };
    _proto.ownKeys_ = function() {
        this.keysAtom_.reportObserved();
        return mobx_esm_ownKeys(this.target_);
    };
    _proto.keys_ = function() {
        this.keysAtom_.reportObserved();
        return Object.keys(this.target_);
    };
    return ObservableObjectAdministration;
}();
function asObservableObject(target, options) {
    var _options$name;
    if ("production" !== process.env.NODE_ENV && options && isObservableObject(target)) die("Options can't be provided for already observable objects.");
    if (hasProp(target, $mobx)) {
        if ("production" !== process.env.NODE_ENV && !(getAdministration(target) instanceof mobx_esm_ObservableObjectAdministration)) die("Cannot convert '" + getDebugName(target) + "' into observable object:\nThe target is already observable of different type.\nExtending builtins is not supported.");
        return target;
    }
    if ("production" !== process.env.NODE_ENV && !Object.isExtensible(target)) die("Cannot make the designated object observable; it is not extensible");
    var name1 = null != (_options$name = null == options ? void 0 : options.name) ? _options$name : "production" !== process.env.NODE_ENV ? (isPlainObject(target) ? "ObservableObject" : target.constructor.name) + "@" + getNextId() : "ObservableObject";
    var adm = new mobx_esm_ObservableObjectAdministration(target, new Map(), String(name1), getAnnotationFromOptions(options));
    addHiddenProp(target, $mobx, adm);
    return target;
}
var isObservableObjectAdministration = /*#__PURE__*/ createInstanceofPredicate("ObservableObjectAdministration", mobx_esm_ObservableObjectAdministration);
function getCachedObservablePropDescriptor(key) {
    return descriptorCache[key] || (descriptorCache[key] = {
        get: function() {
            return this[$mobx].getObservablePropValue_(key);
        },
        set: function(value) {
            return this[$mobx].setObservablePropValue_(key, value);
        }
    });
}
function isObservableObject(thing) {
    if (isObject(thing)) return isObservableObjectAdministration(thing[$mobx]);
    return false;
}
function recordAnnotationApplied(adm, annotation, key) {
    var _adm$target_$storedAn;
    if ("production" !== process.env.NODE_ENV) adm.appliedAnnotations_[key] = annotation;
    null == (_adm$target_$storedAn = adm.target_[storedAnnotationsSymbol]) || delete _adm$target_$storedAn[key];
}
function assertAnnotable(adm, annotation, key) {
    if ("production" !== process.env.NODE_ENV && !isAnnotation(annotation)) die("Cannot annotate '" + adm.name_ + "." + key.toString() + "': Invalid annotation.");
    if ("production" !== process.env.NODE_ENV && !isOverride(annotation) && hasProp(adm.appliedAnnotations_, key)) {
        var fieldName = adm.name_ + "." + key.toString();
        var currentAnnotationType = adm.appliedAnnotations_[key].annotationType_;
        var requestedAnnotationType = annotation.annotationType_;
        die("Cannot apply '" + requestedAnnotationType + "' to '" + fieldName + "':\nThe field is already annotated with '" + currentAnnotationType + "'.\nRe-annotating fields is not allowed.\nUse 'override' annotation for methods overridden by subclass.");
    }
}
var ENTRY_0 = /*#__PURE__*/ createArrayEntryDescriptor(0);
var safariPrototypeSetterInheritanceBug = /*#__PURE__*/ function() {
    var v = false;
    var p = {};
    Object.defineProperty(p, "0", {
        set: function() {
            v = true;
        }
    });
    /*#__PURE__*/ Object.create(p)["0"] = 1;
    return false === v;
}();
var OBSERVABLE_ARRAY_BUFFER_SIZE = 0;
var mobx_esm_StubArray = function() {};
function inherit(ctor, proto) {
    if (Object.setPrototypeOf) Object.setPrototypeOf(ctor.prototype, proto);
    else if (void 0 !== ctor.prototype.__proto__) ctor.prototype.__proto__ = proto;
    else ctor.prototype = proto;
}
inherit(mobx_esm_StubArray, Array.prototype);
var mobx_esm_LegacyObservableArray = /*#__PURE__*/ function(_StubArray) {
    function LegacyObservableArray(initialValues, enhancer, name1, owned) {
        var _this;
        if (void 0 === name1) name1 = "production" !== process.env.NODE_ENV ? "ObservableArray@" + getNextId() : "ObservableArray";
        if (void 0 === owned) owned = false;
        _this = _StubArray.call(this) || this;
        initObservable(function() {
            var adm = new mobx_esm_ObservableArrayAdministration(name1, enhancer, owned, true);
            adm.proxy_ = _this;
            addHiddenFinalProp(_this, $mobx, adm);
            if (initialValues && initialValues.length) _this.spliceWithArray(0, 0, initialValues);
            if (safariPrototypeSetterInheritanceBug) Object.defineProperty(_this, "0", ENTRY_0);
        });
        return _this;
    }
    _inheritsLoose(LegacyObservableArray, _StubArray);
    var _proto = LegacyObservableArray.prototype;
    _proto.concat = function() {
        this[$mobx].atom_.reportObserved();
        for(var _len = arguments.length, arrays = new Array(_len), _key = 0; _key < _len; _key++)arrays[_key] = arguments[_key];
        return Array.prototype.concat.apply(this.slice(), arrays.map(function(a) {
            return mobx_esm_isObservableArray(a) ? a.slice() : a;
        }));
    };
    _proto[Symbol.iterator] = function() {
        var self1 = this;
        var nextIndex = 0;
        return makeIterable({
            next: function() {
                return nextIndex < self1.length ? {
                    value: self1[nextIndex++],
                    done: false
                } : {
                    done: true,
                    value: void 0
                };
            }
        });
    };
    return _createClass(LegacyObservableArray, [
        {
            key: "length",
            get: function() {
                return this[$mobx].getArrayLength_();
            },
            set: function(newLength) {
                this[$mobx].setArrayLength_(newLength);
            }
        },
        {
            key: Symbol.toStringTag,
            get: function() {
                return "Array";
            }
        }
    ]);
}(mobx_esm_StubArray);
Object.entries(arrayExtensions).forEach(function(_ref) {
    var prop = _ref[0], fn = _ref[1];
    if ("concat" !== prop) addHiddenProp(mobx_esm_LegacyObservableArray.prototype, prop, fn);
});
function createArrayEntryDescriptor(index) {
    return {
        enumerable: false,
        configurable: true,
        get: function() {
            return this[$mobx].get_(index);
        },
        set: function(value) {
            this[$mobx].set_(index, value);
        }
    };
}
function createArrayBufferItem(index) {
    mobx_esm_defineProperty(mobx_esm_LegacyObservableArray.prototype, "" + index, createArrayEntryDescriptor(index));
}
function reserveArrayBuffer(max) {
    if (max > OBSERVABLE_ARRAY_BUFFER_SIZE) {
        for(var index = OBSERVABLE_ARRAY_BUFFER_SIZE; index < max + 100; index++)createArrayBufferItem(index);
        OBSERVABLE_ARRAY_BUFFER_SIZE = max;
    }
}
reserveArrayBuffer(1000);
function createLegacyArray(initialValues, enhancer, name1) {
    return new mobx_esm_LegacyObservableArray(initialValues, enhancer, name1);
}
function mobx_esm_getAtom(thing, property) {
    if ("object" == typeof thing && null !== thing) {
        if (mobx_esm_isObservableArray(thing)) {
            if (void 0 !== property) die(23);
            return thing[$mobx].atom_;
        }
        if (isObservableSet(thing)) return thing.atom_;
        if (isObservableMap(thing)) {
            if (void 0 === property) return thing.keysAtom_;
            var observable = thing.data_.get(property) || thing.hasMap_.get(property);
            if (!observable) die(25, property, getDebugName(thing));
            return observable;
        }
        if (isObservableObject(thing)) {
            if (!property) return die(26);
            var _observable = thing[$mobx].values_.get(property);
            if (!_observable) die(27, property, getDebugName(thing));
            return _observable;
        }
        if (isAtom(thing) || isComputedValue(thing) || isReaction(thing)) return thing;
    } else if (isFunction(thing)) {
        if (isReaction(thing[$mobx])) return thing[$mobx];
    }
    die(28);
}
function getAdministration(thing, property) {
    if (!thing) die(29);
    if (void 0 !== property) return getAdministration(mobx_esm_getAtom(thing, property));
    if (isAtom(thing) || isComputedValue(thing) || isReaction(thing)) return thing;
    if (isObservableMap(thing) || isObservableSet(thing)) return thing;
    if (thing[$mobx]) return thing[$mobx];
    die(24, thing);
}
function getDebugName(thing, property) {
    var named;
    if (void 0 !== property) named = mobx_esm_getAtom(thing, property);
    else {
        if (mobx_esm_isAction(thing)) return thing.name;
        named = isObservableObject(thing) || isObservableMap(thing) || isObservableSet(thing) ? getAdministration(thing) : mobx_esm_getAtom(thing);
    }
    return named.name_;
}
function initObservable(cb) {
    var derivation = untrackedStart();
    var allowStateChanges = allowStateChangesStart(true);
    startBatch();
    try {
        return cb();
    } finally{
        endBatch();
        allowStateChangesEnd(allowStateChanges);
        untrackedEnd(derivation);
    }
}
var mobx_esm_toString = objectPrototype.toString;
function deepEqual(a, b, depth) {
    if (void 0 === depth) depth = -1;
    return eq(a, b, depth);
}
function eq(a, b, depth, aStack, bStack) {
    if (a === b) return 0 !== a || 1 / a === 1 / b;
    if (null == a || null == b) return false;
    if (a !== a) return b !== b;
    var type = typeof a;
    if ("function" !== type && "object" !== type && "object" != typeof b) return false;
    var className = mobx_esm_toString.call(a);
    if (className !== mobx_esm_toString.call(b)) return false;
    switch(className){
        case "[object RegExp]":
        case "[object String]":
            return "" + a === "" + b;
        case "[object Number]":
            if (+a !== +a) return +b !== +b;
            return 0 === +a ? 1 / a === 1 / b : +a === +b;
        case "[object Date]":
        case "[object Boolean]":
            return +a === +b;
        case "[object Symbol]":
            return "undefined" != typeof Symbol && Symbol.valueOf.call(a) === Symbol.valueOf.call(b);
        case "[object Map]":
        case "[object Set]":
            if (depth >= 0) depth++;
            break;
    }
    a = unwrap(a);
    b = unwrap(b);
    var areArrays = "[object Array]" === className;
    if (!areArrays) {
        if ("object" != typeof a || "object" != typeof b) return false;
        var aCtor = a.constructor, bCtor = b.constructor;
        if (aCtor !== bCtor && !(isFunction(aCtor) && aCtor instanceof aCtor && isFunction(bCtor) && bCtor instanceof bCtor) && "constructor" in a && "constructor" in b) return false;
    }
    if (0 === depth) return false;
    if (depth < 0) depth = -1;
    aStack = aStack || [];
    bStack = bStack || [];
    var length = aStack.length;
    while(length--)if (aStack[length] === a) return bStack[length] === b;
    aStack.push(a);
    bStack.push(b);
    if (areArrays) {
        length = a.length;
        if (length !== b.length) return false;
        while(length--)if (!eq(a[length], b[length], depth - 1, aStack, bStack)) return false;
    } else {
        var keys = Object.keys(a);
        var _length = keys.length;
        if (Object.keys(b).length !== _length) return false;
        for(var i = 0; i < _length; i++){
            var key = keys[i];
            if (!(hasProp(b, key) && eq(a[key], b[key], depth - 1, aStack, bStack))) return false;
        }
    }
    aStack.pop();
    bStack.pop();
    return true;
}
function unwrap(a) {
    if (mobx_esm_isObservableArray(a)) return a.slice();
    if (isES6Map(a) || isObservableMap(a)) return Array.from(a.entries());
    if (isES6Set(a) || isObservableSet(a)) return Array.from(a.entries());
    return a;
}
var _getGlobal$Iterator;
var maybeIteratorPrototype = (null == (_getGlobal$Iterator = /*#__PURE__*/ getGlobal().Iterator) ? void 0 : _getGlobal$Iterator.prototype) || {};
function makeIterable(iterator) {
    iterator[Symbol.iterator] = getSelf;
    return Object.assign(Object.create(maybeIteratorPrototype), iterator);
}
function getSelf() {
    return this;
}
function isAnnotation(thing) {
    return thing instanceof Object && "string" == typeof thing.annotationType_ && isFunction(thing.make_) && isFunction(thing.extend_);
}
[
    "Symbol",
    "Map",
    "Set"
].forEach(function(m) {
    var g = getGlobal();
    if (void 0 === g[m]) die("MobX requires global '" + m + "' to be available or polyfilled");
});
if ("object" == typeof __MOBX_DEVTOOLS_GLOBAL_HOOK__) __MOBX_DEVTOOLS_GLOBAL_HOOK__.injectMobx({
    spy: spy,
    extras: {
        getDebugName: getDebugName
    },
    $mobx: $mobx
});
function fail(message) {
    throw new Error("[mobx-utils] " + message);
}
function invariant(cond, message) {
    if (void 0 === message) message = "Illegal state";
    if (!cond) fail(message);
}
var deepFields = function(x) {
    return x && x !== Object.prototype && Object.getOwnPropertyNames(x).concat(deepFields(Object.getPrototypeOf(x)) || []);
};
var distinctDeepFields = function(x) {
    var deepFieldsIndistinct = deepFields(x);
    var deepFieldsDistinct = deepFieldsIndistinct.filter(function(item, index) {
        return deepFieldsIndistinct.indexOf(item) === index;
    });
    return deepFieldsDistinct;
};
var getAllMethodsAndProperties = function(x) {
    return distinctDeepFields(x).filter(function(name1) {
        return "constructor" !== name1 && !~name1.indexOf("__");
    });
};
var PENDING = "pending";
var FULFILLED = "fulfilled";
var REJECTED = "rejected";
function caseImpl(handlers) {
    switch(this.state){
        case PENDING:
            return handlers.pending && handlers.pending(this.value);
        case REJECTED:
            return handlers.rejected && handlers.rejected(this.value);
        case FULFILLED:
            return handlers.fulfilled ? handlers.fulfilled(this.value) : this.value;
    }
}
function mobx_utils_module_fromPromise(origPromise, oldPromise) {
    invariant(arguments.length <= 2, "fromPromise expects up to two arguments");
    invariant("function" == typeof origPromise || "object" == typeof origPromise && origPromise && "function" == typeof origPromise.then, "Please pass a promise or function to fromPromise");
    if (true === origPromise.isPromiseBasedObservable) return origPromise;
    if ("function" == typeof origPromise) origPromise = new Promise(origPromise);
    var promise = origPromise;
    origPromise.then(mobx_esm_action("observableFromPromise-resolve", function(value) {
        promise.value = value;
        promise.state = FULFILLED;
    }), mobx_esm_action("observableFromPromise-reject", function(reason) {
        promise.value = reason;
        promise.state = REJECTED;
    }));
    promise.isPromiseBasedObservable = true;
    promise.case = caseImpl;
    var oldData = oldPromise && (oldPromise.state === FULFILLED || oldPromise.state === PENDING) ? oldPromise.value : void 0;
    extendObservable(promise, {
        value: oldData,
        state: PENDING
    }, {}, {
        deep: false
    });
    return promise;
}
(function(fromPromise) {
    fromPromise.reject = mobx_esm_action("fromPromise.reject", function(reason) {
        var p = fromPromise(Promise.reject(reason));
        p.state = REJECTED;
        p.value = reason;
        return p;
    });
    function resolveBase(value) {
        if (void 0 === value) value = void 0;
        var p = fromPromise(Promise.resolve(value));
        p.state = FULFILLED;
        p.value = value;
        return p;
    }
    fromPromise.resolve = mobx_esm_action("fromPromise.resolve", resolveBase);
})(mobx_utils_module_fromPromise || (mobx_utils_module_fromPromise = {}));
var __decorate = function(decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : null === desc ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if ("object" == typeof Reflect && "function" == typeof Reflect.decorate) r = Reflect.decorate(decorators, target, key, desc);
    else for(var i = decorators.length - 1; i >= 0; i--)if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
(function() {
    function StreamListener(observable, initialValue) {
        var _this = this;
        Object.defineProperty(this, "current", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "subscription", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        makeObservable(this);
        mobx_esm_runInAction(function() {
            _this.current = initialValue;
            _this.subscription = observable.subscribe(_this);
        });
    }
    Object.defineProperty(StreamListener.prototype, "dispose", {
        enumerable: false,
        configurable: true,
        writable: true,
        value: function() {
            if (this.subscription) this.subscription.unsubscribe();
        }
    });
    Object.defineProperty(StreamListener.prototype, "next", {
        enumerable: false,
        configurable: true,
        writable: true,
        value: function(value) {
            this.current = value;
        }
    });
    Object.defineProperty(StreamListener.prototype, "complete", {
        enumerable: false,
        configurable: true,
        writable: true,
        value: function() {
            this.dispose();
        }
    });
    Object.defineProperty(StreamListener.prototype, "error", {
        enumerable: false,
        configurable: true,
        writable: true,
        value: function(value) {
            this.current = value;
            this.dispose();
        }
    });
    __decorate([
        mobx_esm_observable.ref
    ], StreamListener.prototype, "current", void 0);
    __decorate([
        mobx_esm_action.bound
    ], StreamListener.prototype, "next", null);
    __decorate([
        mobx_esm_action.bound
    ], StreamListener.prototype, "complete", null);
    __decorate([
        mobx_esm_action.bound
    ], StreamListener.prototype, "error", null);
    return StreamListener;
})();
var __assign = function() {
    __assign = Object.assign || function(t) {
        for(var s, i = 1, n = arguments.length; i < n; i++){
            s = arguments[i];
            for(var p in s)if (Object.prototype.hasOwnProperty.call(s, p)) t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __decorate$1 = function(decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : null === desc ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if ("object" == typeof Reflect && "function" == typeof Reflect.decorate) r = Reflect.decorate(decorators, target, key, desc);
    else for(var i = decorators.length - 1; i >= 0; i--)if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var RESERVED_NAMES = [
    "model",
    "reset",
    "submit",
    "isDirty",
    "isPropertyDirty",
    "resetProperty"
];
(function() {
    function ViewModel(model) {
        var _this = this;
        Object.defineProperty(this, "model", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: model
        });
        Object.defineProperty(this, "localValues", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: mobx_esm_observable.map({})
        });
        Object.defineProperty(this, "localComputedValues", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: mobx_esm_observable.map({})
        });
        Object.defineProperty(this, "isPropertyDirty", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: function(key) {
                return _this.localValues.has(key);
            }
        });
        makeObservable(this);
        invariant(isObservableObject(model), "createViewModel expects an observable object");
        var ownMethodsAndProperties = getAllMethodsAndProperties(this);
        getAllMethodsAndProperties(model).forEach(function(key) {
            var _a;
            if (ownMethodsAndProperties.includes(key)) return;
            if (key === $mobx || "__mobxDidRunLazyInitializers" === key) return;
            invariant(-1 === RESERVED_NAMES.indexOf(key), "The propertyname " + key + " is reserved and cannot be used with viewModels");
            if (isComputedProp(model, key)) {
                var computedBox = getAdministration(model, key);
                var get = computedBox.derivation.bind(_this);
                var set = null == (_a = computedBox.setter_) ? void 0 : _a.bind(_this);
                _this.localComputedValues.set(key, mobx_esm_computed(get, {
                    set: set
                }));
            }
            var descriptor = Object.getOwnPropertyDescriptor(model, key);
            var additionalDescriptor = descriptor ? {
                enumerable: descriptor.enumerable
            } : {};
            Object.defineProperty(_this, key, __assign(__assign({}, additionalDescriptor), {
                configurable: true,
                get: function() {
                    if (isComputedProp(model, key)) return _this.localComputedValues.get(key).get();
                    if (_this.isPropertyDirty(key)) return _this.localValues.get(key);
                    return _this.model[key];
                },
                set: mobx_esm_action(function(value) {
                    if (isComputedProp(model, key)) _this.localComputedValues.get(key).set(value);
                    else if (value !== _this.model[key]) _this.localValues.set(key, value);
                    else _this.localValues.delete(key);
                })
            }));
        });
    }
    Object.defineProperty(ViewModel.prototype, "isDirty", {
        get: function() {
            return this.localValues.size > 0;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(ViewModel.prototype, "changedValues", {
        get: function() {
            return new Map(this.localValues);
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(ViewModel.prototype, "submit", {
        enumerable: false,
        configurable: true,
        writable: true,
        value: function() {
            var _this = this;
            mobx_esm_keys(this.localValues).forEach(function(key) {
                var source = _this.localValues.get(key);
                var destination = _this.model[key];
                if (mobx_esm_isObservableArray(destination)) destination.replace(source);
                else if (isObservableMap(destination)) {
                    destination.clear();
                    destination.merge(source);
                } else if (!isComputed(source)) _this.model[key] = source;
            });
            this.localValues.clear();
        }
    });
    Object.defineProperty(ViewModel.prototype, "reset", {
        enumerable: false,
        configurable: true,
        writable: true,
        value: function() {
            this.localValues.clear();
        }
    });
    Object.defineProperty(ViewModel.prototype, "resetProperty", {
        enumerable: false,
        configurable: true,
        writable: true,
        value: function(key) {
            this.localValues.delete(key);
        }
    });
    __decorate$1([
        mobx_esm_computed
    ], ViewModel.prototype, "isDirty", null);
    __decorate$1([
        mobx_esm_computed
    ], ViewModel.prototype, "changedValues", null);
    __decorate$1([
        mobx_esm_action.bound
    ], ViewModel.prototype, "submit", null);
    __decorate$1([
        mobx_esm_action.bound
    ], ViewModel.prototype, "reset", null);
    __decorate$1([
        mobx_esm_action.bound
    ], ViewModel.prototype, "resetProperty", null);
    return ViewModel;
})();
var __assign$1 = function() {
    __assign$1 = Object.assign || function(t) {
        for(var s, i = 1, n = arguments.length; i < n; i++){
            s = arguments[i];
            for(var p in s)if (Object.prototype.hasOwnProperty.call(s, p)) t[p] = s[p];
        }
        return t;
    };
    return __assign$1.apply(this, arguments);
};
function buildPath(entry) {
    if (!entry) return "ROOT";
    var res = [];
    while(entry.parent){
        res.push(entry.path);
        entry = entry.parent;
    }
    return res.reverse().join("/");
}
function isRecursivelyObservable(thing) {
    return isObservableObject(thing) || mobx_esm_isObservableArray(thing) || isObservableMap(thing);
}
function deepObserve(target, listener) {
    var entrySet = new WeakMap();
    function genericListener(change) {
        var entry = entrySet.get(change.object);
        processChange(change, entry);
        listener(change, buildPath(entry), target);
    }
    function processChange(change, parent) {
        switch(change.type){
            case "add":
                observeRecursively(change.newValue, parent, change.name);
                break;
            case "update":
                unobserveRecursively(change.oldValue);
                observeRecursively(change.newValue, parent, change.name || "" + change.index);
                break;
            case "remove":
            case "delete":
                unobserveRecursively(change.oldValue);
                break;
            case "splice":
                change.removed.map(unobserveRecursively);
                change.added.forEach(function(value, idx) {
                    return observeRecursively(value, parent, "" + (change.index + idx));
                });
                for(var i = change.index + change.addedCount; i < change.object.length; i++)if (isRecursivelyObservable(change.object[i])) {
                    var entry = entrySet.get(change.object[i]);
                    if (entry) entry.path = "" + i;
                }
                break;
        }
    }
    function observeRecursively(thing, parent, path) {
        if (isRecursivelyObservable(thing)) {
            var entry = entrySet.get(thing);
            if (entry) {
                if (entry.parent !== parent || entry.path !== path) throw new Error("The same observable object cannot appear twice in the same tree," + (" trying to assign it to '" + buildPath(parent) + "/") + path + "'," + (" but it already exists at '" + buildPath(entry.parent) + "/") + entry.path + "'");
            } else {
                var entry_1 = {
                    parent: parent,
                    path: path,
                    dispose: mobx_esm_observe(thing, genericListener)
                };
                entrySet.set(thing, entry_1);
                mobx_esm_entries(thing).forEach(function(_a) {
                    var key = _a[0], value = _a[1];
                    return observeRecursively(value, entry_1, "" + key);
                });
            }
        }
    }
    function unobserveRecursively(thing) {
        if (isRecursivelyObservable(thing)) {
            var entry = entrySet.get(thing);
            if (!entry) return;
            entrySet.delete(thing);
            entry.dispose();
            mobx_esm_values(thing).forEach(unobserveRecursively);
        }
    }
    observeRecursively(target, void 0, "");
    return function() {
        unobserveRecursively(target);
    };
}
var __extends = function() {
    var extendStatics = function(d, b) {
        extendStatics = Object.setPrototypeOf || ({
            __proto__: []
        }) instanceof Array && function(d, b) {
            d.__proto__ = b;
        } || function(d, b) {
            for(var p in b)if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p];
        };
        return extendStatics(d, b);
    };
    return function(d, b) {
        extendStatics(d, b);
        function __() {
            this.constructor = d;
        }
        d.prototype = null === b ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
}();
(function(_super) {
    __extends(ObservableGroupMap, _super);
    function ObservableGroupMap(base, groupBy, _a) {
        var _b = void 0 === _a ? {} : _a, _c = _b.name, name1 = void 0 === _c ? "ogm" + (1000 * Math.random() | 0) : _c, _d = _b.keyToName, keyToName = void 0 === _d ? function(x) {
            return "" + x;
        } : _d;
        var _this = _super.call(this) || this;
        Object.defineProperty(_this, "_base", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(_this, "_ogmInfoKey", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(_this, "_groupBy", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(_this, "_keyToName", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(_this, "_disposeBaseObserver", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        _this._keyToName = keyToName;
        _this._groupBy = groupBy;
        _this._ogmInfoKey = Symbol("ogmInfo" + name1);
        _this._base = base;
        for(var i = 0; i < base.length; i++)_this._addItem(base[i]);
        _this._disposeBaseObserver = mobx_esm_observe(_this._base, function(change) {
            if ("splice" === change.type) transaction(function() {
                for(var _i = 0, _a = change.removed; _i < _a.length; _i++){
                    var removed = _a[_i];
                    _this._removeItem(removed);
                }
                for(var _b = 0, _c = change.added; _b < _c.length; _b++){
                    var added = _c[_b];
                    _this._addItem(added);
                }
            });
            else if ("update" === change.type) transaction(function() {
                _this._removeItem(change.oldValue);
                _this._addItem(change.newValue);
            });
            else throw new Error("illegal state");
        });
        return _this;
    }
    Object.defineProperty(ObservableGroupMap.prototype, "clear", {
        enumerable: false,
        configurable: true,
        writable: true,
        value: function() {
            throw new Error("not supported");
        }
    });
    Object.defineProperty(ObservableGroupMap.prototype, "delete", {
        enumerable: false,
        configurable: true,
        writable: true,
        value: function(_key) {
            throw new Error("not supported");
        }
    });
    Object.defineProperty(ObservableGroupMap.prototype, "set", {
        enumerable: false,
        configurable: true,
        writable: true,
        value: function(_key, _value) {
            throw new Error("not supported");
        }
    });
    Object.defineProperty(ObservableGroupMap.prototype, "dispose", {
        enumerable: false,
        configurable: true,
        writable: true,
        value: function() {
            this._disposeBaseObserver();
            for(var i = 0; i < this._base.length; i++){
                var item = this._base[i];
                var grouperItemInfo = item[this._ogmInfoKey];
                grouperItemInfo.reaction();
                delete item[this._ogmInfoKey];
            }
        }
    });
    Object.defineProperty(ObservableGroupMap.prototype, "_getGroupArr", {
        enumerable: false,
        configurable: true,
        writable: true,
        value: function(key) {
            var result = _super.prototype.get.call(this, key);
            if (void 0 === result) {
                result = mobx_esm_observable([], {
                    name: "GroupArray[" + this._keyToName(key) + "]",
                    deep: false
                });
                _super.prototype.set.call(this, key, result);
            }
            return result;
        }
    });
    Object.defineProperty(ObservableGroupMap.prototype, "_removeFromGroupArr", {
        enumerable: false,
        configurable: true,
        writable: true,
        value: function(key, itemIndex) {
            var arr = _super.prototype.get.call(this, key);
            if (1 === arr.length) _super.prototype.delete.call(this, key);
            else if (itemIndex === arr.length - 1) arr.length--;
            else {
                arr[itemIndex] = arr[arr.length - 1];
                arr[itemIndex][this._ogmInfoKey].groupArrIndex = itemIndex;
                arr.length--;
            }
        }
    });
    Object.defineProperty(ObservableGroupMap.prototype, "_addItem", {
        enumerable: false,
        configurable: true,
        writable: true,
        value: function(item) {
            var _this = this;
            var groupByValue = this._groupBy(item);
            var groupArr = this._getGroupArr(groupByValue);
            var value = {
                groupByValue: groupByValue,
                groupArrIndex: groupArr.length,
                reaction: mobx_esm_reaction(function() {
                    return _this._groupBy(item);
                }, function(newGroupByValue, _r) {
                    var grouperItemInfo = item[_this._ogmInfoKey];
                    _this._removeFromGroupArr(grouperItemInfo.groupByValue, grouperItemInfo.groupArrIndex);
                    var newGroupArr = _this._getGroupArr(newGroupByValue);
                    var newGroupArrIndex = newGroupArr.length;
                    newGroupArr.push(item);
                    grouperItemInfo.groupByValue = newGroupByValue;
                    grouperItemInfo.groupArrIndex = newGroupArrIndex;
                })
            };
            Object.defineProperty(item, this._ogmInfoKey, {
                configurable: true,
                enumerable: false,
                value: value
            });
            groupArr.push(item);
        }
    });
    Object.defineProperty(ObservableGroupMap.prototype, "_removeItem", {
        enumerable: false,
        configurable: true,
        writable: true,
        value: function(item) {
            var grouperItemInfo = item[this._ogmInfoKey];
            this._removeFromGroupArr(grouperItemInfo.groupByValue, grouperItemInfo.groupArrIndex);
            grouperItemInfo.reaction();
            delete item[this._ogmInfoKey];
        }
    });
    return ObservableGroupMap;
})(mobx_esm_ObservableMap);
var mobx_utils_module_DeepMapEntry = function() {
    function DeepMapEntry(base, args, version, versionChecker) {
        Object.defineProperty(this, "base", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: base
        });
        Object.defineProperty(this, "args", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: args
        });
        Object.defineProperty(this, "version", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: version
        });
        Object.defineProperty(this, "versionChecker", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: versionChecker
        });
        Object.defineProperty(this, "root", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "closest", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "closestIdx", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: 0
        });
        var current = this.closest = this.root = base;
        var i = 0;
        for(; i < this.args.length - 1; i++){
            current = current.get(args[i]);
            if (current) this.closest = current;
            else break;
        }
        this.closestIdx = i;
    }
    Object.defineProperty(DeepMapEntry.prototype, "exists", {
        enumerable: false,
        configurable: true,
        writable: true,
        value: function() {
            this.assertCurrentVersion();
            var l = this.args.length;
            return this.closestIdx >= l - 1 && this.closest.has(this.args[l - 1]);
        }
    });
    Object.defineProperty(DeepMapEntry.prototype, "get", {
        enumerable: false,
        configurable: true,
        writable: true,
        value: function() {
            this.assertCurrentVersion();
            if (!this.exists()) throw new Error("Entry doesn't exist");
            return this.closest.get(this.args[this.args.length - 1]);
        }
    });
    Object.defineProperty(DeepMapEntry.prototype, "set", {
        enumerable: false,
        configurable: true,
        writable: true,
        value: function(value) {
            this.assertCurrentVersion();
            var l = this.args.length;
            var current = this.closest;
            for(var i = this.closestIdx; i < l - 1; i++){
                var m = new Map();
                current.set(this.args[i], m);
                current = m;
            }
            this.closestIdx = l - 1;
            this.closest = current;
            current.set(this.args[l - 1], value);
        }
    });
    Object.defineProperty(DeepMapEntry.prototype, "delete", {
        enumerable: false,
        configurable: true,
        writable: true,
        value: function() {
            this.assertCurrentVersion();
            if (!this.exists()) throw new Error("Entry doesn't exist");
            var l = this.args.length;
            this.closest.delete(this.args[l - 1]);
            var c = this.root;
            var maps = [
                c
            ];
            for(var i = 0; i < l - 1; i++){
                c = c.get(this.args[i]);
                maps.push(c);
            }
            for(var i = maps.length - 1; i > 0; i--)if (0 === maps[i].size) maps[i - 1].delete(this.args[i - 1]);
        }
    });
    Object.defineProperty(DeepMapEntry.prototype, "assertCurrentVersion", {
        enumerable: false,
        configurable: true,
        writable: true,
        value: function() {
            if (!this.versionChecker(this.version)) throw new Error("Concurrent modification exception");
        }
    });
    return DeepMapEntry;
}();
(function() {
    function DeepMap() {
        var _this = this;
        Object.defineProperty(this, "store", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: new Map()
        });
        Object.defineProperty(this, "argsLength", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: -1
        });
        Object.defineProperty(this, "currentVersion", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: 0
        });
        Object.defineProperty(this, "checkVersion", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: function(version) {
                return _this.currentVersion === version;
            }
        });
    }
    Object.defineProperty(DeepMap.prototype, "entry", {
        enumerable: false,
        configurable: true,
        writable: true,
        value: function(args) {
            if (-1 === this.argsLength) this.argsLength = args.length;
            else if (this.argsLength !== args.length) throw new Error("DeepMap should be used with functions with a consistent length, expected: " + this.argsLength + ", got: " + args.length);
            if (this.currentVersion >= Number.MAX_SAFE_INTEGER) this.currentVersion = 0;
            this.currentVersion++;
            return new mobx_utils_module_DeepMapEntry(this.store, args, this.currentVersion, this.checkVersion);
        }
    });
    return DeepMap;
})();
var __assign$2 = function() {
    __assign$2 = Object.assign || function(t) {
        for(var s, i = 1, n = arguments.length; i < n; i++){
            s = arguments[i];
            for(var p in s)if (Object.prototype.hasOwnProperty.call(s, p)) t[p] = s[p];
        }
        return t;
    };
    return __assign$2.apply(this, arguments);
};
const UNIQUE_ID = Symbol('id');
const CONSTRUCT_KEY = '__ctor';
const SERIALIZE_CACHE = Symbol('serializeCache');
const FREEZED_DATA = Symbol('freezedData');
const BACKUP_DATA = Symbol('backupData');
const OBSERVABLE_DISPOSER = Symbol('observableDisposer');
const SERIALIZING = Symbol('serializing');
const DESERIALIZING = Symbol('deserializing');
const SERIALIZE_DATA = Symbol('serializeData');
const SERIALIZE_CREATE = Symbol('serializeCreate');
const SERIALIZE_GET_CONSTRUCT_ARGS = Symbol('serializeGetConstructArgs');
let uniqueId = 0;
let reentryCount = 0;
let deserializeObjects = {};
function addReentry(obj) {
    deserializeObjects[obj[UNIQUE_ID]] = obj;
    reentryCount++;
}
function releaseReentry() {
    if (0 === --reentryCount) deserializeObjects = {};
}
class LYSerializeableObserve extends EventEmitter {
}
let serializeable_observe;
class LYSerializeable extends LYObject {
    static [SERIALIZE_CREATE](ctor, ...args) {
        const { Construct } = ctor;
        return new Construct(...args);
    }
    static get observe() {
        serializeable_observe = serializeable_observe || new LYSerializeableObserve();
        return serializeable_observe;
    }
    static serialize(value) {
        if ('object' != typeof value && 'function' != typeof value && 'symbol' != typeof value) return value;
        if (null === value || value.constructor === Date) return value;
        if (value instanceof LYSerializeable) return value.serialize();
        if (Array.isArray(value)) return value.map((value)=>LYSerializeable.serialize(value));
        if (value.constructor === Object) return Object.keys(value).reduce((result, key)=>{
            result[key] = LYSerializeable.serialize(value[key]);
            return result;
        }, {});
        throw new Error(`unsupported serialize type ${value.constructor}`);
    }
    static deserialize(data, owner, property) {
        if ('object' != typeof data || null === data) return data;
        if (Array.isArray(data)) return data.map((value)=>LYSerializeable.deserialize(value, owner, property));
        if (CONSTRUCT_KEY in data) {
            const { ref, name: name1, args } = data[CONSTRUCT_KEY];
            if (ref) {
                if (!deserializeObjects[ref]) throw new Error(`can not find reference object ${ref}`);
                return deserializeObjects[ref];
            }
            const Construct = LYObject.getClass(name1);
            const create = Construct[SERIALIZE_CREATE] || LYSerializeable[SERIALIZE_CREATE];
            let self1;
            Construct[DESERIALIZING] = true;
            try {
                self1 = create({
                    Construct,
                    owner,
                    property
                }, ...args);
            } finally{
                Construct[DESERIALIZING] = false;
            }
            addReentry(self1);
            try {
                self1.deserialize(data);
                return self1;
            } finally{
                releaseReentry();
            }
        }
        return Object.entries(data).reduce((result, [key, value])=>{
            result[key] = LYSerializeable.deserialize(value, result, key);
            return result;
        }, {});
    }
    constructor(){
        super(), this[UNIQUE_ID] = ++uniqueId, this[SERIALIZING] = 0, this[DESERIALIZING] = 0, this[SERIALIZE_CACHE] = null, this[FREEZED_DATA] = null, this[SERIALIZE_DATA] = mobx_esm_observable({});
        this[OBSERVABLE_DISPOSER] = deepObserve(this[SERIALIZE_DATA], this.onDataChange.bind(this));
    }
    [SERIALIZE_GET_CONSTRUCT_ARGS]() {
        return [];
    }
    get isSerializing() {
        return this[SERIALIZING] > 0;
    }
    get isDeserializing() {
        return this.constructor[DESERIALIZING] || this[DESERIALIZING] > 0;
    }
    get freezed() {
        return !!this[FREEZED_DATA];
    }
    set freezed(value) {
        if (!!this[FREEZED_DATA] === value) return;
        if (value) this[FREEZED_DATA] = JSON.parse(JSON.stringify(this[SERIALIZE_DATA]));
        else {
            Object.assign(this[SERIALIZE_DATA], this[FREEZED_DATA]);
            this.onPropertyChange();
            this[FREEZED_DATA] = null;
        }
    }
    backup() {
        this[BACKUP_DATA] = this[FREEZED_DATA] || this[SERIALIZE_DATA];
        Object.values(this[BACKUP_DATA]).forEach((value)=>{
            if (value instanceof LYSerializeable) value.backup();
        });
    }
    restore() {
        Object.values(this[BACKUP_DATA]).forEach((value)=>{
            if (value instanceof LYSerializeable) value.restore();
        });
        Object.assign(this[FREEZED_DATA] || this[SERIALIZE_DATA], this[BACKUP_DATA]);
    }
    get serializeCached() {
        return !!this[SERIALIZE_CACHE];
    }
    clearSerializeCache() {
        this[SERIALIZE_CACHE] = null;
    }
    onDataChange(change, path) {
        const property = path && path.split('/')[0];
        if ('object' === change.observableKind) this.onPropertyChange(property || change.name);
        if ('array' === change.observableKind) this.onPropertyChange(property);
        this[SERIALIZE_CACHE] = null;
    }
    onPropertyChange(property) {
        serializeable_observe?.emit('property-change', this, property);
    }
    doSerialize() {
        return Object.entries(this[SERIALIZE_DATA]).reduce((result, [key, value])=>{
            result[key] = LYSerializeable.serialize(value);
            return result;
        }, {});
    }
    serialize() {
        if (this[FREEZED_DATA]) throw new Error('disallow serialize when freezed is true');
        if (this[SERIALIZE_CACHE]) return this[SERIALIZE_CACHE];
        this[SERIALIZING]++;
        try {
            if (this[SERIALIZING] > 1) this[SERIALIZE_CACHE] = {
                [CONSTRUCT_KEY]: {
                    ref: this[UNIQUE_ID]
                }
            };
            else {
                serializeable_observe?.emit('before-serialize', this);
                this[SERIALIZE_CACHE] = {
                    ...this.doSerialize(),
                    [CONSTRUCT_KEY]: {
                        name: LYObject.getClassName(this),
                        args: this[SERIALIZE_GET_CONSTRUCT_ARGS](),
                        id: this[UNIQUE_ID]
                    }
                };
                serializeable_observe?.emit('after-serialize', this);
            }
            return this[SERIALIZE_CACHE];
        } finally{
            this[SERIALIZING]--;
        }
    }
    doDeserialize(data) {
        Object.entries(data).forEach(([key, value])=>{
            if (key !== CONSTRUCT_KEY) this[SERIALIZE_DATA][key] = LYSerializeable.deserialize(value, this, key);
        });
    }
    deserialize(o) {
        if (this[FREEZED_DATA]) throw new Error('disallow deserialize when freezed is true');
        if (!(CONSTRUCT_KEY in o)) throw new Error('error deserialize object');
        this[UNIQUE_ID] = o[CONSTRUCT_KEY].id;
        addReentry(this);
        this[DESERIALIZING]++;
        try {
            serializeable_observe?.emit('before-deserialize', this);
            this.doDeserialize(o);
            this[SERIALIZE_CACHE] = o;
            serializeable_observe?.emit('after-deserialize', this);
        } finally{
            this[DESERIALIZING]--;
            releaseReentry();
        }
    }
    hasOwnProperty(key) {
        return this[SERIALIZE_DATA].hasOwnProperty(key) || Object.prototype.hasOwnProperty.call(this, key);
    }
}
const serialize = {
    include (target, property) {
        const proto = target;
        if (property in target) return;
        Object.defineProperty(proto, property, {
            get () {
                const data = this[FREEZED_DATA] || this[SERIALIZE_DATA];
                return data[property];
            },
            set (value) {
                const data = this[FREEZED_DATA] || this[SERIALIZE_DATA];
                if (data[property] === value) return;
                data[property] = value;
            }
        });
    }
};
configure({
    enforceActions: 'never'
});
const OBSERVABLE_STATIC_DATA = Symbol('observableStaticData');
class LYObservable extends LYSerializeable {
}
class LYOwnerObservable extends LYObservable {
    static [SERIALIZE_CREATE](ctor, ...args) {
        const { Construct } = ctor;
        return new Construct(ctor.owner, ...args);
    }
    constructor(owner){
        super();
        this._owner = owner;
    }
    get owner() {
        return this._owner;
    }
    set owner(value) {
        this._owner = value;
    }
}
const observable_observe = {
    action: mobx_esm_action,
    include (target, propertyOrContext) {
        if (propertyOrContext && 'object' == typeof propertyOrContext && 'kind' in propertyOrContext) {
            const ctx = propertyOrContext;
            if ('field' === ctx.kind) return function(initialValue) {
                const proto = Object.getPrototypeOf(this);
                if (!Object.prototype.hasOwnProperty.call(proto, ctx.name)) serialize.include(proto, ctx.name);
                return initialValue;
            };
            return;
        }
        const property = propertyOrContext;
        if ('function' == typeof target) {
            const targetAny = target;
            if (!targetAny[OBSERVABLE_STATIC_DATA]) targetAny[OBSERVABLE_STATIC_DATA] = mobx_esm_observable({});
            targetAny[OBSERVABLE_STATIC_DATA][property] = targetAny[property];
            Object.defineProperty(target, property, {
                get () {
                    const data = targetAny[OBSERVABLE_STATIC_DATA];
                    return data[property];
                },
                set (value) {
                    const data = targetAny[OBSERVABLE_STATIC_DATA];
                    if (data[property] !== value) data[property] = value;
                }
            });
        } else serialize.include(target, property);
    }
};
function storage_ts_decorate(decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : null === desc ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if ("object" == typeof Reflect && "function" == typeof Reflect.decorate) r = Reflect.decorate(decorators, target, key, desc);
    else for(var i = decorators.length - 1; i >= 0; i--)if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
}
function storage_ts_metadata(k, v) {
    if ("object" == typeof Reflect && "function" == typeof Reflect.metadata) return Reflect.metadata(k, v);
}
function stringify(val) {
    return void 0 === val || 'function' == typeof val ? '' : JSON.stringify(val);
}
function parse(value) {
    if ('string' != typeof value) return;
    try {
        return JSON.parse(value);
    } catch  {
        return value;
    }
}
class LYBaseLocalStorage extends LYObject {
    constructor(prefix, storage){
        super();
        this._prefix = prefix;
        this._storage = storage;
    }
    initSync() {}
    flushSync() {}
    getSync(key) {
        return parse(this._storage.getItem(this._prefix + key));
    }
    setSync(key, value) {
        const stringifyValue = stringify(value);
        this._storage.setItem(this._prefix + key, stringifyValue);
        this.emit('changed', {
            key,
            value
        });
    }
    hasSync(key) {
        const keys = this.keysSync();
        return keys.includes(key);
    }
    updateSync(key, func) {
        const value = this.getSync(key);
        const updateValue = func(cloneDeep(value));
        this._storage.setItem(this._prefix + key, stringify(updateValue));
        this.emit('changed', {
            key,
            value: updateValue
        });
    }
    removeSync(key) {
        this._storage.removeItem(this._prefix + key);
        this.emit('changed', {
            key
        });
        return true;
    }
    clearSync() {
        const delKeys = [];
        for(let i = 0; i < this._storage.length; i++){
            const key = this._storage.key(i);
            if (key && key.startsWith(this._prefix)) delKeys.push(key.slice(this._prefix.length));
        }
        delKeys.map((key)=>this.removeSync(key));
    }
    keysSync() {
        const result = [];
        for(let i = 0; i < this._storage.length; i++){
            const key = this._storage.key(i);
            if (key && 0 === key.indexOf(this._prefix)) result.push(key.slice(this._prefix.length));
        }
        return result;
    }
    valuesSync() {
        const result = [];
        for(let i = 0; i < this._storage.length; i++){
            const key = this._storage.key(i);
            if (key && 0 === key.indexOf(this._prefix)) {
                const value = this._storage.getItem(key);
                if (value) result.push(JSON.parse(value));
            }
        }
        return result;
    }
    entriesSync() {
        const result = [];
        for(let i = 0; i < this._storage.length; i++){
            const key = this._storage.key(i);
            if (key && 0 === key.indexOf(this._prefix)) {
                const value = this._storage.getItem(key);
                if (value) {
                    const parsedValue = JSON.parse(value);
                    result.push([
                        key.slice(this._prefix.length),
                        parsedValue
                    ]);
                }
            }
        }
        return result;
    }
}
LYBaseLocalStorage = storage_ts_decorate([
    register('LYBaseLocalStorage'),
    storage_ts_metadata("design:type", Function),
    storage_ts_metadata("design:paramtypes", [
        String,
        "undefined" == typeof Storage ? Object : Storage
    ])
], LYBaseLocalStorage);
class LYLocalStorage extends LYBaseLocalStorage {
    constructor(prefix){
        super(prefix, localStorage);
        window.addEventListener('storage', (e)=>{
            if (e.key && e.key.startsWith(prefix)) this.emit('changed', {
                key: e.key.slice(prefix.length),
                value: e.newValue ? JSON.parse(e.newValue) : void 0,
                isCrossWindow: true
            });
        });
    }
}
LYLocalStorage = storage_ts_decorate([
    register('LYLocalStorage'),
    storage_ts_metadata("design:type", Function),
    storage_ts_metadata("design:paramtypes", [
        String
    ])
], LYLocalStorage);
class LYSessionStorage extends LYBaseLocalStorage {
    constructor(prefix){
        super(prefix, sessionStorage);
    }
}
LYSessionStorage = storage_ts_decorate([
    register('LYSessionStorage'),
    storage_ts_metadata("design:type", Function),
    storage_ts_metadata("design:paramtypes", [
        String
    ])
], LYSessionStorage);
let storage_impl;
function setCloudStorageImpl(value) {
    storage_impl = value;
}
class LYCloudStorage extends LYObject {
    constructor(prefix){
        super();
        this._prefix = prefix;
    }
    get keyValueImpl() {
        return storage_impl || LYObject.getInstance('LYCloudStorage');
    }
    async init() {}
    async flush() {}
    async get(key) {
        const value = await this.keyValueImpl.getValue(this._prefix + key);
        return parse(value);
    }
    async set(key, value) {
        const stringifyValue = stringify(value);
        await this.keyValueImpl.setValue(this._prefix + key, stringifyValue);
        this.emit('changed', {
            key,
            value
        });
    }
    async has(key) {
        const keys = await this.keys();
        return keys.includes(key);
    }
    async update(key, func) {
        const value = await this.get(key);
        const updateValue = await func(cloneDeep(value));
        await this.keyValueImpl.setValue(this._prefix + key, stringify(updateValue));
        this.emit('changed', {
            key,
            value: updateValue
        });
    }
    async remove(key) {
        await this.keyValueImpl.remove([
            this._prefix + key
        ]);
        this.emit('changed', {
            key
        });
    }
    async clear() {
        const keys = await this.keys();
        await this.keyValueImpl.clear(this._prefix);
        keys.map((key)=>this.emit('changed', {
                key
            }));
    }
    async keys() {
        const keys = await this.keyValueImpl.getKeys();
        return keys.filter((key)=>key.startsWith(this._prefix)).map((key)=>key.slice(this._prefix.length));
    }
    async values() {
        const all = await this.keyValueImpl.getAll();
        const result = [];
        for (const [key, value] of Object.entries(all))if (key.startsWith(this._prefix)) result.push(parse(value));
        return result;
    }
    async entries() {
        const all = await this.keyValueImpl.getAll();
        const result = [];
        for (const [key, value] of Object.entries(all))if (key.startsWith(this._prefix)) result.push([
            key.slice(this._prefix.length),
            parse(value)
        ]);
        return result;
    }
}
LYCloudStorage = storage_ts_decorate([
    register('LYCloudStorage'),
    storage_ts_metadata("design:type", Function),
    storage_ts_metadata("design:paramtypes", [
        String
    ])
], LYCloudStorage);
const sharedLocalStorage = new LYLocalStorage('LY.');
const sharedCloudStorage = new LYCloudStorage('LY.');
class LYBaseHttpError extends LYError {
    constructor(message, url, method, inner_error){
        super(message);
        this._url = url;
        this._method = method;
        this._inner_error = inner_error;
    }
    get url() {
        return this._url;
    }
    get method() {
        return this._method;
    }
    get inner_error() {
        return this._inner_error;
    }
}
class LYConfigError extends LYBaseHttpError {
}
class LYNetworkError extends LYBaseHttpError {
}
var error_LYHttpStatus = /*#__PURE__*/ function(LYHttpStatus) {
    LYHttpStatus[LYHttpStatus["SUCCESS"] = 200] = "SUCCESS";
    LYHttpStatus[LYHttpStatus["BAD_REQUEST"] = 400] = "BAD_REQUEST";
    LYHttpStatus[LYHttpStatus["UNAUTHORIZED"] = 401] = "UNAUTHORIZED";
    LYHttpStatus[LYHttpStatus["FORBIDDEN"] = 403] = "FORBIDDEN";
    LYHttpStatus[LYHttpStatus["NOT_FOUND"] = 404] = "NOT_FOUND";
    LYHttpStatus[LYHttpStatus["TOO_MANY_REQUESTS"] = 429] = "TOO_MANY_REQUESTS";
    LYHttpStatus[LYHttpStatus["INTERNAL_SERVER_ERROR"] = 500] = "INTERNAL_SERVER_ERROR";
    return LYHttpStatus;
}({});
class LYHttpStatusError extends LYBaseHttpError {
    constructor(message, url, method, inner_error, status){
        super(message, url, method, inner_error);
        this._status = status;
    }
    get status() {
        return this._status;
    }
    getStatus() {
        if ('string' == typeof error_LYHttpStatus[this._status]) return this._status;
    }
}
class LYAppHttpError extends LYBaseHttpError {
    constructor(message, url, method, inner_error, code){
        super(message, url, method, inner_error);
        this._code = code;
    }
    getCode() {
        return this._code;
    }
}
var runtime = __webpack_require__("../../node_modules/.pnpm/@module-federation+enhanced@0.8.12_@rspack+core@1.7.0_react-dom@18.3.1_react@18.3.1_typescript@5.9.3_webpack@5.104.1/node_modules/@module-federation/enhanced/dist/src/runtime.js");
class LYAppPermission extends LYObject {
    constructor(app_name, codes){
        super(), this._codes = {};
        this._app_name = app_name;
        this._codes = codes;
    }
    get app_name() {
        return this._app_name;
    }
    getActions(code) {
        if (!(code in this._codes)) return [];
        return this._codes[code];
    }
}
function session_ts_decorate(decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : null === desc ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if ("object" == typeof Reflect && "function" == typeof Reflect.decorate) r = Reflect.decorate(decorators, target, key, desc);
    else for(var i = decorators.length - 1; i >= 0; i--)if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
}
function session_ts_metadata(k, v) {
    if ("object" == typeof Reflect && "function" == typeof Reflect.metadata) return Reflect.metadata(k, v);
}
const SESSION_KEY = 'session';
class LYSession extends LYObject {
    static{
        this._CHECK_INTERVAL = 10000;
    }
    static get() {
        if (!LYSession._session) {
            const session = sharedLocalStorage.getSync(SESSION_KEY);
            if (session) {
                const { type, authentication_name, id, token, user_id, user_name, expires_in, permissions, is_first_login, created_at = Date.now(), display_name = '', email = '', phone = '', country_code = '' } = session;
                LYSession._session = new LYSession(type, authentication_name, id, token, user_id, user_name, expires_in, permissions, created_at, is_first_login, display_name, email, phone, country_code);
                LYSession._startRefreshTimer();
            }
        }
        return LYSession._session;
    }
    static create(type, authentication_name, id, token, user_id, user_name, expires_in, permissions, is_first_login, display_name, email, phone, country_code) {
        const created_at = Date.now();
        LYSession._session = new LYSession(type, authentication_name, id, token, user_id, user_name, expires_in, permissions, created_at, is_first_login, display_name, email, phone, country_code);
        sharedLocalStorage.setSync(SESSION_KEY, {
            type,
            authentication_name,
            id,
            token,
            user_id,
            user_name,
            expires_in,
            permissions,
            created_at,
            is_first_login,
            display_name: display_name || '',
            email: email || '',
            phone: phone || '',
            country_code: country_code || ''
        });
        LYSession._startRefreshTimer();
        return LYSession._session;
    }
    static clear() {
        LYSession._session = void 0;
        sharedLocalStorage.removeSync(SESSION_KEY);
        LYSession._stopRefreshTimer();
    }
    constructor(type, authentication_name, id, token, user_id, user_name, expires_in, permissions, created_at, is_first_login, display_name, email, phone, country_code){
        super();
        this._type = type;
        this._authentication_name = authentication_name;
        this._id = id;
        this._token = token;
        this._user_id = user_id;
        this._user_name = user_name;
        this._expires_in = expires_in;
        this._created_at = created_at;
        this._is_first_login = is_first_login;
        this._display_name = display_name || '';
        this._email = email || '';
        this._phone = phone || '';
        this._country_code = country_code || '';
        this._permissions = Object.entries(permissions || {}).reduce((acc, [app_name, codes])=>{
            acc[app_name] = new LYAppPermission(app_name, codes);
            return acc;
        }, {});
    }
    get type() {
        return this._type;
    }
    get authentication_name() {
        return this._authentication_name;
    }
    get id() {
        return this._id;
    }
    get token() {
        return this._token;
    }
    get user_id() {
        return this._user_id;
    }
    get user_name() {
        return this._user_name;
    }
    get expires_in() {
        return this._expires_in;
    }
    get permissions() {
        return this._permissions;
    }
    get created_at() {
        return this._created_at;
    }
    get is_first_login() {
        return this._is_first_login;
    }
    get display_name() {
        return this._display_name;
    }
    get email() {
        return this._email;
    }
    get phone() {
        return this._phone;
    }
    get country_code() {
        return this._country_code;
    }
    isExpired() {
        const now = Date.now();
        const expirationTime = this._created_at + 1000 * this._expires_in;
        return now >= expirationTime;
    }
    isNearExpiration() {
        const now = Date.now();
        const expirationTime = this._created_at + 1000 * this._expires_in;
        const fifteenSecondsInMs = 15000;
        return expirationTime - now <= fifteenSecondsInMs;
    }
    static setRefreshCallback(callback) {
        LYSession._refreshCallback = callback;
    }
    static async getValid() {
        const session = LYSession.get();
        if (!session) return;
        if (session.isExpired()) if (!LYSession._refreshCallback) return void LYSession.clear();
        else try {
            await LYSession._refreshCallback(session);
            return LYSession.get();
        } catch (error) {
            LYSession.clear();
            return;
        }
        if (session.isNearExpiration()) {
            if (LYSession._refreshCallback) try {
                await LYSession._refreshCallback(session);
            } catch (error) {
                console.warn('Session refresh failed but session is still valid:', error);
            }
        }
        return session;
    }
    static update(id, token, user_id, user_name, expires_in, permissions, display_name, email, phone, country_code) {
        if (LYSession._session) {
            const created_at = Date.now();
            LYSession._session._id = id;
            LYSession._session._token = token;
            LYSession._session._user_id = user_id;
            LYSession._session._user_name = user_name;
            LYSession._session._expires_in = expires_in;
            LYSession._session._created_at = created_at;
            if (void 0 !== display_name) LYSession._session._display_name = display_name;
            if (void 0 !== email) LYSession._session._email = email;
            if (void 0 !== phone) LYSession._session._phone = phone;
            if (void 0 !== country_code) LYSession._session._country_code = country_code;
            LYSession._session._permissions = Object.entries(permissions || {}).reduce((acc, [app_name, codes])=>{
                acc[app_name] = new LYAppPermission(app_name, codes);
                return acc;
            }, {});
            sharedLocalStorage.setSync(SESSION_KEY, {
                type: LYSession._session._type,
                authentication_name: LYSession._session._authentication_name,
                id,
                token,
                user_id,
                user_name,
                expires_in,
                permissions,
                created_at,
                is_first_login: LYSession._session._is_first_login,
                display_name: LYSession._session._display_name,
                email: LYSession._session._email,
                phone: LYSession._session._phone,
                country_code: LYSession._session._country_code
            });
        }
    }
    static _startRefreshTimer() {
        LYSession._stopRefreshTimer();
        LYSession._refreshTimer = setInterval(async ()=>{
            try {
                await LYSession._checkAndRefreshSession();
            } catch (error) {
                console.error('Session refresh timer error:', error);
            }
        }, LYSession._CHECK_INTERVAL);
    }
    static _stopRefreshTimer() {
        if (LYSession._refreshTimer) {
            clearInterval(LYSession._refreshTimer);
            LYSession._refreshTimer = void 0;
        }
    }
    static async _checkAndRefreshSession() {
        const session = LYSession._session;
        if (!session) return void LYSession._stopRefreshTimer();
        if (session.isExpired()) if (LYSession._refreshCallback) try {
            await LYSession._refreshCallback(session);
        } catch (error) {
            console.warn('Session expired and refresh failed, clearing session:', error);
            LYSession.clear();
        }
        else {
            console.warn('Session expired and no refresh callback available, clearing session');
            LYSession.clear();
        }
        else if (session.isNearExpiration()) {
            if (LYSession._refreshCallback) try {
                await LYSession._refreshCallback(session);
            } catch (error) {
                console.warn('Session refresh failed but session is still valid:', error);
            }
        }
    }
}
LYSession = session_ts_decorate([
    register('LYSession'),
    session_ts_metadata("design:type", Function),
    session_ts_metadata("design:paramtypes", [
        "undefined" == typeof LYSessionType ? Object : LYSessionType,
        String,
        String,
        String,
        String,
        String,
        Number,
        "undefined" == typeof Record ? Object : Record,
        Number,
        Boolean,
        String,
        String,
        String,
        String
    ])
], LYSession);
function i18n_ts_decorate(decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : null === desc ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if ("object" == typeof Reflect && "function" == typeof Reflect.decorate) r = Reflect.decorate(decorators, target, key, desc);
    else for(var i = decorators.length - 1; i >= 0; i--)if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
}
function i18n_ts_metadata(k, v) {
    if ("object" == typeof Reflect && "function" == typeof Reflect.metadata) return Reflect.metadata(k, v);
}
var i18n_LYLangEnum = /*#__PURE__*/ function(LYLangEnum) {
    LYLangEnum["zh-CN"] = "简体中文";
    LYLangEnum["en-US"] = "English";
    return LYLangEnum;
}({});
const i18n_langKeys = Object.keys(i18n_LYLangEnum);
const languages = {};
const LANG_KEY = 'lang';
class LYi18n extends LYObject {
    constructor(namespace){
        super();
        this._namespace = namespace || 'LY.';
    }
    get t() {
        return (rest, options)=>{
            if (!rest) return "<Null>";
            if (rest.includes(':')) return rest.startsWith(`${this.namespace}:`) ? i18next.t(rest, options) : i18next.t(`${this.namespace}.${rest}`, options);
            return i18next.t(`${this.namespace}:${rest}`, options);
        };
    }
    get lang() {
        return this._lang || this.resolveLanguage();
    }
    get languages() {
        return languages;
    }
    get namespace() {
        return this._namespace;
    }
    async initialize() {
        if (!this._lang) this._lang = this.resolveLanguage();
        i18next.on('languageChanged', (lang)=>{
            if (this._lang !== lang) {
                this._lang = lang;
                this.emit('lang-changed', lang);
            }
        });
        if (i18next.isInitialized) return;
        const defaultVariables = {};
        const env = LYEnv.getInstance(this._namespace);
        for(const key in env)defaultVariables['$' + key] = env[key];
        await i18next.init({
            fallbackLng: 'zh-CN',
            lng: this._lang,
            defaultNS: this.namespace,
            returnObjects: true,
            interpolation: {
                escapeValue: false,
                defaultVariables
            }
        });
        await this.changeLanguage(this._lang);
    }
    fallbackLng(lang) {
        if (lang.includes('en')) return 'en-US';
        return 'zh-CN';
    }
    resolveLanguage() {
        const langKeys = Object.keys(this.languages);
        if (1 === langKeys.length) return this.fallbackLng(langKeys[0]);
        const searchParams = new URLSearchParams(location.search);
        let lang = searchParams.get(LANG_KEY);
        if (lang) {
            lang = this.fallbackLng(lang);
            return lang;
        }
        if (!sharedLocalStorage.getSync(LANG_KEY)) {
            lang = this.fallbackLng(navigator.language);
            return lang;
        }
        lang = sharedLocalStorage.getSync(LANG_KEY) || 'zh-CN';
        return lang;
    }
    async loadResource(urlOrJson, lang, namespace) {
        if ('string' == typeof urlOrJson) {
            const res = await this.getUrlResource(urlOrJson);
            if (!res) return;
            urlOrJson = res;
        }
        if (!urlOrJson) return;
        lang = lang || this._lang;
        namespace = namespace ? `${this.namespace}.${namespace}` : this.namespace;
        i18next.addResourceBundle(lang, namespace, urlOrJson);
    }
    async getUrlResource(resourceUrl) {
        try {
            const res = await axios.get(`${resourceUrl}?v=${window.buildTime}`);
            return res.data;
        } catch (error) {
            this.logger.error("loadUrlResource error");
            this.logger.error(error);
        }
    }
    async changeLanguage(lang) {
        this.logger.info(`changeLanguage lang to ${lang}`);
        this._lang = lang;
        i18next.isInitialized && await i18next.changeLanguage(lang);
        sharedLocalStorage.setSync(LANG_KEY, lang);
        const url = new URL(window.location.href);
        url.searchParams.delete(LANG_KEY);
        window.history.replaceState(null, '', url);
        i18next.isInitialized && this.emit('lang-changed', lang);
    }
    getResource(key, lang) {
        lang = lang || this._lang;
        let index = key.indexOf(':');
        key = index <= 0 ? `${this.namespace}:${key}` : key.startsWith(`${this.namespace}:`) ? key : `${this.namespace}.${key}`;
        index = key.indexOf(':');
        const ns = key.substring(0, index);
        const keys = key.substring(index + 1);
        if (!ns || !keys) return {};
        const res = i18next.getResourceBundle(lang, ns);
        if (!res) return {};
        const resource = keys.split('.').reduce((result, key)=>result[key], res);
        if (!resource && keys === this.namespace) return res;
        return resource;
    }
}
LYi18n = i18n_ts_decorate([
    register('LYi18n'),
    i18n_ts_metadata("design:type", Function),
    i18n_ts_metadata("design:paramtypes", [
        String
    ])
], LYi18n);
function app_base_ts_decorate(decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : null === desc ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if ("object" == typeof Reflect && "function" == typeof Reflect.decorate) r = Reflect.decorate(decorators, target, key, desc);
    else for(var i = decorators.length - 1; i >= 0; i--)if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
}
function base_ts_metadata(k, v) {
    if ("object" == typeof Reflect && "function" == typeof Reflect.metadata) return Reflect.metadata(k, v);
}
const CONFIG_URL = "/uci/system_info";
const TENANT_APP_NAME = 'tenant';
const ORGANIZATION_APP_NAME = 'organization';
(0, runtime.init)({
    name: 'uci',
    remotes: []
});
class LYDefaultAppProvider extends LYObject {
    provideI18nResourcePath(app, lang) {
        const { i18n } = app;
        return `${app.env.baseUrl}/i18n/assets/${lang || i18n.lang}/`;
    }
    async provideI18nResource(app) {
        const { i18n } = app;
        const result = {};
        for (const key of i18n_langKeys){
            const lang = key;
            const resource = await i18n.getUrlResource(`${app.env.baseUrl}/i18n/locale/${lang}.json`);
            result[lang] = resource;
        }
        return result;
    }
}
LYDefaultAppProvider = app_base_ts_decorate([
    register('LYDefaultAppProvider')
], LYDefaultAppProvider);
class base_LYBaseApp extends LYObject {
    static{
        this._apps = {};
    }
    static{
        this._initLock = false;
    }
    static get apps() {
        return base_LYBaseApp._apps;
    }
    static getAppClassName(appName) {
        const camelCase = appName.replace(/_([a-z])/g, (_, letter)=>letter.toUpperCase());
        return `LY${camelCase.charAt(0).toUpperCase() + camelCase.slice(1)}App`;
    }
    static async init(config_url = CONFIG_URL) {
        if (this._initLock) throw new LYError('Application initialization in progress');
        this._initLock = true;
        try {
            if (0 === Object.keys(base_LYBaseApp._apps).length) {
                const config = await LYConfig.load(config_url);
                config.apps = [
                    ...config.apps,
                    {
                        name: "agentic_doc_processor",
                        version: "1.1.0"
                    }
                ];
                for (const app of config.apps)if (app.name === TENANT_APP_NAME) {
                    const Constructor = LYObject.getClass('LYTenantApp');
                    base_LYBaseApp._apps[app.name] = new Constructor(app.name, app.version, '');
                } else if (app.name === ORGANIZATION_APP_NAME) {
                    const Constructor = LYObject.getClass('LYOrganizationApp');
                    base_LYBaseApp._apps[app.name] = new Constructor(app.name, app.version, '');
                } else {
                    const specificAppClassName = this.getAppClassName(app.name);
                    let Constructor;
                    try {
                        Constructor = LYObject.getClass(specificAppClassName);
                    } catch  {
                        Constructor = LYObject.getClass('LYApp');
                    }
                    base_LYBaseApp._apps[app.name] = new Constructor(app.name, app.version, '');
                }
            }
        } finally{
            this._initLock = false;
        }
    }
    static getAll() {
        return this._apps;
    }
    static get(name1) {
        return this._apps[name1];
    }
    static setHeaderProvider(headerProvider) {
        base_LYBaseApp._headerProvider = headerProvider;
    }
    static getHeaderProvider() {
        return base_LYBaseApp._headerProvider;
    }
    constructor(name1, version, description){
        super(), this._isLoaded = false;
        this._name = name1;
        this._version = version;
        this._description = description;
        this._i18n = new LYi18n(name1);
        const prefix = `${this._name}.`;
        this._localStore = new LYLocalStorage(prefix);
        this._sessionStore = new LYSessionStorage(prefix);
        this._cloudStore = new LYCloudStorage(prefix);
        this._env = new LYEnv(this._name);
        this._env.baseUrl = this.getBaseUrl();
        this._httpClient = this._createHttpClient();
    }
    get location() {
        return this._name;
    }
    get name() {
        return this._name;
    }
    get tenantName() {
        return this._tenantName;
    }
    get version() {
        return this._version;
    }
    get description() {
        return this._description;
    }
    get httpClient() {
        return this._httpClient;
    }
    get permission() {
        const session = LYSession.get();
        if (!session) throw new Error('session not found');
        return session.permissions[this._name];
    }
    get provider() {
        return this._provider || new LYDefaultAppProvider();
    }
    get i18n() {
        return this._i18n;
    }
    get localStore() {
        return this._localStore;
    }
    get sessionStore() {
        return this._sessionStore;
    }
    get cloudStore() {
        return this._cloudStore;
    }
    get isLoaded() {
        return this._isLoaded;
    }
    get env() {
        return this._env;
    }
    _createHttpClient() {
        return new http_LYAppHttpClient(this._name, {
            get headers () {
                return base_LYBaseApp.getHeaderProvider().headers;
            }
        });
    }
    async load() {
        if (this._isLoaded) return;
        this.logger.info(`start run ${this._name} app`);
        await this.doLoad();
        this._isLoaded = true;
        this.logger.info(`run ${this._name} app completed`);
    }
    getBaseUrl() {
        const config = LYConfig.get();
        const url = new URL(window.location.href);
        let baseUrl = "";
        for (const pattern of config.host_patterns){
            if (!pattern.includes("{tenant_name}") && pattern.startsWith(url.origin)) {
                const parts = url.pathname.split('/');
                const index = parts.findIndex((part)=>'view' === part);
                let tenantName = parts[index + 2];
                if (!tenantName) throw new Error('tenantName not found');
                baseUrl = `${pattern}/view/${this.name}/${tenantName}`;
                this._tenantName = tenantName;
                return baseUrl;
            }
            let filterhost = pattern.replace(/\./g, "\\.").replace("{tenant_name}", "([a-zA-Z0-9_\\-]+)");
            const reg = new RegExp(`^${filterhost}(?::\\d+)?(?:/.*)?$`);
            const matched = url.toString().match(reg);
            if (matched && matched[1]) {
                const tenantName = matched[1];
                const host = pattern.replace("{tenant_name}", tenantName);
                baseUrl = `${host}/view/${this.name}`;
                this._tenantName = tenantName;
                return baseUrl;
            }
        }
        try {
            const parts = url.pathname.split('/');
            const index = parts.findIndex((part)=>'view' === part);
            if (-1 === index) throw new Error('view not found in URL');
            let tenantName = parts[index + 2];
            if (!tenantName) throw new Error('tenantName not found');
            baseUrl = `${window.origin}/view/${this.name}/${tenantName}`;
            this._tenantName = tenantName;
            return baseUrl;
        } catch (error) {
            console.error('Error getting base URL:', error);
        }
        return window.origin;
    }
    async doLoad() {
        await this.initI18n();
    }
    async initI18n() {
        try {
            const resources = await this.provider.provideI18nResource(this);
            await this._i18n.initialize();
            for(const key in resources)this._i18n.loadResource(resources[key] || {}, key);
        } catch (error) {
            this.logger.error('initI18n error');
            this.logger.error(error);
        }
    }
    getI18nResourceUrl(relativeUrl, lang) {
        const baseUrl = this.provider.provideI18nResourcePath(this, lang) || '';
        try {
            const url = new URL(relativeUrl, baseUrl);
            return url.toString();
        } catch (error) {
            return `${baseUrl}/${relativeUrl}`;
        }
    }
    async getComponent(componentName) {
        if (this._remoteComponents) return this._remoteComponents[componentName];
        await this.loadRemoteComponents();
        return this._remoteComponents[componentName];
    }
    async loadRemoteComponents() {
        const isLoaded = this._isLoadingComponent;
        while(this._isLoadingComponent)await wait();
        if (isLoaded) return this._remoteComponents;
        this._isLoadingComponent = true;
        try {
            (0, runtime.registerRemotes)([
                {
                    name: this.name,
                    entry: `${this.env.baseUrl}/mf-manifest.json`
                }
            ]);
            const remoteModule = await (0, runtime.loadRemote)(`${this.name}/Index`);
            this._remoteComponents = await remoteModule.default(this);
        } catch (error) {
            this._remoteComponents = {};
            this.logger.error("loadRemoteComponents error:", error);
        } finally{
            this._isLoadingComponent = false;
        }
        return this._remoteComponents;
    }
}
base_LYBaseApp = app_base_ts_decorate([
    register('LYBaseApp'),
    base_ts_metadata("design:type", Function),
    base_ts_metadata("design:paramtypes", [
        String,
        String,
        String
    ])
], base_LYBaseApp);
class LYBaseTenantApp extends base_LYBaseApp {
    _createHttpClient() {
        const lang = this._i18n.lang;
        return new LYTenantHttpClient(this.name, {
            get headers () {
                const session = LYSession.get();
                if (!session) return;
                return {
                    Authorization: `Bearer ${session.token}`,
                    'Accept-Language': lang
                };
            }
        });
    }
}
LYBaseTenantApp = app_base_ts_decorate([
    register('LYBaseTenantApp')
], LYBaseTenantApp);
class session_LYSessionApi {
    constructor(httpClient){
        this._httpClient = httpClient;
    }
    async create(request) {
        if (!request.name) request = {
            ...request,
            name: ""
        };
        const result = await this._httpClient.post("/session", request);
        return result.data;
    }
    async update(id) {
        const response = await this._httpClient.post(`/session/patch/${id}`);
        return response.data;
    }
    async delete(id) {
        const response = await this._httpClient.post(`/session/delete/${id}`);
        return response.data.count;
    }
    async getLoginWays() {
        const response = await this._httpClient.get("/loginways");
        return response.data;
    }
}
class LYUserApi {
    constructor(httpClient){
        this._httpClient = httpClient;
    }
    async query(params) {
        const response = await this._httpClient.get('/user', params);
        return response.data;
    }
    async get(name1) {
        const response = await this._httpClient.get(`/user/${name1}`);
        return response.data;
    }
    async add(user) {
        const response = await this._httpClient.post("/user", {
            ...user,
            password: user.password
        });
        return response.data.id;
    }
    async update(name1, user) {
        const response = await this._httpClient.post(`/user/patch/${name1}`, {
            ...user,
            password: user.password
        });
        return response.data.count;
    }
    async remove(name1) {
        const response = await this._httpClient.post(`/user/delete/${name1}`);
        return response.data.count;
    }
    async accountCheck(request) {
        const response = await this._httpClient.post("/user/account-check", {
            ...request
        });
        return response.data.exists;
    }
    async register(request) {
        const response = await this._httpClient.post("/user/registration", {
            ...request
        });
        return response.data;
    }
    async userNameCheck(name1) {
        const response = await this._httpClient.get(`/user/username-check/${name1}`);
        return response.data.available;
    }
    async changePassword(currentPassword, newPassword) {
        const response = await this._httpClient.post("/user/password/change", {
            current_password: currentPassword,
            new_password: newPassword
        });
        return response.data;
    }
    async resetPassword(request) {
        const response = await this._httpClient.post("/user/password", {
            ...request
        });
        return response.data;
    }
}
const base_ORGANIZATION_APP_NAME = 'organization';
class LYBaseAuthorizer extends LYObject {
    constructor(app, name1){
        super();
        this._app = app;
        this._name = name1;
    }
    get app() {
        return this._app;
    }
    get name() {
        return this._name;
    }
    async signin(args) {
        await this._signin(args);
        this.emit('status-change', 'signed-in');
        if (args.redirect_uri) setTimeout(()=>{
            window.location.href = args.redirect_uri;
        }, 0);
    }
    async signout(args) {
        await this._signout(args);
        this.emit('status-change', 'signed-out');
        setTimeout(()=>{
            const baseUrl = new URL(this.app.env.baseUrl);
            baseUrl.searchParams.set('returnUrl', encodeURIComponent(args.redirect_uri || window.location.href));
            window.location.href = baseUrl.toString();
        }, 0);
    }
}
function web_ts_decorate(decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : null === desc ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if ("object" == typeof Reflect && "function" == typeof Reflect.decorate) r = Reflect.decorate(decorators, target, key, desc);
    else for(var i = decorators.length - 1; i >= 0; i--)if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
}
function web_ts_metadata(k, v) {
    if ("object" == typeof Reflect && "function" == typeof Reflect.metadata) return Reflect.metadata(k, v);
}
class LYWebAuthorizer extends LYBaseAuthorizer {
    constructor(app, name1, sessionApi){
        super(app, name1);
        this._sessionApi = sessionApi;
        LYSession.setRefreshCallback(this._refreshSession.bind(this));
    }
    async _signin(args) {
        const response = await this._sessionApi.create({
            name: args.name,
            password: args.password,
            email: args.email,
            phone: args.phone,
            country_code: args.country_code,
            account_type: args.account_type,
            verification_code: args.verification_code,
            verification_code_id: args.verification_code_id
        });
        LYSession.create('web', '', response.id, response.access_token, response.user_id, response.user_name, response.expires_in, response.permission_codes, response.is_first_login, response.display_name, response.email, response.phone, response.country_code);
    }
    async _signout(args) {
        const session = LYSession.get();
        if (!session) throw new Error('Session not found');
        const count = await this._sessionApi.delete(session.id);
        if (0 === count) throw new Error('Session not found');
        LYSession.clear();
    }
    async _refreshSession(session) {
        const response = await this._sessionApi.update(session.id);
        LYSession.update(response.id, response.access_token, response.user_id, response.user_name, response.expires_in, response.permission_codes);
    }
}
LYWebAuthorizer = web_ts_decorate([
    register('LYWebAuthorizer'),
    web_ts_metadata("design:type", Function),
    web_ts_metadata("design:paramtypes", [
        "undefined" == typeof LYBaseApp ? Object : LYBaseApp,
        String,
        "undefined" == typeof LYSessionApi ? Object : LYSessionApi
    ])
], LYWebAuthorizer);
function gateway_ts_decorate(decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : null === desc ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if ("object" == typeof Reflect && "function" == typeof Reflect.decorate) r = Reflect.decorate(decorators, target, key, desc);
    else for(var i = decorators.length - 1; i >= 0; i--)if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
}
class LYGatewayAuthorizer extends LYBaseAuthorizer {
    async _signin(args) {
        const app = base_LYBaseApp.get(base_ORGANIZATION_APP_NAME);
        const response = await app.httpClient.post('sso/gateway/session');
        LYSession.create('gateway', '', response.id, response.access_token, response.user_id, response.user_name, response.expires_in, response.permission_codes);
    }
    async _signout(args) {
        const session = LYSession.get();
        if (!session) throw new Error('Session not found');
        const app = base_LYBaseApp.get(base_ORGANIZATION_APP_NAME);
        const response = await app.httpClient.post(`sso/gateway/session/delete/${session.id}`);
        if (0 === response.count) throw new Error('Session not found');
        LYSession.clear();
    }
}
LYGatewayAuthorizer = gateway_ts_decorate([
    register('LYGatewayAuthorizer')
], LYGatewayAuthorizer);
function direct_ts_decorate(decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : null === desc ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if ("object" == typeof Reflect && "function" == typeof Reflect.decorate) r = Reflect.decorate(decorators, target, key, desc);
    else for(var i = decorators.length - 1; i >= 0; i--)if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
}
class LYDirectAuthorizer extends LYBaseAuthorizer {
    async _signin(args) {
        const app = base_LYBaseApp.get(base_ORGANIZATION_APP_NAME);
        const response = await app.httpClient.post('sso/direct/session', {
            authentication_name: args.authentication_name,
            user_name: args.user_name,
            password: args.password
        });
        LYSession.create('direct', args.authentication_name, response.id, response.access_token, response.user_id, response.user_name, response.expires_in, response.permission_codes);
    }
    async _signout(args) {
        const session = LYSession.get();
        if (!session) throw new Error('Session not found');
        const app = base_LYBaseApp.get(base_ORGANIZATION_APP_NAME);
        const response = await app.httpClient.post(`sso/direct/session/delete/${session.id}`, {
            authentication_name: session.authentication_name
        });
        if (0 === response.count) throw new Error('Session not found');
        LYSession.clear();
    }
}
LYDirectAuthorizer = direct_ts_decorate([
    register('LYDirectAuthorizer')
], LYDirectAuthorizer);
function redirect_ts_decorate(decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : null === desc ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if ("object" == typeof Reflect && "function" == typeof Reflect.decorate) r = Reflect.decorate(decorators, target, key, desc);
    else for(var i = decorators.length - 1; i >= 0; i--)if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
}
const REDIRECT_STORAGE_KEY = 'sso_redirect_info';
const REDIRECT_STORAGE_EXPIRES_IN = 600000;
class PKCEUtils {
    static generateCodeVerifier() {
        const array = new Uint8Array(32);
        crypto.getRandomValues(array);
        return btoa(String.fromCharCode.apply(null, Array.from(array))).replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
    }
    static async generateCodeChallenge(codeVerifier) {
        const encoder = new TextEncoder();
        const data = encoder.encode(codeVerifier);
        const digest = await crypto.subtle.digest('SHA-256', data);
        return btoa(String.fromCharCode.apply(null, Array.from(new Uint8Array(digest)))).replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
    }
    static generateState() {
        const array = new Uint8Array(16);
        crypto.getRandomValues(array);
        return btoa(String.fromCharCode.apply(null, Array.from(array))).replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
    }
}
class LYRedirectAuthorizer extends LYBaseAuthorizer {
    async _signin(args) {
        const redirectInfo = sharedLocalStorage.getSync(REDIRECT_STORAGE_KEY);
        if (redirectInfo) if (redirectInfo.expires_at < new Date()) sharedLocalStorage.removeSync(REDIRECT_STORAGE_KEY);
        else {
            const queryParams = this._getQueryParams();
            const code = queryParams.code;
            const state = queryParams.state;
            const locale = queryParams.ui_locales;
            if (code && state) {
                if (state !== redirectInfo.state) throw new Error('Invalid state parameter');
                const app = base_LYBaseApp.get(base_ORGANIZATION_APP_NAME);
                if (locale) await app.i18n.changeLanguage(locale);
                try {
                    const response = await app.httpClient.post('sso/redirect/session', {
                        authentication_name: redirectInfo.authentication_name,
                        query_params: {
                            code: code,
                            code_verifier: redirectInfo.code_verifier,
                            redirect_uri: redirectInfo.redirect_uri,
                            state: redirectInfo.state
                        }
                    });
                    if (!response || !response.data.access_token) throw new Error('Invalid SSO response: missing access token');
                    LYSession.create('redirect', redirectInfo.authentication_name, response.data.id, response.data.access_token, response.data.user_id, response.data.user_name, response.data.expires_in, response.data.permission_codes, response.data.is_first_login, response.data.display_name, response.data.email, response.data.phone, response.data.country_code);
                    this.emit('status-change', 'signed-in');
                    sharedLocalStorage.removeSync(REDIRECT_STORAGE_KEY);
                    setTimeout(()=>{
                        window.location.href = redirectInfo.redirect_uri;
                    }, 0);
                    return;
                } catch (error) {
                    console.error('SSO login failed:', error);
                    sharedLocalStorage.removeSync(REDIRECT_STORAGE_KEY);
                }
            }
        }
        if (args.sso_config) await this._jumpToSSO(args.sso_config, args.redirect_uri);
        else throw new Error('SSO configuration not provided');
    }
    signin(args) {
        return this._signin(args);
    }
    async _jumpToSSO(ssoConfig, redirectUri) {
        const codeVerifier = PKCEUtils.generateCodeVerifier();
        const codeChallenge = await PKCEUtils.generateCodeChallenge(codeVerifier);
        const state = PKCEUtils.generateState();
        const ssoUrl = new URL(ssoConfig.auth_url);
        ssoUrl.searchParams.set('code_challenge', codeChallenge);
        ssoUrl.searchParams.set('code_challenge_method', 'S256');
        ssoUrl.searchParams.set('state', state);
        sharedLocalStorage.setSync(REDIRECT_STORAGE_KEY, {
            authentication_name: ssoConfig.name,
            redirect_uri: redirectUri,
            expires_at: new Date(Date.now() + REDIRECT_STORAGE_EXPIRES_IN),
            code_verifier: codeVerifier,
            state: state,
            sso_config: ssoConfig
        });
        setTimeout(()=>{
            window.location.href = ssoUrl.toString();
        }, 0);
    }
    _getQueryParams() {
        const params = {};
        const urlParams = new URLSearchParams(window.location.search);
        urlParams.forEach((value, key)=>{
            params[key] = value;
        });
        return params;
    }
    async signout(args) {
        await this._signout();
    }
    async _signout() {
        const session = LYSession.get();
        if (!session) throw new Error('Session not found');
        const app = base_LYBaseApp.get(base_ORGANIZATION_APP_NAME);
        const response = await app.httpClient.post(`sso/redirect/session/delete/${session.id}`, {
            authentication_name: session.authentication_name
        });
        if (0 === response.data.count) throw new Error('Session not found');
        LYSession.clear();
        if (response.data.logout_url) {
            this.emit('status-change', 'signed-out');
            window.location.href = response.data.logout_url;
        }
    }
}
LYRedirectAuthorizer = redirect_ts_decorate([
    register('LYRedirectAuthorizer')
], LYRedirectAuthorizer);
class LYLicenseApi {
    constructor(httpClient){
        this._httpClient = httpClient;
    }
    async queryFiles() {
        const response = await this._httpClient.get("/license/file");
        return response.data;
    }
    async getFileContent(id) {
        const response = await this._httpClient.get(`/license/file/content/${id}`);
        return response.data;
    }
    async add(license) {
        const response = await this._httpClient.post("/license", license);
        return response.data.id;
    }
    async getAll() {
        const response = await this._httpClient.get("/license");
        return response.data;
    }
    async get(id) {
        const response = await this._httpClient.get(`/license/${id}`);
        return response.data;
    }
    async remove(id) {
        const response = await this._httpClient.post(`/license/delete/${id}`);
        return response.data.count;
    }
    async getTokens() {
        const response = await this._httpClient.get("/license/token");
        return response.data;
    }
    async getToken(id) {
        const response = await this._httpClient.get(`/license/token/${id}`);
        return response.data;
    }
    async getLogs(licenseId, tokenId) {
        const response = await this._httpClient.get("/license/log", {
            license_id: licenseId,
            token_id: tokenId
        });
        return response.data;
    }
}
class LYBaseCrypto {
}
function registerCryptoImpl(name1) {
    return function(impl) {
        if (cryptoImpl[name1]) throw new Error(`Crypto implementation for ${name1} already registered`);
        cryptoImpl[name1] = impl;
        return impl;
    };
}
const cryptoImpl = {
    default: void 0,
    sm: void 0,
    gm: void 0
};
function sm_ts_decorate(decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : null === desc ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if ("object" == typeof Reflect && "function" == typeof Reflect.decorate) r = Reflect.decorate(decorators, target, key, desc);
    else for(var i = decorators.length - 1; i >= 0; i--)if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
}
class LYSMCrypto extends LYBaseCrypto {
    _paddingIv(iv) {
        if (iv.length < 16) {
            const padded = new Uint8Array(16);
            padded.set(iv);
            return padded;
        }
        return iv.slice(0, 16);
    }
    _uint8ArrayToHex(array) {
        return Array.from(array).map((b)=>b.toString(16).padStart(2, '0')).join('');
    }
    _hexToUint8Array(hex) {
        if (hex.length % 2 !== 0) throw new LYCryptoError('Invalid hex string length');
        const result = new Uint8Array(hex.length / 2);
        for(let i = 0; i < hex.length; i += 2)result[i / 2] = parseInt(hex.substring(i, i + 2), 16);
        return result;
    }
    _validateKey(key, expectedLength, keyType) {
        if (key.length !== expectedLength) throw new LYCryptoError(`Invalid ${keyType} key length: expected ${expectedLength}, got ${key.length}`);
    }
    _validatePublicKey(key) {
        if (64 !== key.length && 65 !== key.length) throw new LYCryptoError(`Invalid SM2 public key length: expected 64 or 65, got ${key.length}`);
    }
    getSymmetricBlockSize(iv, key) {
        return 16;
    }
    getAsymmetricBlockSize(publicKey) {
        return 16;
    }
    encryptSymmetric(data, iv, key) {
        try {
            this._validateKey(key, 16, 'SM4');
            const paddedIv = this._paddingIv(iv);
            const keyHex = this._uint8ArrayToHex(key);
            const ivHex = this._uint8ArrayToHex(paddedIv);
            const dataHex = this._uint8ArrayToHex(data);
            const encrypted = sm4.encrypt(dataHex, keyHex, {
                iv: ivHex,
                mode: 'cbc',
                padding: 'pkcs#7'
            });
            if (!encrypted) throw new LYCryptoError('SM4 encryption failed');
            return this._hexToUint8Array(encrypted);
        } catch (error) {
            if (error instanceof LYCryptoError) throw error;
            throw new LYCryptoError(`SM4 encryption error: ${error instanceof Error ? error.message : String(error)}`);
        }
    }
    decryptSymmetric(data, iv, key) {
        try {
            this._validateKey(key, 16, 'SM4');
            const paddedIv = this._paddingIv(iv);
            const keyHex = this._uint8ArrayToHex(key);
            const ivHex = this._uint8ArrayToHex(paddedIv);
            const dataHex = this._uint8ArrayToHex(data);
            const decrypted = sm4.decrypt(dataHex, keyHex, {
                iv: ivHex,
                mode: 'cbc',
                padding: 'pkcs#7'
            });
            if (!decrypted) throw new LYCryptoError('SM4 decryption failed');
            return this._hexToUint8Array(decrypted);
        } catch (error) {
            if (error instanceof LYCryptoError) throw error;
            throw new LYCryptoError(`SM4 decryption error: ${error instanceof Error ? error.message : String(error)}`);
        }
    }
    signature(data, privateKey) {
        try {
            this._validateKey(privateKey, 32, 'SM2 private');
            const dataHex = this._uint8ArrayToHex(data);
            const privateKeyHex = this._uint8ArrayToHex(privateKey);
            const signature = sm2.doSignature(dataHex, privateKeyHex);
            if (!signature) throw new LYCryptoError('SM2 signature failed');
            return signature;
        } catch (error) {
            if (error instanceof LYCryptoError) throw error;
            throw new LYCryptoError(`SM2 signature error: ${error instanceof Error ? error.message : String(error)}`);
        }
    }
    verify(data, publicKey, signature) {
        try {
            this._validatePublicKey(publicKey);
            const dataHex = this._uint8ArrayToHex(data);
            const publicKeyHex = this._uint8ArrayToHex(publicKey);
            return sm2.doVerifySignature(dataHex, signature, publicKeyHex);
        } catch (error) {
            if (error instanceof LYCryptoError) throw error;
            throw new LYCryptoError(`SM2 verify error: ${error instanceof Error ? error.message : String(error)}`);
        }
    }
    encryptAsymmetric(data, publicKey) {
        try {
            this._validatePublicKey(publicKey);
            const dataHex = this._uint8ArrayToHex(data);
            const publicKeyHex = this._uint8ArrayToHex(publicKey);
            const encrypted = sm2.doEncrypt(dataHex, publicKeyHex);
            if (!encrypted) throw new LYCryptoError('SM2 encryption failed');
            return this._hexToUint8Array(encrypted);
        } catch (error) {
            if (error instanceof LYCryptoError) throw error;
            throw new LYCryptoError(`SM2 encryption error: ${error instanceof Error ? error.message : String(error)}`);
        }
    }
    decryptAsymmetric(data, privateKey) {
        try {
            this._validateKey(privateKey, 32, 'SM2 private');
            const dataHex = this._uint8ArrayToHex(data);
            const privateKeyHex = this._uint8ArrayToHex(privateKey);
            const decrypted = sm2.doDecrypt(dataHex, privateKeyHex);
            if (!decrypted) throw new LYCryptoError('SM2 decryption failed');
            return this._hexToUint8Array(decrypted);
        } catch (error) {
            if (error instanceof LYCryptoError) throw error;
            throw new LYCryptoError(`SM2 decryption error: ${error instanceof Error ? error.message : String(error)}`);
        }
    }
    hash(data, key) {
        try {
            if (key) {
                const hmacResult = sm3(data, {
                    key,
                    mode: 'hmac'
                });
                if (!hmacResult) throw new LYCryptoError('SM3 HMAC failed');
                return this._hexToUint8Array(hmacResult);
            }
            {
                const hashResult = sm3(data);
                if (!hashResult) throw new LYCryptoError('SM3 hash failed');
                return this._hexToUint8Array(hashResult);
            }
        } catch (error) {
            if (error instanceof LYCryptoError) throw error;
            throw new LYCryptoError(`SM3 hash error: ${error instanceof Error ? error.message : String(error)}`);
        }
    }
}
LYSMCrypto = sm_ts_decorate([
    registerCryptoImpl("sm")
], LYSMCrypto);
function gm_ts_decorate(decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : null === desc ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if ("object" == typeof Reflect && "function" == typeof Reflect.decorate) r = Reflect.decorate(decorators, target, key, desc);
    else for(var i = decorators.length - 1; i >= 0; i--)if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
}
class LYGMCrypto extends LYSMCrypto {
}
LYGMCrypto = gm_ts_decorate([
    registerCryptoImpl("gm")
], LYGMCrypto);
function crypto_ts_decorate(decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : null === desc ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if ("object" == typeof Reflect && "function" == typeof Reflect.decorate) r = Reflect.decorate(decorators, target, key, desc);
    else for(var i = decorators.length - 1; i >= 0; i--)if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
}
function crypto_ts_metadata(k, v) {
    if ("object" == typeof Reflect && "function" == typeof Reflect.metadata) return Reflect.metadata(k, v);
}
const LENGTH_SIZE = 2;
class LYCrypto extends LYObject {
    constructor(){
        super();
        this._ivGetter = ()=>new Uint8Array(16);
        this._keyGetter = ()=>new Uint8Array(16);
    }
    get impl() {
        if (!this._impl) this._createImpl();
        if (!this._impl) throw new LYCryptoError('Crypto implementation not available');
        return this._impl;
    }
    _createImpl() {
        try {
            const config = this._getCryptoConfig();
            const implClass = cryptoImpl[config.type];
            if (!implClass) throw new LYCryptoError(`Crypto implementation ${config.type} not found`);
            this._impl = new implClass();
        } catch (error) {
            throw new LYCryptoError(`Failed to create crypto implementation: ${error instanceof Error ? error.message : String(error)}`);
        }
    }
    _getCryptoConfig() {
        const config = new LYCryptoConfig();
        config.type = 'sm';
        return config;
    }
    _uint8ArrayToHex(array) {
        return Array.from(array).map((b)=>b.toString(16).padStart(2, '0')).join('');
    }
    _hexToUint8Array(hex) {
        if (hex.length % 2 !== 0) throw new LYCryptoError('Invalid hex string length');
        const result = new Uint8Array(hex.length / 2);
        for(let i = 0; i < hex.length; i += 2)result[i / 2] = parseInt(hex.substring(i, i + 2), 16);
        return result;
    }
    _stringToUint8Array(str) {
        return new TextEncoder().encode(str);
    }
    _uint8ArrayToString(array) {
        return new TextDecoder().decode(array);
    }
    _base64ToUint8Array(base64) {
        const binaryString = atob(base64);
        const bytes = new Uint8Array(binaryString.length);
        for(let i = 0; i < binaryString.length; i++)bytes[i] = binaryString.charCodeAt(i);
        return bytes;
    }
    _uint8ArrayToBase64(array) {
        let binaryString = '';
        array.forEach((byte)=>{
            binaryString += String.fromCharCode(byte);
        });
        return btoa(binaryString);
    }
    _getIvAndKey(iv, key) {
        const actualIv = iv ? 'string' == typeof iv ? this._hexToUint8Array(iv) : iv : this._ivGetter();
        const actualKey = key ? 'string' == typeof key ? this._hexToUint8Array(key) : key : this._keyGetter();
        return [
            actualIv,
            actualKey
        ];
    }
    _getKey(key, defaultKey) {
        if (key) return 'string' == typeof key ? this._hexToUint8Array(key) : key;
        if (defaultKey) return defaultKey;
        throw new LYCryptoError('Key not provided and no default key available');
    }
    _getEncryptPublicKey(publicKey) {
        const key = this._getKey(publicKey, this._encryptPublicKey);
        return key;
    }
    _getDecryptPrivateKey(privateKey) {
        const key = this._getKey(privateKey, this._decryptPrivateKey);
        return key;
    }
    _getSignaturePrivateKey(privateKey) {
        const key = this._getKey(privateKey, this._signaturePrivateKey);
        return key;
    }
    _getVerifyPublicKey(publicKey) {
        const key = this._getKey(publicKey, this._verifyPublicKey);
        return key;
    }
    async *_makeSize(data, size) {
        let buffer = new Uint8Array(0);
        for await (const chunk of data){
            const newBuffer = new Uint8Array(buffer.length + chunk.length);
            newBuffer.set(buffer);
            newBuffer.set(chunk, buffer.length);
            buffer = newBuffer;
            while(buffer.length >= size){
                yield buffer.slice(0, size);
                buffer = buffer.slice(size);
            }
        }
        if (buffer.length > 0) yield buffer;
    }
    setSymmetricKeyGetter(ivGetter, keyGetter) {
        this._ivGetter = ivGetter;
        this._keyGetter = keyGetter;
    }
    setEncryptPublicKey(publicKey) {
        this._encryptPublicKey = 'string' == typeof publicKey ? this._hexToUint8Array(publicKey) : publicKey;
    }
    setDecryptPrivateKey(privateKey) {
        this._decryptPrivateKey = 'string' == typeof privateKey ? this._hexToUint8Array(privateKey) : privateKey;
    }
    setSignaturePrivateKey(privateKey) {
        this._signaturePrivateKey = 'string' == typeof privateKey ? this._hexToUint8Array(privateKey) : privateKey;
    }
    setVerifyPublicKey(publicKey) {
        this._verifyPublicKey = 'string' == typeof publicKey ? this._hexToUint8Array(publicKey) : publicKey;
    }
    encryptSymmetric(data, iv, key) {
        if ('string' == typeof data) return this._encryptSymmetricStr(data, iv, key);
        if (ArrayBuffer.isView(data)) return this._encryptSymmetricBytes(data, iv, key);
        return this._encryptSymmetricStream(data, iv, key);
    }
    _encryptSymmetricBytes(data, iv, key) {
        if (!data || 0 === data.length) return new Uint8Array(data);
        const [actualIv, actualKey] = this._getIvAndKey(iv, key);
        return this.impl.encryptSymmetric(data, actualIv, actualKey);
    }
    _encryptSymmetricStr(data, iv, key) {
        const dataBytes = this._stringToUint8Array(data);
        const result = this._encryptSymmetricBytes(dataBytes, iv, key);
        return this._uint8ArrayToBase64(result);
    }
    async *_encryptSymmetricStream(data, iv, key) {
        const [actualIv, actualKey] = this._getIvAndKey(iv, key);
        const blockSize = this.impl.getSymmetricBlockSize(actualIv, actualKey);
        for await (const chunk of this._makeSize(data, blockSize)){
            if (!chunk || 0 === chunk.length) {
                yield chunk;
                continue;
            }
            const buffer = this.impl.encryptSymmetric(chunk, actualIv, actualKey);
            const lengthBytes = new Uint8Array(LENGTH_SIZE);
            const view = new DataView(lengthBytes.buffer);
            view.setUint16(0, buffer.length, false);
            yield lengthBytes;
            yield buffer;
        }
    }
    decryptSymmetric(data, iv, key) {
        if ('string' == typeof data) return this._decryptSymmetricStr(data, iv, key);
        if (ArrayBuffer.isView(data)) return this._decryptSymmetricBytes(data, iv, key);
        return this._decryptSymmetricStream(data, iv, key);
    }
    _decryptSymmetricBytes(data, iv, key) {
        if (!data || 0 === data.length) return new Uint8Array(data);
        const [actualIv, actualKey] = this._getIvAndKey(iv, key);
        return this.impl.decryptSymmetric(data, actualIv, actualKey);
    }
    _decryptSymmetricStr(data, iv, key) {
        const dataBytes = this._base64ToUint8Array(data);
        const result = this._decryptSymmetricBytes(dataBytes, iv, key);
        return this._uint8ArrayToString(result);
    }
    async *_decryptSymmetricStream(data, iv, key) {
        const [actualIv, actualKey] = this._getIvAndKey(iv, key);
        let buffer = new Uint8Array(0);
        let size = -1;
        for await (const chunk of data){
            const newBuffer = new Uint8Array(buffer.length + chunk.length);
            newBuffer.set(buffer);
            newBuffer.set(chunk, buffer.length);
            buffer = newBuffer;
            while(true){
                if (size <= 0 && buffer.length < LENGTH_SIZE) break;
                if (size <= 0) {
                    const view = new DataView(buffer.buffer, buffer.byteOffset);
                    size = view.getUint16(0, false);
                    buffer = buffer.slice(LENGTH_SIZE);
                }
                if (buffer.length < size) break;
                const encryptedChunk = buffer.slice(0, size);
                yield this.impl.decryptSymmetric(encryptedChunk, actualIv, actualKey);
                buffer = buffer.slice(size);
                size = -1;
            }
        }
        if (buffer.length > 0) yield this.impl.decryptSymmetric(buffer, actualIv, actualKey);
    }
    encryptAsymmetric(data, publicKey) {
        if ('string' == typeof data) return this._encryptAsymmetricStr(data, publicKey);
        if (data instanceof Uint8Array) return this._encryptAsymmetricBytes(data, publicKey);
        return this._encryptAsymmetricStream(data, publicKey);
    }
    _encryptAsymmetricBytes(data, publicKey) {
        if (!data || 0 === data.length) return new Uint8Array(0);
        const key = this._getEncryptPublicKey(publicKey);
        return this.impl.encryptAsymmetric(data, key);
    }
    _encryptAsymmetricStr(data, publicKey) {
        if (!data) return '';
        const dataBytes = this._stringToUint8Array(data);
        const result = this._encryptAsymmetricBytes(dataBytes, publicKey);
        return this._uint8ArrayToBase64(result);
    }
    async *_encryptAsymmetricStream(data, publicKey) {
        try {
            const key = this._getEncryptPublicKey(publicKey);
            for await (const chunk of data){
                if (!chunk || 0 === chunk.length) {
                    yield new Uint8Array(0);
                    continue;
                }
                yield this.impl.encryptAsymmetric(chunk, key);
            }
        } catch (error) {
            throw new LYCryptoError(`Stream asymmetric encryption failed: ${error instanceof Error ? error.message : String(error)}`);
        }
    }
    decryptAsymmetric(data, privateKey) {
        if ('string' == typeof data) return this._decryptAsymmetricStr(data, privateKey);
        if (data instanceof Uint8Array) return this._decryptAsymmetricBytes(data, privateKey);
        return this._decryptAsymmetricStream(data, privateKey);
    }
    _decryptAsymmetricBytes(data, privateKey) {
        if (!data || 0 === data.length) return new Uint8Array(0);
        const key = this._getDecryptPrivateKey(privateKey);
        return this.impl.decryptAsymmetric(data, key);
    }
    _decryptAsymmetricStr(data, privateKey) {
        if (!data) return '';
        const dataBytes = this._base64ToUint8Array(data);
        const result = this._decryptAsymmetricBytes(dataBytes, privateKey);
        return this._uint8ArrayToString(result);
    }
    async *_decryptAsymmetricStream(data, privateKey) {
        try {
            const key = this._getDecryptPrivateKey(privateKey);
            for await (const chunk of data){
                if (!chunk || 0 === chunk.length) {
                    yield new Uint8Array(0);
                    continue;
                }
                yield this.impl.decryptAsymmetric(chunk, key);
            }
        } catch (error) {
            throw new LYCryptoError(`Stream asymmetric decryption failed: ${error instanceof Error ? error.message : String(error)}`);
        }
    }
    signature(data, privateKey) {
        if ('string' == typeof data) return this._signatureStr(data, privateKey);
        return this._signatureBytes(data, privateKey);
    }
    _signatureBytes(data, privateKey) {
        if (!data || 0 === data.length) return '';
        const key = this._getSignaturePrivateKey(privateKey);
        return this.impl.signature(data, key);
    }
    _signatureStr(data, privateKey) {
        if (!data) return '';
        const dataBytes = this._stringToUint8Array(data);
        return this._signatureBytes(dataBytes, privateKey);
    }
    verify(data, signature, publicKey) {
        if ('string' == typeof data) return this._verifyStr(data, signature, publicKey);
        return this._verifyBytes(data, signature, publicKey);
    }
    _verifyBytes(data, signature, publicKey) {
        if (!data || 0 === data.length || !signature) return false;
        const key = this._getVerifyPublicKey(publicKey);
        return this.impl.verify(data, key, signature);
    }
    _verifyStr(data, signature, publicKey) {
        if (!data || !signature) return false;
        const dataBytes = this._stringToUint8Array(data);
        return this._verifyBytes(dataBytes, signature, publicKey);
    }
    hash(data, key, iterations) {
        if ('string' == typeof data) return this._hashStr(data, key, iterations);
        return this._hashBytes(data, key, iterations);
    }
    _hashBytes(data, key, iterations = 1) {
        if (!data || 0 === data.length) return new Uint8Array(0);
        const actualKey = key ? 'string' == typeof key ? this._hexToUint8Array(key) : key : void 0;
        let result = new Uint8Array(data);
        for(let i = 0; i < iterations; i++)result = new Uint8Array(this.impl.hash(result, actualKey));
        return result;
    }
    _hashStr(data, key, iterations = 1) {
        if (!data) return '';
        const dataBytes = this._stringToUint8Array(data);
        const result = this._hashBytes(dataBytes, key, iterations);
        return this._uint8ArrayToBase64(result);
    }
}
LYCrypto = crypto_ts_decorate([
    register('LYCrypto'),
    crypto_ts_metadata("design:type", Function),
    crypto_ts_metadata("design:paramtypes", [])
], LYCrypto);
const crypto_crypto = new LYCrypto();
class LYOEMApi {
    constructor(httpClient){
        this._httpClient = httpClient;
    }
    async getTerm(request) {
        const result = await this._httpClient.get("/oem/term", request);
        return result.data;
    }
    async createTerm(request) {
        const result = await this._httpClient.post("/oem/create", request);
        return result.data;
    }
    async batchUpdate(request) {
        const result = await this._httpClient.post("/oem/patch/batch", request);
        return result.data;
    }
    async update(request) {
        const stream = this._httpClient.stream("oem/patch", {
            data: {
                ...request
            }
        });
        for await (const chunk of stream);
        const result = await this._httpClient.post("/oem/patch", request);
        return result.data;
    }
    async delete(request) {
        const result = await this._httpClient.post("/oem/delete", request);
        return result.data;
    }
    async getResource(request) {
        const result = await this._httpClient.get("/oem/resource", request);
        return result.data;
    }
    async createResource(request) {
        const result = await this._httpClient.post("/oem/resource/create", request);
        return result.data;
    }
    async updateResource(request) {
        const result = await this._httpClient.post("/oem/resource/patch", request);
        return result.data;
    }
    async deleteResource(request) {
        const result = await this._httpClient.post("/oem/resource/delete", request);
        return result.data;
    }
}
class LYVerificationCodesApi {
    constructor(httpClient){
        this._httpClient = httpClient;
    }
    async send(request) {
        const response = await this._httpClient.post('/verification-codes', {
            ...request
        });
        return response.data;
    }
    async check(request) {
        const response = await this._httpClient.post(`/verification-codes/${request.verification_code_id}/usage`, {
            ...request
        });
        return response.data;
    }
}
function app_ts_decorate(decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : null === desc ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if ("object" == typeof Reflect && "function" == typeof Reflect.decorate) r = Reflect.decorate(decorators, target, key, desc);
    else for(var i = decorators.length - 1; i >= 0; i--)if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
}
function app_ts_metadata(k, v) {
    if ("object" == typeof Reflect && "function" == typeof Reflect.metadata) return Reflect.metadata(k, v);
}
class LYOrganizationApp extends LYBaseTenantApp {
    constructor(name1, version, description){
        super(name1, version, description);
        LYOrganizationApp._instance = this;
        this._sessionApi = new session_LYSessionApi(this.httpClient);
        this._userApi = new LYUserApi(this.httpClient);
        this._licenseApi = new LYLicenseApi(this.httpClient);
        this._oemApi = new LYOEMApi(this.httpClient);
        this._verificationCodesApi = new LYVerificationCodesApi(this.httpClient);
        this._authorizers = {
            web: new LYWebAuthorizer(this, 'web', this._sessionApi),
            direct: new LYDirectAuthorizer(this, 'direct'),
            redirect: new LYRedirectAuthorizer(this, 'redirect'),
            gateway: new LYGatewayAuthorizer(this, 'gateway')
        };
    }
    static get instance() {
        if (!LYOrganizationApp._instance) throw new Error('LYOrganizationApp not initialized');
        return LYOrganizationApp._instance;
    }
    get sessionApi() {
        return this._sessionApi;
    }
    get userApi() {
        return this._userApi;
    }
    get oemApi() {
        return this._oemApi;
    }
    get licenseApi() {
        return this._licenseApi;
    }
    get crypto() {
        return crypto_crypto;
    }
    get verificationCodesApi() {
        return this._verificationCodesApi;
    }
    async doLoad() {
        await super.doLoad();
    }
    async mergeOEM(originResources) {
        try {
            const terms = await this.oemApi.getTerm();
            const resources = await this.oemApi.getResource();
            console.log("术语", terms);
            console.log("资源", resources);
        } catch (error) {
            this.logger.error('oemResource load fail!');
            this.logger.error(error);
        }
    }
    getAuthorizer(name1) {
        const type = name1 ?? LYSession.get()?.type;
        if (!this._authorizers[type]) throw new Error(`Authorizer ${type} not found`);
        return this._authorizers[type];
    }
}
LYOrganizationApp = app_ts_decorate([
    register('LYOrganizationApp'),
    app_ts_metadata("design:type", Function),
    app_ts_metadata("design:paramtypes", [
        String,
        String,
        String
    ])
], LYOrganizationApp);
class LYTenantApi {
    constructor(httpClient){
        this._httpClient = httpClient;
    }
    async query() {
        const response = await this._httpClient.get('/tenant', {
            offset: 0,
            size: 100,
            sort: [
                'created_at'
            ]
        });
        return response.data.list;
    }
    async get(name1) {
        const response = await this._httpClient.get(`/tenant/${name1}`);
        return response.data;
    }
    async create(tenant) {
        const response = await this._httpClient.post("/tenant", {
            ...tenant,
            admin_password: tenant.admin_password
        });
        return response.data.id;
    }
    async update(name1, tenant) {
        const response = await this._httpClient.post(`/tenant/patch/${name1}`, tenant);
        return response.data.count;
    }
    async delete(name1) {
        const response = await this._httpClient.post(`/tenant/delete/${name1}`);
        return response.data.count;
    }
}
class user_LYUserApi {
    constructor(httpClient){
        this._httpClient = httpClient;
    }
    async query() {
        const response = await this._httpClient.get('/user', {
            offset: 0,
            size: 100,
            sort: [
                'created_at'
            ]
        });
        return response.data;
    }
    async get(name1) {
        const response = await this._httpClient.get(`/user/${name1}`);
        return response.data;
    }
    async create(user) {
        const response = await this._httpClient.post("/user", {
            ...user,
            password: user.password
        });
        return response.data.id;
    }
    async update(name1, user) {
        const response = await this._httpClient.post(`/user/patch/${name1}`, user);
        return response.data.count;
    }
    async delete(name1) {
        const response = await this._httpClient.post(`/user/delete/${name1}`);
        return response.data.count;
    }
}
class LYConfigurationApi {
    constructor(httpClient){
        this._httpClient = httpClient;
    }
    async get_meta() {
        const response = await this._httpClient.get('/configuration/meta');
        return response.data;
    }
    async get() {
        const response = await this._httpClient.get('/configuration');
        return response.data;
    }
    async set(value) {
        const response = await this._httpClient.post("/configuration", value);
        return response.data.count;
    }
}
function tenant_session_ts_decorate(decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : null === desc ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if ("object" == typeof Reflect && "function" == typeof Reflect.decorate) r = Reflect.decorate(decorators, target, key, desc);
    else for(var i = decorators.length - 1; i >= 0; i--)if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
}
function tenant_session_ts_metadata(k, v) {
    if ("object" == typeof Reflect && "function" == typeof Reflect.metadata) return Reflect.metadata(k, v);
}
const session_SESSION_KEY = 'tenant_session';
class LYTenantSession extends LYObject {
    static{
        this._CHECK_INTERVAL = 10000;
    }
    static get() {
        if (!LYTenantSession._session) {
            const session = sharedLocalStorage.getSync(session_SESSION_KEY);
            if (session) {
                const { id, token, user_id, user_name, expires_in, claims, created_at = Date.now() } = session;
                LYTenantSession._session = new LYTenantSession(id, token, user_id, user_name, expires_in, claims, created_at);
                LYTenantSession._startRefreshTimer();
            }
        }
        return LYTenantSession._session;
    }
    static create(id, token, user_id, user_name, expires_in, claims) {
        const created_at = Date.now();
        LYTenantSession._session = new LYTenantSession(id, token, user_id, user_name, expires_in, claims, created_at);
        sharedLocalStorage.setSync(session_SESSION_KEY, {
            id,
            token,
            user_id,
            user_name,
            expires_in,
            claims,
            created_at
        });
        LYTenantSession._startRefreshTimer();
        return LYTenantSession._session;
    }
    static clear() {
        LYTenantSession._session = void 0;
        sharedLocalStorage.removeSync(session_SESSION_KEY);
        LYTenantSession._stopRefreshTimer();
    }
    constructor(id, token, user_id, user_name, expires_in, claims, created_at){
        super();
        this._id = id;
        this._token = token;
        this._user_id = user_id;
        this._user_name = user_name;
        this._expires_in = expires_in;
        this._claims = claims;
        this._created_at = created_at;
    }
    get id() {
        return this._id;
    }
    get token() {
        return this._token;
    }
    get user_id() {
        return this._user_id;
    }
    get user_name() {
        return this._user_name;
    }
    get expires_in() {
        return this._expires_in;
    }
    get claims() {
        return this._claims;
    }
    get created_at() {
        return this._created_at;
    }
    isExpired() {
        const now = Date.now();
        const expirationTime = this._created_at + 1000 * this._expires_in;
        return now >= expirationTime;
    }
    isNearExpiration() {
        const now = Date.now();
        const expirationTime = this._created_at + 1000 * this._expires_in;
        const fifteenSecondsInMs = 15000;
        return expirationTime - now <= fifteenSecondsInMs;
    }
    static setRefreshCallback(callback) {
        LYTenantSession._refreshCallback = callback;
    }
    static async getValid() {
        const session = LYTenantSession.get();
        if (!session) return;
        if (session.isExpired()) if (!LYTenantSession._refreshCallback) return void LYTenantSession.clear();
        else try {
            await LYTenantSession._refreshCallback(session);
            return LYTenantSession.get();
        } catch (error) {
            LYTenantSession.clear();
            return;
        }
        if (session.isNearExpiration()) {
            if (LYTenantSession._refreshCallback) try {
                await LYTenantSession._refreshCallback(session);
            } catch (error) {
                console.warn('Tenant session refresh failed but session is still valid:', error);
            }
        }
        return session;
    }
    static update(id, token, user_id, user_name, expires_in, claims) {
        if (LYTenantSession._session) {
            const created_at = Date.now();
            LYTenantSession._session._id = id;
            LYTenantSession._session._token = token;
            LYTenantSession._session._user_id = user_id;
            LYTenantSession._session._user_name = user_name;
            LYTenantSession._session._expires_in = expires_in;
            LYTenantSession._session._claims = claims;
            LYTenantSession._session._created_at = created_at;
            sharedLocalStorage.setSync(session_SESSION_KEY, {
                id,
                token,
                user_id,
                user_name,
                expires_in,
                claims,
                created_at
            });
        }
    }
    static _startRefreshTimer() {
        LYTenantSession._stopRefreshTimer();
        LYTenantSession._refreshTimer = setInterval(async ()=>{
            try {
                await LYTenantSession._checkAndRefreshSession();
            } catch (error) {
                console.error('Tenant session refresh timer error:', error);
            }
        }, LYTenantSession._CHECK_INTERVAL);
    }
    static _stopRefreshTimer() {
        if (LYTenantSession._refreshTimer) {
            clearInterval(LYTenantSession._refreshTimer);
            LYTenantSession._refreshTimer = void 0;
        }
    }
    static async _checkAndRefreshSession() {
        const session = LYTenantSession._session;
        if (!session) return void LYTenantSession._stopRefreshTimer();
        if (session.isExpired()) if (LYTenantSession._refreshCallback) try {
            await LYTenantSession._refreshCallback(session);
        } catch (error) {
            console.warn('Tenant session expired and refresh failed, clearing session:', error);
            LYTenantSession.clear();
        }
        else {
            console.warn('Tenant session expired and no refresh callback available, clearing session');
            LYTenantSession.clear();
        }
        else if (session.isNearExpiration()) {
            if (LYTenantSession._refreshCallback) try {
                await LYTenantSession._refreshCallback(session);
            } catch (error) {
                console.warn('Tenant session refresh failed but session is still valid:', error);
            }
        }
    }
}
LYTenantSession = tenant_session_ts_decorate([
    register('LYTenantSession'),
    tenant_session_ts_metadata("design:type", Function),
    tenant_session_ts_metadata("design:paramtypes", [
        String,
        String,
        String,
        String,
        Number,
        "undefined" == typeof Record ? Object : Record,
        Number
    ])
], LYTenantSession);
class api_session_LYSessionApi {
    constructor(httpClient){
        this._httpClient = httpClient;
    }
    async get(id) {
        const response = await this._httpClient.get(`/session/${id}`);
        return response.data;
    }
    async create(session) {
        const response = await this._httpClient.post("/session", session);
        return response.data;
    }
    async update(id) {
        const response = await this._httpClient.post(`/session/patch/${id}`);
        return response.data;
    }
    async delete(id) {
        const response = await this._httpClient.post(`/session/delete/${id}`);
        return response.data.count;
    }
}
function authorizer_ts_decorate(decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : null === desc ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if ("object" == typeof Reflect && "function" == typeof Reflect.decorate) r = Reflect.decorate(decorators, target, key, desc);
    else for(var i = decorators.length - 1; i >= 0; i--)if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
}
function authorizer_ts_metadata(k, v) {
    if ("object" == typeof Reflect && "function" == typeof Reflect.metadata) return Reflect.metadata(k, v);
}
class LYTenantAuthorizer extends LYObject {
    constructor(httpClient){
        super();
        this._sessionApi = new api_session_LYSessionApi(httpClient);
        LYTenantSession.setRefreshCallback(this._refreshSession.bind(this));
    }
    async signin(userName, password) {
        const response = await this._sessionApi.create({
            name: userName,
            password: password
        });
        LYTenantSession.create(response.id, response.access_token, response.user_id, response.user_name, response.expires_in, response.claims);
    }
    async signout() {
        const session = LYTenantSession.get();
        if (!session) throw new Error('Session not found');
        LYTenantSession.clear();
        const count = await this._sessionApi.delete(session.id);
        if (0 === count) throw new Error('Session not found');
    }
    async update() {
        const session = LYTenantSession.get();
        if (!session) throw new Error('Session not found');
        await this._refreshSession(session);
    }
    async _refreshSession(session) {
        const response = await this._sessionApi.update(session.id);
        LYTenantSession.update(response.id, response.access_token, response.user_id, response.user_name, response.expires_in, response.claims);
    }
}
LYTenantAuthorizer = authorizer_ts_decorate([
    register('LYTenantAuthorizer'),
    authorizer_ts_metadata("design:type", Function),
    authorizer_ts_metadata("design:paramtypes", [
        "undefined" == typeof LYAppHttpClient ? Object : LYAppHttpClient
    ])
], LYTenantAuthorizer);
function tenant_app_ts_decorate(decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : null === desc ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if ("object" == typeof Reflect && "function" == typeof Reflect.decorate) r = Reflect.decorate(decorators, target, key, desc);
    else for(var i = decorators.length - 1; i >= 0; i--)if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
}
function tenant_app_ts_metadata(k, v) {
    if ("object" == typeof Reflect && "function" == typeof Reflect.metadata) return Reflect.metadata(k, v);
}
class LYTenantApp extends base_LYBaseApp {
    constructor(name1, version, description){
        super(name1, version, description);
        this._tenantApi = new LYTenantApi(this.httpClient);
        this._userApi = new user_LYUserApi(this.httpClient);
        this._configuration = new LYConfigurationApi(this.httpClient);
        this._authorizer = new LYTenantAuthorizer(this.httpClient);
        LYTenantApp._instance = this;
    }
    static get instance() {
        if (!LYTenantApp._instance) throw new Error('LYTenantApp not initialized');
        return LYTenantApp._instance;
    }
    get tenantApi() {
        return this._tenantApi;
    }
    get userApi() {
        return this._userApi;
    }
    get configuration() {
        return this._configuration;
    }
    get authorizer() {
        return this._authorizer;
    }
    async doLoad() {
        await super.doLoad();
    }
}
LYTenantApp = tenant_app_ts_decorate([
    register('LYTenantApp'),
    tenant_app_ts_metadata("design:type", Function),
    tenant_app_ts_metadata("design:paramtypes", [
        String,
        String,
        String
    ])
], LYTenantApp);
base_LYBaseApp.setHeaderProvider({
    get headers () {
        const lang = LYTenantApp.instance.i18n.lang;
        const session = LYTenantSession.get();
        if (!session) return;
        return {
            Authorization: `Bearer ${session.token}`,
            'Accept-Language': lang
        };
    }
});
function src_app_ts_decorate(decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : null === desc ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if ("object" == typeof Reflect && "function" == typeof Reflect.decorate) r = Reflect.decorate(decorators, target, key, desc);
    else for(var i = decorators.length - 1; i >= 0; i--)if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
}
class LYApp extends LYBaseTenantApp {
}
LYApp = src_app_ts_decorate([
    register('LYApp')
], LYApp);
function http_base_ts_decorate(decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : null === desc ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if ("object" == typeof Reflect && "function" == typeof Reflect.decorate) r = Reflect.decorate(decorators, target, key, desc);
    else for(var i = decorators.length - 1; i >= 0; i--)if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
}
function http_base_ts_metadata(k, v) {
    if ("object" == typeof Reflect && "function" == typeof Reflect.metadata) return Reflect.metadata(k, v);
}
class LYHttpClient extends LYObject {
    constructor(baseUrl){
        super();
        this._client = axios.create({
            baseURL: baseUrl
        });
        this._baseUrl = baseUrl || '';
    }
    get baseUrl() {
        return this._baseUrl;
    }
    get key_converter() {
        return this._key_converter;
    }
    set key_converter(converter) {
        this._key_converter = converter;
    }
    _convert_request(data) {
        if (!this._key_converter) return data;
        const result = {};
        for(const key in data)result[this._key_converter.convert_request(key)] = data[key];
        return result;
    }
    _convert_response(data) {
        if (!this._key_converter) return data;
        const result = {};
        for(const key in data)result[this._key_converter.convert_response(key)] = data[key];
        return result;
    }
    _get_headers() {}
    async _request(config) {
        const { method, data, params, ...rest } = config;
        let { data: requestData, params: requestParams } = config;
        if (requestData) requestData = this._convert_request(requestData);
        if (requestParams) requestParams = this._convert_request(requestParams);
        try {
            const response = await this._client.request({
                method,
                url: config.url,
                data: requestData,
                params: requestParams,
                ...rest,
                paramsSerializer: (params)=>qs.stringify(params, {
                        arrayFormat: 'repeat'
                    }),
                headers: {
                    ...this._get_headers(),
                    ...config?.headers
                },
                onUploadProgress: (progressEvent)=>{
                    if (config?.onUploadProgress) config.onUploadProgress(progressEvent.loaded / progressEvent.total);
                },
                onDownloadProgress: (progressEvent)=>{
                    if (config?.onDownloadProgress) config.onDownloadProgress(progressEvent.loaded / progressEvent.total);
                }
            });
            if (!response.headers['content-type'].includes('json')) return response;
            return this._convert_response(response.data);
        } catch (error) {
            if (axios.isAxiosError(error)) {
                const url = error.config?.url || config.url;
                if (401 === error.status) try {
                    const app = base_LYBaseApp.get(ORGANIZATION_APP_NAME);
                    app.getAuthorizer().signout({
                        redirect_uri: window.location.href
                    });
                } catch (error) {
                    console.error(error);
                    window.location.reload();
                }
                if (error.response) throw new LYHttpStatusError(error.response?.data?.detail || error.message, url, method, error, error.response.status);
                if (error.request) throw new LYNetworkError(error.message, url, method, error);
                throw new LYConfigError(error.message, url, method, error);
            }
            throw error;
        }
    }
    async withRetry(fn) {
        let config = LYConfig.get().http.retry;
        config = fn(config.clone());
        Date.now();
        return this;
    }
    async get(url, query, config) {
        return this._request({
            method: 'GET',
            url,
            params: query,
            ...config
        });
    }
    async post(url, data, config) {
        return this._request({
            method: 'POST',
            url,
            data: data,
            ...config
        });
    }
    async put(url, data, config) {
        return this._request({
            method: 'PUT',
            url,
            data: data,
            ...config
        });
    }
    async delete(url, query, config) {
        return this._request({
            method: 'DELETE',
            url,
            params: query,
            ...config
        });
    }
    async patch(url, data, config) {
        return this._request({
            method: 'PATCH',
            url,
            data: data,
            ...config
        });
    }
}
LYHttpClient = http_base_ts_decorate([
    register('LYHttpClient'),
    http_base_ts_metadata("design:type", Function),
    http_base_ts_metadata("design:paramtypes", [
        String
    ])
], LYHttpClient);
function src_http_ts_decorate(decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : null === desc ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if ("object" == typeof Reflect && "function" == typeof Reflect.decorate) r = Reflect.decorate(decorators, target, key, desc);
    else for(var i = decorators.length - 1; i >= 0; i--)if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
}
function src_http_ts_metadata(k, v) {
    if ("object" == typeof Reflect && "function" == typeof Reflect.metadata) return Reflect.metadata(k, v);
}
const ROUTE_PREFIX_WEB_API = 'web';
class http_LYAppHttpClient extends LYHttpClient {
    constructor(app_name, headerProvider){
        super(`/${ROUTE_PREFIX_WEB_API}/${app_name}`);
        this._headerProvider = headerProvider;
    }
    _getUrl(url) {
        return url;
    }
    _get_headers() {
        return this._headerProvider.headers;
    }
    async _request(config) {
        const { method, data, ...rest } = config;
        let url = this._getUrl(config.url);
        if ('GET' !== method && 'POST' !== method) throw new LYError(`Method ${method} not allowed`);
        const response = await super._request({
            method,
            data,
            ...rest,
            url
        });
        if (void 0 !== response.status) return response;
        const result = response;
        if ('not_exists' === result.code) return result;
        if ('success' !== result.code) {
            url = `${this.baseUrl}/${url}`;
            throw new LYAppHttpError(result.message, url, method, new Error(), result.code);
        }
        return result;
    }
    async uploadFile(params, config) {
        const formData = new FormData();
        if (params.id) formData.append('id', params.id);
        if (params.ref_id) formData.append('ref_id', params.ref_id);
        if (params.ref_type) formData.append('ref_type', params.ref_type);
        if (void 0 !== params.expire) formData.append('expire', String(params.expire));
        if (void 0 !== params.ignore_session) formData.append('ignore_session', String(params.ignore_session));
        if (params.extra) formData.append('extra', JSON.stringify(params.extra));
        formData.append('total_size', String(params.total_size || params.chunk?.size));
        if (void 0 !== params.encryption) formData.append('encryption', String(params.encryption));
        if (params.state) formData.append('state', JSON.stringify(params.state));
        if (params.level) formData.append('level', params.level);
        formData.append('chunk', params.chunk);
        const response = await this.post("/file", formData, {
            ...config,
            headers: {
                'Content-Type': 'multipart/form-data',
                ...config?.headers
            }
        });
        return response;
    }
    async uploadFileInChunks(params, config) {
        const file = params.chunk;
        const chunkSize = config?.chunkSize || 20971520;
        const startChunkIndex = config?.startChunkIndex || 0;
        const totalChunks = Math.ceil(file.size / chunkSize);
        let uploadedChunks = 0;
        let currentState = params.state;
        let fileId = params.id;
        for(let chunkIndex = startChunkIndex; chunkIndex < totalChunks; chunkIndex++){
            const start = chunkIndex * chunkSize;
            const end = Math.min(start + chunkSize, file.size);
            const chunk = file.slice(start, end);
            try {
                const uploadParams = {
                    ...params,
                    chunk: new File([
                        chunk
                    ], file.name, {
                        type: file.type
                    }),
                    state: currentState,
                    id: fileId,
                    total_size: file.size
                };
                const response = await this.uploadFile(uploadParams, config);
                fileId = response.data?.id || fileId;
                currentState = response.data?.state || currentState;
                uploadedChunks++;
                const progress = uploadedChunks / (totalChunks - startChunkIndex) * 100;
                config?.onProgress?.(progress);
            } catch (error) {
                this.emit('upload_failed', {
                    error,
                    file,
                    fileId,
                    state: currentState,
                    params,
                    failedChunkIndex: chunkIndex,
                    uploadedChunks
                });
                throw error;
            }
        }
        return {
            id: fileId,
            state: currentState
        };
    }
    async download(fileId, fileName, config) {
        config?.chunkSize;
        const resumeFromByte = config?.resumeFromByte || 0;
        const url = `${this.baseUrl}/${this._getUrl(`/file/${fileId}`)}`;
        const headers = {
            Accept: '*/*',
            ...this._get_headers(),
            ...config?.headers
        };
        const blob = new Blob();
        let reader;
        try {
            const downloadResponse = await fetch(url, {
                method: 'GET',
                headers: {
                    ...headers,
                    ...resumeFromByte > 0 && {
                        Range: `bytes=${resumeFromByte}-`
                    }
                },
                credentials: 'include'
            });
            if (!downloadResponse.ok) throw new Error(`Download request failed: ${downloadResponse.status} ${downloadResponse.statusText}`);
            reader = downloadResponse.body?.getReader();
            if (!reader) throw new Error('Response body is not readable');
            const contentLength = parseInt(downloadResponse.headers.get('content-length') || '0');
            const contentType = downloadResponse.headers.get('content-type') || 'application/octet-stream';
            const contentRange = downloadResponse.headers.get('content-range');
            const contentDisposition = downloadResponse.headers.get('content-disposition');
            let totalSize = contentLength;
            if (contentRange) {
                const match = contentRange.match(/bytes \d+-\d+\/(\d+)/);
                if (match) totalSize = parseInt(match[1]);
            }
            let finalFileName = fileName;
            if (!finalFileName && contentDisposition) {
                const utf8Match = contentDisposition.match(/filename\*=UTF-8''([^;]+)/);
                if (utf8Match) finalFileName = decodeURIComponent(utf8Match[1]);
                else {
                    const filenameMatch = contentDisposition.match(/filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/);
                    if (filenameMatch && filenameMatch[1]) finalFileName = filenameMatch[1].replace(/['"]/g, '');
                }
            }
            const chunks = [];
            let totalLoaded = 0;
            let progress = 0;
            let blob;
            while(true){
                const { done, value } = await reader.read();
                if (done) break;
                chunks.push(value);
                totalLoaded += value.length;
                const newProgress = totalSize > 0 ? totalLoaded / totalSize * 100 : 0;
                if (newProgress !== progress) {
                    progress = newProgress;
                    config?.onProgress?.(progress);
                }
            }
            blob = new Blob(chunks, {
                type: contentType
            });
            return {
                blob,
                fileName: finalFileName,
                contentType,
                totalSize: totalSize || blob.size
            };
        } catch (error) {
            if (reader) reader.cancel();
            this.emit('download_failed', {
                error,
                fileId,
                fileName,
                blob
            });
            throw error;
        }
    }
    async downloadFile(fileId, fileName, config) {
        const result = await this.download(fileId, fileName, config);
        downloadjs(result.blob, result.fileName, result.contentType);
    }
    async *stream(url, config) {
        const { data, delimiter = '\n', headers: customHeaders } = config || {};
        const fullUrl = `${this.baseUrl}/${this._getUrl(url)}`;
        const headers = {
            ...this._get_headers(),
            ...customHeaders,
            Accept: 'text/event-stream',
            'Content-Type': 'application/json'
        };
        const abortController = new AbortController();
        if (config?.signal) config.signal.addEventListener('abort', ()=>{
            abortController.abort();
        });
        const requestOptions = {
            method: 'POST',
            headers,
            signal: abortController.signal,
            body: JSON.stringify(data)
        };
        try {
            const response = await fetch(fullUrl, requestOptions);
            if (!response.ok || !response.body) throw new Error(`SSE connection failed: ${response.status}`);
            const reader = response.body.getReader();
            const decoder = new TextDecoder();
            let buffer = '';
            try {
                while(true){
                    const { value, done } = await reader.read();
                    if (done) break;
                    const chunk = decoder.decode(value, {
                        stream: true
                    });
                    buffer += chunk;
                    const parts = buffer.split(delimiter);
                    buffer = parts.pop() ?? '';
                    for (const part of parts){
                        const trimmed = part.trim();
                        if (0 !== trimmed.length) yield this.parseChunk(trimmed);
                    }
                }
                if (buffer.trim()) yield this.parseChunk(buffer);
            } finally{
                reader.releaseLock();
            }
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : String(error);
            throw new Error(errorMessage);
        }
    }
    parseChunk(text) {
        Uint8Array;
        try {
            return JSON.parse(text);
        } catch  {
            return text;
        }
    }
}
http_LYAppHttpClient = src_http_ts_decorate([
    register('LYAppHttpClient'),
    src_http_ts_metadata("design:type", Function),
    src_http_ts_metadata("design:paramtypes", [
        String,
        "undefined" == typeof IHeaderProvider ? Object : IHeaderProvider
    ])
], http_LYAppHttpClient);
class LYTenantHttpClient extends http_LYAppHttpClient {
    static getTenantName() {
        const url = window.location.pathname;
        const parts = url.split('/');
        const index = parts.findIndex((part)=>'view' === part);
        if (-1 === index || index + 1 >= parts.length) return '';
        return parts[index + 2];
    }
    _getUrl(url) {
        url = super._getUrl(url);
        const tenantName = LYTenantHttpClient.getTenantName() || 'laiye';
        if (tenantName) url = url.startsWith('/') ? `${tenantName}${url}` : `${tenantName}/${url}`;
        return url;
    }
}
LYTenantHttpClient = src_http_ts_decorate([
    register('LYTenantHttpClient')
], LYTenantHttpClient);
var __webpack_exports__FRAMEWORK_NAME = "uci";
export { LANG_KEY, LYApp, http_LYAppHttpClient as LYAppHttpClient, LYAppPermission, base_LYBaseApp as LYBaseApp, LYCloudStorage, LYConfig, LYCrypto, LYCryptoError, LYDefaultLogFormatter, LYDirectAuthorizer, LYEnv, LYError, LYGatewayAuthorizer, LYIndexedDBLogStorage, i18n_LYLangEnum as LYLangEnum, LYLocalStorage, logger_LYLogLevel as LYLogLevel, LYLogger, LYObject, LYObservable, LYOrganizationApp, LYOwnerObservable, LYRedirectAuthorizer, LYSession, LYSessionStorage, LYTenantApp, LYTenantAuthorizer, LYTenantHttpClient, LYTenantSession, LYWebAuthorizer, LYi18n, ORGANIZATION_APP_NAME, REMOTE_ENTRY, REMOTE_MODULE, TENANT_APP_NAME, crypto_crypto as crypto, isElectron, isIframe, i18n_langKeys as langKeys, languages, logger, observable_observe as observe, register, setCloudStorageImpl, setFormatter, setPrintToConsole, setStorage, sharedCloudStorage, sharedLocalStorage, wait, __webpack_exports__FRAMEWORK_NAME as FRAMEWORK_NAME };

//# sourceMappingURL=index.js.map