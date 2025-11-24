// JSONBin API integration
const JSONBIN_CONFIG = {
    API_URL: 'https://api.jsonbin.io/v3',
    MASTER_KEY: '$2a$10$Zvs9GnQFn58NfRB2viPmW.BTGobRxxEI6xuQYDFPxSe21lfZN9Gg.',
    ACCESS_KEY: '$2a$10$fdiXcvBkYbfWZmA3Vk2.U.xXkdRug.uybYzVzULLhtNNkXnUf6xqS'
};

class JSONBinAPI {
    static async createBin(data, name) {
        try {
            const response = await fetch(`${JSONBIN_CONFIG.API_URL}/b`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-Master-Key': JSONBIN_CONFIG.MASTER_KEY,
                    'X-Access-Key': JSONBIN_CONFIG.ACCESS_KEY,
                    'X-Bin-Name': name
                },
                body: JSON.stringify(data)
            });
            const result = await response.json();
            if (!result.metadata) {
                console.error('JSONBin API Error:', result);
                return null;
            }
            return result.metadata.id;
        } catch (error) {
            console.error('Error creating bin:', error);
            return null;
        }
    }

    static async updateBin(binId, data) {
        try {
            const response = await fetch(`${JSONBIN_CONFIG.API_URL}/b/${binId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'X-Master-Key': JSONBIN_CONFIG.MASTER_KEY,
                    'X-Access-Key': JSONBIN_CONFIG.ACCESS_KEY
                },
                body: JSON.stringify(data)
            });
            return response.ok;
        } catch (error) {
            console.error('Error updating bin:', error);
            return false;
        }
    }

    static async getBin(binId) {
        try {
            const response = await fetch(`${JSONBIN_CONFIG.API_URL}/b/${binId}`, {
                headers: {
                    'X-Master-Key': JSONBIN_CONFIG.MASTER_KEY,
                    'X-Access-Key': JSONBIN_CONFIG.ACCESS_KEY
                }
            });
            const data = await response.json();
            return data.record;
        } catch (error) {
            console.error('Error fetching bin:', error);
            return null;
        }
    }
}