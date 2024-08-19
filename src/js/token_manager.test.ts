import { describe, it, expect } from "vitest";
import { TokenManager } from "./token_manager";

describe('Token Manager', () => {

    it('should start with some Tokens', () => {
        const tokenManager = new TokenManager({ 'rebuttal': 2 });
        expect(tokenManager.remainingTokens('rebuttal')).toBe(2);
    });

    it('should let you use Tokens', () => {
        const tokenManager = new TokenManager({ 'rebuttal': 2 });
        expect(tokenManager.remainingTokens('rebuttal')).toBe(2);
        const actual = tokenManager.use('rebuttal');
        expect(actual).toBe(true);
        expect(tokenManager.remainingTokens('rebuttal')).toBe(1);
    });

    it('should not let you use Tokens if there are none left', () => {
        const tokenManager = new TokenManager({ 'rebuttal': 2 });
        expect(tokenManager.remainingTokens('rebuttal')).toBe(2);
        const firstToken = tokenManager.use('rebuttal');
        const secondToken = tokenManager.use('rebuttal');
        const thirdToken = tokenManager.use('rebuttal');
        expect(firstToken).toBe(true);
        expect(secondToken).toBe(true);
        expect(thirdToken).toBe(false);
    });

    it('should allow for multiple token types', () => {
        const tokenManager = new TokenManager({ 'rebuttal': 2, 'interjection': 3 });
        expect(tokenManager.remainingTokens('rebuttal')).toBe(2);
        expect(tokenManager.remainingTokens('interjection')).toBe(3);
    });

    it('should allow restoring tokens', () => {
        const tokenManager = new TokenManager({ 'rebuttal': 2 });
        expect(tokenManager.remainingTokens('rebuttal')).toBe(2);
        tokenManager.use('rebuttal');
        expect(tokenManager.remainingTokens('rebuttal')).toBe(1);
        tokenManager.restore('rebuttal');
        expect(tokenManager.remainingTokens('rebuttal')).toBe(2);

    });



});