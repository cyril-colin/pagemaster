import { LoggerService } from './logger.service';

export type FetchParams = Parameters<(input: string | URL | Request, init?: RequestInit | undefined) => Promise<Response>>;
export class HttpClientError extends Error {
    constructor(
        public override message: string,
        public body: string,
        public response: Response,
    ) {
        super();
    }
}

export type HttpBaseUrl =
    | `http://${string}:${number}`
    | `http://${string}:${number}/${string}`
    | `https://${string}:${number}`
    | `https://${string}:${number}/${string}`
    | `http://${string}`
    | `https://${string}`

export abstract class AbstractHttpClient {
    protected abstract get baseUrl(): HttpBaseUrl;

    constructor(
      protected logger: LoggerService,
      protected secureMode = true,
    ) {

    }

    protected fetchToCurl(options: FetchParams) {
        const headers = Object.entries(options[1]?.headers ?? []).map(([k, value]) => {
          const v = this.secureMode ? '****' : value;
          return `-H '${k}: ${v}'`
        });
        const body = options[1]?.body ? ` -d ${options[1]?.body}` : '';
        return `curl -X ${options[1]?.method} ${options[0]} ${headers.join(' ')}${body}`;
    }

    protected logs(options: FetchParams) {
      if (this.secureMode) {
        return;
      }
      this.logger.debug('HTTP client call', { curl: this.fetchToCurl(options) });
    }

    protected async convert<T>(
        result: Response,
        responseType: 'json',
    ): Promise<T>;
    protected async convert(
        result: Response,
        responseType: 'text',
    ): Promise<string>;
    protected async convert(
        result: Response,
        responseType: 'blob',
    ): Promise<Blob>;
    protected async convert<T>(
        result: Response,
        responseType: 'json' | 'text' | 'blob',
    ): Promise<string | T | Blob> {
        if (!result.ok) {
            throw new HttpClientError(
                `${result.status} - ${result.statusText}`,
                await result.text(),
                result,
            );
        }

        switch (responseType) {
            case 'json':
                return await result.json();
            case 'text':
                return await result.text();
            case 'blob':
                return await result.blob();
            default:
                throw new TypeError('Wrong type to parse.');
        }
    }

    protected async post<T = unknown>(
        url: string,
        data?: string,
        responseType?: 'json',
    ): Promise<T>;
    protected async post(
        url: string,
        data?: string,
        responseType?: 'text',
    ): Promise<string>;
    protected async post<T = unknown>(
        url: string,
        data?: string,
        responseType: 'json' | 'text' = 'json',
    ): Promise<string | T> {
        const options: FetchParams = [
            url,
            {
                method: 'POST',
                headers: await this.getHeaders(),
                body: data,
            },
        ];
        this.logs(options);
        const result = await fetch(...options);

        switch (responseType) {
            case 'json':
                return await this.convert<T>(result, 'json');
            case 'text':
                return await this.convert(result, 'text');
            default:
                throw new TypeError('Wrong type to parse.');
        }
    }

    protected async put<T = unknown>(
        url: string,
        data?: string,
        responseType?: 'json',
    ): Promise<T>;
    protected async put(
        url: string,
        data?: string,
        responseType?: 'text',
    ): Promise<string>;
    protected async put<T = unknown>(
        url: string,
        data?: string,
        responseType: 'json' | 'text' = 'json',
    ): Promise<string | T> {
        const options: FetchParams = [
            url,
            {
                method: 'PUT',
                headers: await this.getHeaders(),
                body: data,
            },
        ];
        this.logs(options);
        const result = await fetch(...options);
        switch (responseType) {
            case 'json':
                return await this.convert<T>(result, 'json');
            case 'text':
                return await this.convert(result, 'text');
            default:
                throw new TypeError('Wrong type to parse.');
        }
    }

    protected async get<T = unknown>(url: string,responseType?: 'json'): Promise<T>;
    protected async get(url: string, responseType?: 'text'): Promise<string>;
    protected async get(url: string, responseType?: 'blob'): Promise<Blob>;
    protected async get<T = unknown>(
        url: string,
        responseType: 'json' | 'text' | 'blob' = 'json',
    ): Promise<string | T | Blob> {
        const options: FetchParams = [
            url,
            {
                method: 'GET',
                headers: await this.getHeaders(),
            },
        ];
        this.logs(options);

        const result = await fetch(...options);
        switch (responseType) {
            case 'json':
                return await this.convert<T>(result, 'json');
            case 'text':
                return await this.convert(result, 'text');
            case 'blob':
                return await this.convert(result, 'blob');
            default:
                throw new TypeError('Wrong type to parse.');
        }
    }

    protected async delete<T = unknown>(
        url: string,
        responseType?: 'json',
    ): Promise<T>;
    protected async delete(url: string, responseType?: 'text'): Promise<string>;
    protected async delete<T = unknown>(
        url: string,
        responseType: 'json' | 'text' = 'json',
    ): Promise<string | T> {
        const options: FetchParams = [
            url,
            {
                method: 'DELETE',
                headers: await this.getHeaders(),
            },
        ];
        this.logs(options);
        const result = await fetch(...options);
        switch (responseType) {
            case 'json':
                return await this.convert<T>(result, 'json');
            case 'text':
                return await this.convert(result, 'text');
            default:
                throw new TypeError('Wrong type to parse.');
        }
    }

    protected abstract getHeaders(): Promise<Record<string, string>>;
}
