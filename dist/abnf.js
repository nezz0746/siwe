"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ParsedMessage = void 0;
const apg_js_1 = require("apg-js");
const GRAMMAR = `
sign-in-with-ethereum =
    domain %s" wants you to sign in with your Ethereum account:" LF
    address LF
    LF
    [ statement LF ]
    LF
    %s"URI: " URI LF
    %s"Version: " version LF
    %s"Nonce: " nonce LF
    %s"Issued At: " issued-at
    [ LF %s"Expiration Time: " expiration-time ]
    [ LF %s"Not Before: " not-before ]
    [ LF %s"Request ID: " request-id ]
    [ LF %s"Chain ID: " chain-id ]
    [ LF %s"Resources:"
    resources ]

domain = dnsauthority

address = "0x" 40*40HEXDIG
    ; Must also conform to captilization
    ; checksum encoding specified in EIP-55
    ; where applicable (EOAs).

statement = *( reserved / unreserved / " " )
    ; The purpose is to exclude LF (line breaks).

version = "1"

nonce = 8*( ALPHA / DIGIT )

issued-at = date-time
expiration-time = date-time
not-before = date-time

request-id = *pchar

chain-id = 1*DIGIT
    ; See EIP-155 for valid CHAIN_IDs.

resources = *( LF resource )

resource = "- " URI

; ------------------------------------------------------------------------------
; RFC 3986

URI           = scheme ":" hier-part [ "?" query ] [ "#" fragment ]

hier-part     = "//" authority path-abempty
              / path-absolute
              / path-rootless
              / path-empty

scheme        = ALPHA *( ALPHA / DIGIT / "+" / "-" / "." )

authority     = [ userinfo "@" ] host [ ":" port ]
userinfo      = *( unreserved / pct-encoded / sub-delims / ":" )
host          = IP-literal / IPv4address / reg-name
port          = *DIGIT

IP-literal    = "[" ( IPv6address / IPvFuture  ) "]"

IPvFuture     = "v" 1*HEXDIG "." 1*( unreserved / sub-delims / ":" )

IPv6address   =                            6( h16 ":" ) ls32
              /                       "::" 5( h16 ":" ) ls32
              / [               h16 ] "::" 4( h16 ":" ) ls32
              / [ *1( h16 ":" ) h16 ] "::" 3( h16 ":" ) ls32
              / [ *2( h16 ":" ) h16 ] "::" 2( h16 ":" ) ls32
              / [ *3( h16 ":" ) h16 ] "::"    h16 ":"   ls32
              / [ *4( h16 ":" ) h16 ] "::"              ls32
              / [ *5( h16 ":" ) h16 ] "::"              h16
              / [ *6( h16 ":" ) h16 ] "::"

h16           = 1*4HEXDIG
ls32          = ( h16 ":" h16 ) / IPv4address
IPv4address   = dec-octet "." dec-octet "." dec-octet "." dec-octet
dec-octet     = DIGIT                 ; 0-9
                 / %x31-39 DIGIT         ; 10-99
                 / "1" 2DIGIT            ; 100-199
                 / "2" %x30-34 DIGIT     ; 200-249
                 / "25" %x30-35          ; 250-255

reg-name      = *( unreserved / pct-encoded / sub-delims )

path-abempty  = *( "/" segment )
path-absolute = "/" [ segment-nz *( "/" segment ) ]
path-rootless = segment-nz *( "/" segment )
path-empty    = 0pchar

segment       = *pchar
segment-nz    = 1*pchar

pchar         = unreserved / pct-encoded / sub-delims / ":" / "@"

query         = *( pchar / "/" / "?" )

fragment      = *( pchar / "/" / "?" )

pct-encoded   = "%" HEXDIG HEXDIG

unreserved    = ALPHA / DIGIT / "-" / "." / "_" / "~"
reserved      = gen-delims / sub-delims
gen-delims    = ":" / "/" / "?" / "#" / "[" / "]" / "@"
sub-delims    = "!" / "$" / "&" / "'" / "(" / ")"
              / "*" / "+" / "," / ";" / "="

; ------------------------------------------------------------------------------
; RFC 4501

dnsauthority    = host [ ":" port ]
                             ; See RFC 3986 for the
                             ; definition of "host" and "port".

; ------------------------------------------------------------------------------
; RFC 3339

date-fullyear   = 4DIGIT
date-month      = 2DIGIT  ; 01-12
date-mday       = 2DIGIT  ; 01-28, 01-29, 01-30, 01-31 based on
                          ; month/year
time-hour       = 2DIGIT  ; 00-23
time-minute     = 2DIGIT  ; 00-59
time-second     = 2DIGIT  ; 00-58, 00-59, 00-60 based on leap second
                          ; rules
time-secfrac    = "." 1*DIGIT
time-numoffset  = ("+" / "-") time-hour ":" time-minute
time-offset     = "Z" / time-numoffset

partial-time    = time-hour ":" time-minute ":" time-second
                  [time-secfrac]
full-date       = date-fullyear "-" date-month "-" date-mday
full-time       = partial-time time-offset

date-time       = full-date "T" full-time

; ------------------------------------------------------------------------------
; RFC 5234

ALPHA          =  %x41-5A / %x61-7A   ; A-Z / a-z
LF             =  %x0A
                  ; linefeed
DIGIT          =  %x30-39
                  ; 0-9
HEXDIG         =  DIGIT / "A" / "B" / "C" / "D" / "E" / "F"
`;
class ParsedMessage {
    constructor(msg) {
        const api = new apg_js_1.apgApi(GRAMMAR);
        api.generate();
        if (api.errors.length) {
            console.error(api.errorsToAscii());
            console.error(api.linesToAscii());
            console.log(api.displayAttributeErrors());
            throw new Error(`ABNF grammar has errors`);
        }
        const grammarObj = api.toObject();
        const parser = new apg_js_1.apgLib.parser();
        parser.ast = new apg_js_1.apgLib.ast();
        const id = apg_js_1.apgLib.ids;
        const domain = function (state, chars, phraseIndex, phraseLength, data) {
            const ret = id.SEM_OK;
            if (state === id.SEM_PRE) {
                data.domain = apg_js_1.apgLib.utils.charsToString(chars, phraseIndex, phraseLength);
            }
            return ret;
        };
        parser.ast.callbacks.domain = domain;
        const address = function (state, chars, phraseIndex, phraseLength, data) {
            const ret = id.SEM_OK;
            if (state === id.SEM_PRE) {
                data.address = apg_js_1.apgLib.utils.charsToString(chars, phraseIndex, phraseLength);
            }
            return ret;
        };
        parser.ast.callbacks.address = address;
        const statement = function (state, chars, phraseIndex, phraseLength, data) {
            const ret = id.SEM_OK;
            if (state === id.SEM_PRE) {
                data.statement = apg_js_1.apgLib.utils.charsToString(chars, phraseIndex, phraseLength);
            }
            return ret;
        };
        parser.ast.callbacks.statement = statement;
        const uri = function (state, chars, phraseIndex, phraseLength, data) {
            const ret = id.SEM_OK;
            if (state === id.SEM_PRE) {
                if (!data.uri) {
                    data.uri = apg_js_1.apgLib.utils.charsToString(chars, phraseIndex, phraseLength);
                }
            }
            return ret;
        };
        parser.ast.callbacks.uri = uri;
        const version = function (state, chars, phraseIndex, phraseLength, data) {
            const ret = id.SEM_OK;
            if (state === id.SEM_PRE) {
                data.version = apg_js_1.apgLib.utils.charsToString(chars, phraseIndex, phraseLength);
            }
            return ret;
        };
        parser.ast.callbacks.version = version;
        const chainId = function (state, chars, phraseIndex, phraseLength, data) {
            const ret = id.SEM_OK;
            if (state === id.SEM_PRE) {
                data.chainId = apg_js_1.apgLib.utils.charsToString(chars, phraseIndex, phraseLength);
            }
            return ret;
        };
        parser.ast.callbacks['chain-id'] = chainId;
        const nonce = function (state, chars, phraseIndex, phraseLength, data) {
            const ret = id.SEM_OK;
            if (state === id.SEM_PRE) {
                data.nonce = apg_js_1.apgLib.utils.charsToString(chars, phraseIndex, phraseLength);
            }
            return ret;
        };
        parser.ast.callbacks.nonce = nonce;
        const issuedAt = function (state, chars, phraseIndex, phraseLength, data) {
            const ret = id.SEM_OK;
            if (state === id.SEM_PRE) {
                data.issuedAt = apg_js_1.apgLib.utils.charsToString(chars, phraseIndex, phraseLength);
            }
            return ret;
        };
        parser.ast.callbacks['issued-at'] = issuedAt;
        const expirationTime = function (state, chars, phraseIndex, phraseLength, data) {
            const ret = id.SEM_OK;
            if (state === id.SEM_PRE) {
                data.expirationTime = apg_js_1.apgLib.utils.charsToString(chars, phraseIndex, phraseLength);
            }
            return ret;
        };
        parser.ast.callbacks['expiration-time'] = expirationTime;
        const notBefore = function (state, chars, phraseIndex, phraseLength, data) {
            const ret = id.SEM_OK;
            if (state === id.SEM_PRE) {
                data.notBefore = apg_js_1.apgLib.utils.charsToString(chars, phraseIndex, phraseLength);
            }
            return ret;
        };
        parser.ast.callbacks['not-before'] = notBefore;
        const requestId = function (state, chars, phraseIndex, phraseLength, data) {
            const ret = id.SEM_OK;
            if (state === id.SEM_PRE) {
                data.requestId = apg_js_1.apgLib.utils.charsToString(chars, phraseIndex, phraseLength);
            }
            return ret;
        };
        parser.ast.callbacks['request-id'] = requestId;
        const resources = function (state, chars, phraseIndex, phraseLength, data) {
            const ret = id.SEM_OK;
            if (state === id.SEM_PRE) {
                data.resources = apg_js_1.apgLib.utils
                    .charsToString(chars, phraseIndex, phraseLength)
                    .slice(3)
                    .split('\n- ');
            }
            return ret;
        };
        parser.ast.callbacks.resources = resources;
        const result = parser.parse(grammarObj, 'sign-in-with-ethereum', msg);
        if (!result.success) {
            throw new Error(`Invalid message: ${JSON.stringify(result)}`);
        }
        const elements = {};
        parser.ast.translate(elements);
        for (const [key, value] of Object.entries(elements)) {
            this[key] = value;
        }
    }
}
exports.ParsedMessage = ParsedMessage;
