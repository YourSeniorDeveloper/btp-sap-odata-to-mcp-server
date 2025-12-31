import express from 'express';

/**
 * Utility functions for Google Gemini compatibility
 * 
 * Google Gemini API doesn't accept the "additionalProperties" field in JSON Schema,
 * which is commonly added by Zod-to-JSON-Schema converters. This module provides
 * functions to detect Gemini clients and clean schemas accordingly.
 */

/**
 * Remove additionalProperties recursively from JSON Schema
 * Google Gemini API doesn't accept additionalProperties field
 */
export function removeAdditionalProperties(obj: any): any {
    if (obj === null || obj === undefined) {
        return obj;
    }

    if (Array.isArray(obj)) {
        return obj.map(item => removeAdditionalProperties(item));
    }

    if (typeof obj === 'object') {
        const cleaned: any = {};
        for (const [key, value] of Object.entries(obj)) {
            // Skip additionalProperties field
            if (key === 'additionalProperties') {
                continue;
            }
            // Recursively clean nested objects
            cleaned[key] = removeAdditionalProperties(value);
        }
        return cleaned;
    }

    return obj;
}

/**
 * Transform MCP response to be compatible with Google Gemini
 * Removes additionalProperties from tool schemas in tools/list responses
 */
export function transformMCPResponseForGemini(response: any): any {
    if (!response || typeof response !== 'object') {
        return response;
    }

    // Handle tools/list response
    if (response.result?.tools) {
        const transformed = { ...response };
        transformed.result = {
            ...response.result,
            tools: response.result.tools.map((tool: any) => {
                if (tool.inputSchema) {
                    return {
                        ...tool,
                        inputSchema: removeAdditionalProperties(tool.inputSchema)
                    };
                }
                return tool;
            })
        };
        return transformed;
    }

    // Handle single tool in response (if needed)
    if (response.result?.tool?.inputSchema) {
        return {
            ...response,
            result: {
                ...response.result,
                tool: {
                    ...response.result.tool,
                    inputSchema: removeAdditionalProperties(response.result.tool.inputSchema)
                }
            }
        };
    }

    // Handle nested tool definitions in other response formats
    if (response.result && typeof response.result === 'object') {
        const transformed = { ...response };
        transformed.result = removeAdditionalProperties(response.result);
        return transformed;
    }

    return response;
}

/**
 * Detect if the client is Google Gemini
 * Checks User-Agent header and custom X-MCP-Client header
 */
export function isGeminiClient(req: express.Request): boolean {
    // Check User-Agent
    const userAgent = req.headers['user-agent']?.toLowerCase() || '';
    if (userAgent.includes('gemini') || (userAgent.includes('google') && userAgent.includes('ai'))) {
        return true;
    }

    // Check custom header (for explicit client identification)
    const clientHeaderValue = req.headers['x-mcp-client'];
    const clientHeader = Array.isArray(clientHeaderValue) 
        ? clientHeaderValue[0]?.toLowerCase() 
        : clientHeaderValue?.toLowerCase();
    if (clientHeader === 'gemini') {
        return true;
    }

    return false;
}

