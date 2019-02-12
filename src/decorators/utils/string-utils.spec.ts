import { capitalize, camelCase, kebabCase } from './string-utils';

describe('String Utils', () => {

    it('capitalize', () => {

        expect(capitalize('')).toBe('', 'empty strings should not be modified');

        expect(capitalize('test')).toBe('Test', 'strings should be capitalized');
    });

    it('camelCase', () => {

        expect(camelCase('')).toBe('', 'empty strings should not be modified');

        expect(camelCase('test string')).toBe('testString', 'strings should be camel-cased');
        expect(camelCase(' test  string ')).toBe('testString', 'strings should be camel-cased');
        expect(camelCase('Test string Two')).toBe('testStringTwo', 'strings should be camel-cased');

        expect(camelCase('test-string')).toBe('testString', 'strings should be camel-cased');
        expect(camelCase('test-stringTwo')).toBe('testStringTwo', 'strings should be camel-cased');
        expect(camelCase('Test-stringTwo')).toBe('testStringTwo', 'strings should be camel-cased');

        expect(camelCase('a b c')).toBe('aBC', 'strings should be camel-cased');
        expect(camelCase('a-b-c')).toBe('aBC', 'strings should be camel-cased');

        expect(camelCase('testString')).toBe('testString', 'strings should be camel-cased');
        expect(camelCase('testStringTwo')).toBe('testStringTwo', 'strings should be camel-cased');
    });

    it('kebabCase', () => {

        expect(kebabCase('')).toBe('', 'empty strings should not be modified');

        expect(kebabCase('test string')).toBe('test-string', 'strings should be kebab-cased');
        expect(kebabCase(' test  string ')).toBe('test-string', 'strings should be kebab-cased');
        expect(kebabCase('Test string Two')).toBe('test-string-two', 'strings should be kebab-cased');

        expect(kebabCase('testString')).toBe('test-string', 'strings should be kebab-cased');
        expect(kebabCase('testStringTwo')).toBe('test-string-two', 'strings should be kebab-cased');
        expect(kebabCase('TestStringTwo')).toBe('test-string-two', 'strings should be kebab-cased');

        expect(kebabCase('a b c')).toBe('a-b-c', 'strings should be kebab-cased');
        expect(kebabCase('aBeC')).toBe('a-be-c', 'strings should be kebab-cased');
        expect(kebabCase('aBC')).toBe('a-bc', 'strings should be kebab-cased');

        expect(kebabCase('Test-String-Two')).toBe('test-string-two', 'strings should be kebab-cased');
        expect(kebabCase('test-string-two')).toBe('test-string-two', 'strings should be kebab-cased');
    });
});
