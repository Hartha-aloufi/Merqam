import { env } from './env';
import { workerLogger as logger } from './logging/file-logger';

// Import types from the @types workspace
import type { components } from '@merqam/types';

// Re-export common types for convenience
export type BahethApiComponents = components;
export type BahethMedium = components['schemas']['medium_with_required_fields'] & {
    cues?: components['schemas']['cue'][];
    playlist: components['schemas']['playlist'];
    speakers: components['schemas']['speaker'][];
};

/**
 * Baheth API client - exact implementation from web service
 * Based on packages/web/src/server/services/baheth.service.ts
 */
export class BahethAPIClient {
    private token: string;
    private apiUrl = 'https://baheth.ieasybooks.com/api';

    constructor() {
        try {
            logger.debug('🔧 Initializing BahethAPIClient');
            this.token = env.BAHETH_API_TOKEN;
            
            logger.info('✅ BahethAPIClient initialized successfully', {
                apiUrl: this.apiUrl,
                authenticated: !!this.token
            });
        } catch (error) {
            logger.error('💥 Failed to initialize BahethAPIClient', {
                error: error instanceof Error ? {
                    name: error.name,
                    message: error.message,
                    stack: error.stack?.split('\n').slice(0, 3)
                } : String(error)
            });
            throw error;
        }
    }

    /**
     * Private method to fetch from Baheth API - exact copy from web service
     */
    private async fetchFromBaheth(
        endpoint: string,
        params: Record<string, string>
    ) {
        const searchParams = new URLSearchParams({
            ...params,
            token: this.token,
        });

        // delete empty values
        for (const key in params) {
            if (!params[key]) {
                searchParams.delete(key);
            }
        }

        const requestUrl = `${this.apiUrl}${endpoint}?${searchParams}`;
        
        logger.debug('📤 Making Baheth API request', { 
            requestUrl: requestUrl.replace(this.token, '[REDACTED]'),
            method: 'GET'
        });

        const response = await fetch(requestUrl, { 
            headers: { Accept: 'application/json' } 
        });

        logger.debug('📥 Baheth API response received', {
            status: response.status,
            statusText: response.statusText,
            headers: {
                'content-type': response.headers.get('content-type'),
                'content-length': response.headers.get('content-length')
            }
        });

        if (!response.ok) {
            const errorText = await response.text().catch(() => 'Unable to read error response');
            logger.error('❌ Baheth API request failed', {
                status: response.status,
                statusText: response.statusText,
                errorBody: errorText.substring(0, 200)
            });
            throw new Error(`Baheth API error: ${response.statusText}`);
        }

        return response.json();
    }

    /**
     * Get medium by YouTube ID - exact implementation from web service
     */
    async getMediumByYoutubeId(youtubeId: string): Promise<BahethMedium | null> {
        const startTime = Date.now();
        
        try {
            logger.info('🔍 Starting Baheth API search', { 
                youtubeId,
                fullUrl: `https://www.youtube.com/watch?v=${youtubeId}`
            });

            const result = await this.fetchFromBaheth('/medium', {
                reference_id: `https://www.youtube.com/watch?v=${youtubeId}`,
                reference_type: 'youtube_link',
                'expand[]': 'cues,playlist,speakers',
            }) as BahethMedium;

            const requestDuration = Date.now() - startTime;

            logger.info('✅ Medium found in Baheth', {
                bahethId: result.id,
                title: result.title,
                slug: result.slug,
                hasTxtLink: !!result.transcription_txt_link,
                hasSrtLink: !!result.transcription_srt_link,
                duration: `${requestDuration}ms`,
                transcriptionLinks: {
                    txt: result.transcription_txt_link ? 'available' : 'missing',
                    srt: result.transcription_srt_link ? 'available' : 'missing'
                }
            });

            return result;
        } catch (error) {
            const requestDuration = Date.now() - startTime;
            
            logger.error('💥 Error fetching medium from Baheth', {
                youtubeId,
                error: error instanceof Error ? error.message : String(error),
                duration: `${requestDuration}ms`
            });
            
            return null;
        }
    }

