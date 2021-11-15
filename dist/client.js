"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.checkContractWalletSignature = exports.SiweMessage = exports.SignatureType = exports.ErrorTypes = void 0;
// TODO: Figure out how to get types from this lib:
const ethers_1 = require("ethers");
const abnf_1 = require("./abnf");
const regex_1 = require("./regex");
/**
 * Possible message error types.
 */
var ErrorTypes;
(function (ErrorTypes) {
    /**Thrown when the `validate()` function can verify the message. */
    ErrorTypes["INVALID_SIGNATURE"] = "Invalid signature.";
    /**Thrown when the `expirationTime` is present and in the past. */
    ErrorTypes["EXPIRED_MESSAGE"] = "Expired message.";
    /**Thrown when some required field is missing. */
    ErrorTypes["MALFORMED_SESSION"] = "Malformed session.";
})(ErrorTypes = exports.ErrorTypes || (exports.ErrorTypes = {}));
/**
 * Possible signature types that this library supports.
 */
var SignatureType;
(function (SignatureType) {
    /**EIP-191 signature scheme */
    SignatureType["PERSONAL_SIGNATURE"] = "Personal signature";
})(SignatureType = exports.SignatureType || (exports.SignatureType = {}));
class SiweMessage {
    /**
     * Creates a parsed Sign-In with Ethereum Message (EIP-4361) object from a
     * string or an object. If a string is used an ABNF parser is called to
     * validate the parameter, otherwise the fields are attributed.
     * @param param {string | SiweMessage} Sign message as a string or an object.
     */
    constructor(param) {
        if (typeof param === 'string') {
            const parsedMessage = new abnf_1.ParsedMessage(param);
            this.domain = parsedMessage.domain;
            this.address = parsedMessage.address;
            this.statement = parsedMessage.statement;
            this.uri = parsedMessage.uri;
            this.version = parsedMessage.version;
            this.nonce = parsedMessage.nonce;
            this.issuedAt = parsedMessage.issuedAt;
            this.expirationTime = parsedMessage.expirationTime;
            this.notBefore = parsedMessage.notBefore;
            this.requestId = parsedMessage.requestId;
            this.chainId = parsedMessage.chainId;
            this.resources = parsedMessage.resources;
        }
        else {
            Object.assign(this, param);
        }
    }
    /**
     * Given a sign message (EIP-4361) returns the correct matching groups.
     * @param message {string}
     * @returns {RegExpExecArray} The matching groups for the message
     */
    regexFromMessage(message) {
        const parsedMessage = new regex_1.ParsedMessage(message);
        return parsedMessage.match;
    }
    /**
     * This function can be used to retrieve an EIP-712 formated message for
     * signature, although you can call it directly it's advised to use
     * [signMessage()] instead which will resolve to the correct method based
     * on the [type] attribute of this object, in case of other formats being
     * implemented.
     * @returns {string} EIP-712 formated message.
     */
    toMessage() {
        const header = `${this.domain} wants you to sign in with your Ethereum account:`;
        const uriField = `URI: ${this.uri}`;
        let prefix = [header, this.address].join('\n');
        const versionField = `Version: ${this.version}`;
        if (!this.nonce) {
            this.nonce = (Math.random() + 1).toString(36).substring(4);
        }
        const nonceField = `Nonce: ${this.nonce}`;
        const suffixArray = [uriField, versionField, nonceField];
        if (this.issuedAt) {
            Date.parse(this.issuedAt);
        }
        this.issuedAt = this.issuedAt
            ? this.issuedAt
            : new Date().toISOString();
        suffixArray.push(`Issued At: ${this.issuedAt}`);
        if (this.expirationTime) {
            const expiryField = `Expiration Time: ${this.expirationTime}`;
            suffixArray.push(expiryField);
        }
        if (this.notBefore) {
            suffixArray.push(`Not Before: ${this.notBefore}`);
        }
        if (this.requestId) {
            suffixArray.push(`Request ID: ${this.requestId}`);
        }
        if (this.chainId) {
            suffixArray.push(`Chain ID: ${this.chainId}`);
        }
        if (this.resources) {
            suffixArray.push([`Resources:`, ...this.resources.map((x) => `- ${x}`)].join('\n'));
        }
        let suffix = suffixArray.join('\n');
        if (this.statement) {
            prefix = [prefix, this.statement].join('\n\n');
        }
        return [prefix, suffix].join('\n\n');
    }
    /**
     * This method parses all the fields in the object and creates a sign
     * message according with the type defined.
     * @returns {string} Returns a message ready to be signed according with the
     * type defined in the object.
     */
    signMessage() {
        let message;
        switch (this.type) {
            case SignatureType.PERSONAL_SIGNATURE: {
                message = this.toMessage();
                break;
            }
            default: {
                message = this.toMessage();
                break;
            }
        }
        return message;
    }
    /**
     * Validates the integrity of the fields of this objects by matching it's
     * signature.
     * @param provider A Web3 provider able to perform a contract check, this is
     * required if support for Smart Contract Wallets that implement EIP-1271 is
     * needed.
     * @returns {Promise<SiweMessage>} This object if valid.
     */
    validate(provider) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
                const message = this.signMessage();
                try {
                    let missing = [];
                    if (!message) {
                        missing.push('`message`');
                    }
                    if (!this.signature) {
                        missing.push('`signature`');
                    }
                    if (!this.address) {
                        missing.push('`address`');
                    }
                    if (missing.length > 0) {
                        throw new Error(`${ErrorTypes.MALFORMED_SESSION} missing: ${missing.join(', ')}.`);
                    }
                    const addr = ethers_1.ethers.utils.verifyMessage(message, this.signature);
                    if (addr.toLowerCase() !== this.address.toLowerCase()) {
                        try {
                            //EIP-1271
                            const isValidSignature = yield (0, exports.checkContractWalletSignature)(this, provider);
                            if (!isValidSignature) {
                                throw new Error(`${ErrorTypes.INVALID_SIGNATURE}: ${addr} !== ${this.address}`);
                            }
                        }
                        catch (e) {
                            throw e;
                        }
                    }
                    const parsedMessage = new SiweMessage(message);
                    if (parsedMessage.expirationTime &&
                        new Date().getTime() >=
                            new Date(parsedMessage.expirationTime).getTime()) {
                        throw new Error(ErrorTypes.EXPIRED_MESSAGE);
                    }
                    resolve(parsedMessage);
                }
                catch (e) {
                    reject(e);
                }
            }));
        });
    }
}
exports.SiweMessage = SiweMessage;
/**
 * This method calls the EIP-1271 method for Smart Contract wallets
 * @param message The EIP-4361 parsed message
 * @param provider Web3 provider able to perform a contract check (Web3/EthersJS).
 * @returns {Promise<boolean>} Checks for the smart contract (if it exists) if
 * the signature is valid for given address.
 */
const checkContractWalletSignature = (message, provider) => __awaiter(void 0, void 0, void 0, function* () {
    if (!provider) {
        return false;
    }
    const abi = [
        'function isValidSignature(bytes32 _message, bytes _signature) public view returns (bool)',
    ];
    try {
        const walletContract = new ethers_1.Contract(message.address, abi, provider);
        const hashMessage = ethers_1.utils.hashMessage(message.signMessage());
        return yield walletContract.isValidSignature(hashMessage, message.signature);
    }
    catch (e) {
        throw e;
    }
});
exports.checkContractWalletSignature = checkContractWalletSignature;
