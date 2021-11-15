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
var parsingPositive = require('../test/parsing_positive.json');
var validationPositive = require('../test/validation_positive.json');
var validationNegative = require('../test/validation_negative.json');
const client_1 = require("./client");
describe(`Message Generation`, () => {
    test.concurrent.each(Object.entries(parsingPositive))('Generates message successfully: %s', (_, test) => {
        const msg = new client_1.SiweMessage(test.fields);
        expect(msg.toMessage()).toBe(test.message);
    });
});
describe(`Message Validation`, () => {
    test.concurrent.each(Object.entries(validationPositive))('Validates message successfully: %s', (_, test_fields) => __awaiter(void 0, void 0, void 0, function* () {
        const msg = new client_1.SiweMessage(test_fields);
        yield expect(msg.validate()).resolves.not.toThrow();
    }));
    test.concurrent.each(Object.entries(validationNegative))('Fails to validate message: %s', (_, test_fields) => __awaiter(void 0, void 0, void 0, function* () {
        const msg = new client_1.SiweMessage(test_fields);
        yield expect(msg.validate()).rejects.toThrow();
    }));
});
