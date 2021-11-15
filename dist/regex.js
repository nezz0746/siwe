"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ParsedMessage = void 0;
const DOMAIN = '(([a-zA-Z]([a-zA-Z\\d-]*[a-zA-Z\\d])*)\\.)+[a-zA-Z]{2,}';
const ADDRESS = '0x[a-zA-Z0-9]{40}';
const URI = '(([^:/?#]+):)?(//([^/?#]*))?([^?#]*)(\\?([^#]*))?(#(.*))?';
const DATETIME = '([0-9]+)-(0[1-9]|1[012])-(0[1-9]|[12][0-9]|3[01])[Tt]([01][0-9]|2[0-3]):([0-5][0-9]):([0-5][0-9]|60)(\\.[0-9]+)?(([Zz])|([\\+|\\-]([01][0-9]|2[0-3]):[0-5][0-9]))';
const REQUESTID = "[-._~!$&'()*+,;=:@%a-zA-Z0-9]*";
class ParsedMessage {
    constructor(msg) {
        var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o;
        const REGEX = new RegExp(`^(?<domain>${DOMAIN})\\ wants\\ you\\ to\\ sign\\ in\\ with\\ your\\ Ethereum\\ account\\:\\n(?<address>${ADDRESS})\\n\\n((?<statement>[^\\n]+)\\n)?\\nURI\\:\\ (?<uri>${URI})\\nVersion\\:\\ (?<version>1)\\nNonce\\:\\ (?<nonce>[a-zA-Z0-9]{8})\\nIssued\\ At\\:\\ (?<issuedAt>${DATETIME})(\\nExpiration\\ Time\\:\\ (?<expirationTime>${DATETIME}))?(\\nNot\\ Before\\:\\ (?<notBefore>${DATETIME}))?(\\nRequest\\ ID\\:\\ (?<requestId>${REQUESTID}))?(\\nChain\\ ID\\:\\ (?<chainId>[0-9]+))?(\\nResources\\:(?<resources>(\\n-\\ ${URI})+))?$`, 'g');
        let match = REGEX.exec(msg);
        if (!match) {
            throw new Error('Message did not match the regular expression.');
        }
        this.match = match;
        this.domain = (_a = match === null || match === void 0 ? void 0 : match.groups) === null || _a === void 0 ? void 0 : _a.domain;
        this.address = (_b = match === null || match === void 0 ? void 0 : match.groups) === null || _b === void 0 ? void 0 : _b.address;
        this.statement = (_c = match === null || match === void 0 ? void 0 : match.groups) === null || _c === void 0 ? void 0 : _c.statement;
        this.uri = (_d = match === null || match === void 0 ? void 0 : match.groups) === null || _d === void 0 ? void 0 : _d.uri;
        this.version = (_e = match === null || match === void 0 ? void 0 : match.groups) === null || _e === void 0 ? void 0 : _e.version;
        this.nonce = (_f = match === null || match === void 0 ? void 0 : match.groups) === null || _f === void 0 ? void 0 : _f.nonce;
        this.chainId = (_g = match === null || match === void 0 ? void 0 : match.groups) === null || _g === void 0 ? void 0 : _g.chainId;
        this.issuedAt = (_h = match === null || match === void 0 ? void 0 : match.groups) === null || _h === void 0 ? void 0 : _h.issuedAt;
        this.expirationTime = (_j = match === null || match === void 0 ? void 0 : match.groups) === null || _j === void 0 ? void 0 : _j.expirationTime;
        this.notBefore = (_k = match === null || match === void 0 ? void 0 : match.groups) === null || _k === void 0 ? void 0 : _k.notBefore;
        this.requestId = (_l = match === null || match === void 0 ? void 0 : match.groups) === null || _l === void 0 ? void 0 : _l.requestId;
        this.resources = (_o = (_m = match === null || match === void 0 ? void 0 : match.groups) === null || _m === void 0 ? void 0 : _m.resources) === null || _o === void 0 ? void 0 : _o.split('\n- ').slice(1);
    }
}
exports.ParsedMessage = ParsedMessage;
