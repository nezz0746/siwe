export declare class ParsedMessage {
    domain: string;
    address: string;
    statement: string;
    uri: string;
    version: string;
    nonce: string;
    issuedAt: string;
    expirationTime: string | null;
    notBefore: string | null;
    requestId: string | null;
    chainId: string | null;
    resources: string[] | null;
    match?: RegExpExecArray;
    constructor(msg: string);
}
