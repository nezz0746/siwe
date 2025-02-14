import { ethers } from 'ethers';
/**
 * Possible message error types.
 */
export declare enum ErrorTypes {
    /**Thrown when the `validate()` function can verify the message. */
    INVALID_SIGNATURE = "Invalid signature.",
    /**Thrown when the `expirationTime` is present and in the past. */
    EXPIRED_MESSAGE = "Expired message.",
    /**Thrown when some required field is missing. */
    MALFORMED_SESSION = "Malformed session."
}
/**
 * Possible signature types that this library supports.
 */
export declare enum SignatureType {
    /**EIP-191 signature scheme */
    PERSONAL_SIGNATURE = "Personal signature"
}
export declare class SiweMessage {
    /**RFC 4501 dns authority that is requesting the signing. */
    domain: string;
    /**Ethereum address performing the signing conformant to capitalization
     * encoded checksum specified in EIP-55 where applicable. */
    address: string;
    /**Human-readable ASCII assertion that the user will sign, and it must not
     * contain `\n`. */
    statement?: string;
    /**RFC 3986 URI referring to the resource that is the subject of the signing
     *  (as in the __subject__ of a claim). */
    uri: string;
    /**Current version of the message. */
    version: string;
    /**Randomized token used to prevent replay attacks, at least 8 alphanumeric
     * characters. */
    nonce?: string;
    /**ISO 8601 datetime string of the current time. */
    issuedAt?: string;
    /**ISO 8601 datetime string that, if present, indicates when the signed
     * authentication message is no longer valid. */
    expirationTime?: string;
    /**ISO 8601 datetime string that, if present, indicates when the signed
     * authentication message will become valid. */
    notBefore?: string;
    /**System-specific identifier that may be used to uniquely refer to the
     * sign-in request. */
    requestId?: string;
    /**EIP-155 Chain ID to which the session is bound, and the network where
     * Contract Accounts must be resolved. */
    chainId?: string;
    /**List of information or references to information the user wishes to have
     * resolved as part of authentication by the relying party. They are
     * expressed as RFC 3986 URIs separated by `\n- `. */
    resources?: Array<string>;
    /**Signature of the message signed by the wallet. */
    signature?: string;
    /**Type of sign message to be generated. */
    type?: SignatureType;
    /**
     * Creates a parsed Sign-In with Ethereum Message (EIP-4361) object from a
     * string or an object. If a string is used an ABNF parser is called to
     * validate the parameter, otherwise the fields are attributed.
     * @param param {string | SiweMessage} Sign message as a string or an object.
     */
    constructor(param: string | Partial<SiweMessage>);
    /**
     * Given a sign message (EIP-4361) returns the correct matching groups.
     * @param message {string}
     * @returns {RegExpExecArray} The matching groups for the message
     */
    regexFromMessage(message: string): RegExpExecArray;
    /**
     * This function can be used to retrieve an EIP-712 formated message for
     * signature, although you can call it directly it's advised to use
     * [signMessage()] instead which will resolve to the correct method based
     * on the [type] attribute of this object, in case of other formats being
     * implemented.
     * @returns {string} EIP-712 formated message.
     */
    toMessage(): string;
    /**
     * This method parses all the fields in the object and creates a sign
     * message according with the type defined.
     * @returns {string} Returns a message ready to be signed according with the
     * type defined in the object.
     */
    signMessage(): string;
    /**
     * Validates the integrity of the fields of this objects by matching it's
     * signature.
     * @param provider A Web3 provider able to perform a contract check, this is
     * required if support for Smart Contract Wallets that implement EIP-1271 is
     * needed.
     * @returns {Promise<SiweMessage>} This object if valid.
     */
    validate(provider?: ethers.providers.Provider | any): Promise<SiweMessage>;
}
/**
 * This method calls the EIP-1271 method for Smart Contract wallets
 * @param message The EIP-4361 parsed message
 * @param provider Web3 provider able to perform a contract check (Web3/EthersJS).
 * @returns {Promise<boolean>} Checks for the smart contract (if it exists) if
 * the signature is valid for given address.
 */
export declare const checkContractWalletSignature: (message: SiweMessage, provider?: any) => Promise<boolean>;
