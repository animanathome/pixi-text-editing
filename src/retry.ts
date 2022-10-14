export const retry = async function(attempts, fn, ...params) {
    let error;
    for (let i = 0; i < attempts; i++) {
        const backoff = Math.pow(2, i) - 1;
        await new Promise(resolve => setTimeout(resolve, backoff * 1000));
        try {
            return await fn(...params);
        }
        catch (err) {
            error = err;
        }
    }
    console.warn(`Retry failed after ${attempts} attempts`);
    throw error;
};

export const createValidator = (validator) => (func) => async(...params) => {
    const result = await func(...params);
    validator(result);
    return result;
};