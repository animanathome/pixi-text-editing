/**
 * Check if a 200 response was returned
 */
export function assertResponseOk(response: Response) {
    const status = response.status;
    if (status < 200 || status >= 300) {
        throw new Error(`Response ${response.url} returned a status of ${response.status}`);
    }
}