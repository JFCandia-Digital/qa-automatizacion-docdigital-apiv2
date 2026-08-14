export const apiContext: {
  token: string | null;
  response: any;
  requestTimestamp: Date | null;
  requestEndpoint: string | null;
  requestAuthType: string | null;
  requestQueryParams: Map<string, string | number | boolean>;
  worldData: Map<string, any>;
  responseByteLength?: number;
  responseContentType?: string;
  attachData: {
    method?: string;
    url?: string;
    requestBody?: any;
    responseBody?: any;
    statusCode?: number;
    authorizationHeader?: string;
  };
} = {
  token: null,
  response: null,
  requestTimestamp: null,
  requestEndpoint: null,
  requestAuthType: null,
  requestQueryParams: new Map(),
  worldData: new Map(),
  attachData: {},
};