    /**
     * Searches for a medium by YouTube URL - wrapper for backward compatibility
     * @param youtubeUrl - The YouTube video URL
     * @returns Medium information if found, null if not found
     */
    async findMediumByYouTubeUrl(youtubeUrl: string): Promise<BahethMedium | null> {
        const startTime = Date.now();
        
        try {
            logger.info('🔍 Starting Baheth API search', { 
                youtubeUrl,
                apiUrl: this.apiUrl
            });

            // Extract video ID from URL
            const videoId = BahethAPIClient.extractYouTubeVideoId(youtubeUrl);
            if (!videoId) {
                logger.warn('❌ Could not extract video ID from YouTube URL', { 
                    youtubeUrl,
                    reason: 'Invalid YouTube URL format'
                });
                return null;
            }

            // Use the typed method
            const bahethMedium = await this.getMediumByYoutubeId(videoId);
            if (!bahethMedium) {
                logger.info('❌ Medium not found in Baheth (404)', { 
                    youtubeUrl,
                    duration: `${Date.now() - startTime}ms`
                });
                return null;
            }

            // Convert to backward-compatible format
            return {
                id: bahethMedium.id,
                title: bahethMedium.title,
                transcription_txt_link: bahethMedium.transcription_txt_link || null,
                transcription_srt_link: bahethMedium.transcription_srt_link || null,
                source_link: bahethMedium.source_link,
            };
        } catch (error) {
            const requestDuration = Date.now() - startTime;
            
            // Check if it's a network error
            if (error instanceof TypeError && error.message.includes('fetch')) {
                logger.error('🌐 Baheth API network error', {
                    youtubeUrl,
                    apiUrl: this.apiUrl,
                    error: error.message,
                    duration: `${requestDuration}ms`,
                    suggestion: 'Check network connectivity and API endpoint'
                });
                return null;
            }

            logger.error('💥 Baheth API unexpected error', {
                youtubeUrl,
                error: error instanceof Error ? {
                    name: error.name,
                    message: error.message,
                    stack: error.stack?.split('\n').slice(0, 3)
                } : String(error),
                duration: `${requestDuration}ms`
            });

            // Don't throw the error - return null to fall back to other scrapers
            return null;
        }
    }

    /**
     * Tests connectivity to the Baheth API
     * @returns Promise<boolean> - true if API is reachable, false otherwise
     */
    async testConnectivity(): Promise<boolean> {
        try {
            logger.info('🔌 Testing Baheth API connectivity', { apiUrl: this.apiUrl });
            
            // Use a test video ID that likely doesn't exist
            const testResult = await this.getMediumByYoutubeId('test123nonexistent');
            
            // We expect null for a non-existent video, which means API is working
            const isConnected = testResult === null;
            
            logger.info(isConnected ? '✅ Baheth API connectivity test passed' : '❌ Baheth API connectivity test failed', {
                isConnected,
                testResult: testResult ? 'found_unexpected_result' : 'null_as_expected'
            });
            
            return isConnected;
        } catch (error) {
            logger.error('❌ Baheth API connectivity test failed', {
                apiUrl: this.apiUrl,
                error: error instanceof Error ? error.message : String(error)
            });
            return false;
        }
    }

    /**
     * Extracts YouTube video ID from various YouTube URL formats
     * @param url - YouTube URL
     * @returns Video ID or null if not found
     */
    static extractYouTubeVideoId(url: string): string | null {
        try {
            const urlObj = new URL(url);
            
            // Handle different YouTube URL formats
            if (urlObj.hostname === 'youtu.be') {
                // https://youtu.be/VIDEO_ID
                return urlObj.pathname.slice(1);
            }
            
            if (urlObj.hostname === 'www.youtube.com' || urlObj.hostname === 'youtube.com') {
                // https://www.youtube.com/watch?v=VIDEO_ID
                if (urlObj.pathname === '/watch') {
                    return urlObj.searchParams.get('v');
                }
                
                // https://www.youtube.com/embed/VIDEO_ID
                if (urlObj.pathname.startsWith('/embed/')) {
                    return urlObj.pathname.split('/')[2];
                }
                
                // https://www.youtube.com/v/VIDEO_ID
                if (urlObj.pathname.startsWith('/v/')) {
                    return urlObj.pathname.split('/')[2];
                }
            }
            
            return null;
        } catch {
            return null;
        }
    }
}