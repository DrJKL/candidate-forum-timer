/**
 * Basically just a counter that counts down for a set of keys.
 */
export class TokenManager<T extends Record<keyof T, number>> {
    private readonly usedTokens: Map<keyof T, number> = new Map();

    constructor(private readonly initialTokens: T) { }

    /**
     * 
     * @param type Token type
     * @returns the number of unused tokens of this type
     */
    remainingTokens(type: keyof T) {
        return this.initialTokens[type] - (this.usedTokens.get(type) ?? 0);
    }

    /**
     * 
     * @param type Token type
     * @returns true if the use was successful, false if it failed.
     */
    use(type: keyof T) {
        if (this.remainingTokens(type) <= 0) {
            return false;
        }
        this.usedTokens.set(type, (this.usedTokens.get(type) ?? 0) + 1);
        return true;
    }

    restore(type: keyof T) {
        const remaining = this.remainingTokens(type);
        if (remaining >= this.initialTokens[type]) {
            console.log(`Not restoring ${String(type)} token, already have ${remaining} with initial max of ${this.initialTokens[type]}`);
            return false;
        }
        this.usedTokens.set(type, (this.usedTokens.get(type) ?? 0) - 1);
        return true;
    }



}