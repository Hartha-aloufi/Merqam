// config.js
const dotenv = require('dotenv');
const path = require('path');

// Load environment variables
function loadEnv() {
    // Load from .env file
    const result = dotenv.config({
        path: path.resolve(process.cwd(), '.env')
    });

    if (result.error) {
        // If .env doesn't exist, try .env.local
        const localResult = dotenv.config({
            path: path.resolve(process.cwd(), '.env.local')
        });

        // Only throw if neither file exists
        if (localResult.error) {
            throw new Error('No .env or .env.local file found');
        }
    }

    console.log('Environment loaded:', process.env.OPENAI_API_KEY ? 'API Key found' : 'No API Key');
}

// Create configuration with validation
function createConfig() {
    const config = {
        openai: {
            apiKey: process.env.OPENAI_API_KEY,
            model: process.env.OPENAI_MODEL || 'gpt-4',
            temperature: parseFloat(process.env.OPENAI_TEMPERATURE || '0.84'),
            maxTokens: parseInt(process.env.OPENAI_MAX_TOKENS || '16383', 10)
        }
    };

    // Validate required configuration
    if (!config.openai.apiKey) {
        throw new Error('OPENAI_API_KEY is required in environment variables');
    }

    return config;
}

// Initialize configuration
function initConfig() {
    loadEnv();
    return createConfig();
}

module.exports = {
    initConfig
};