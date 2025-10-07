╭───────────────────────────────────────────────────────────────────────────────────────────────────╮
 │ ✔  get_workspace_tasks (clickup MCP Server) {"detail_level":"summary","assignees":["81476929"]}   │
 │                                                                                                   │
 │    {                                                                                              │
 │      "error": "Failed to get workspace tasks: Request failed with status code 400",               │
 │      "detail_level": "summary",                                                                   │
 │      "assignees": [                                                                               │
 │        "81476929"                                                                                 │
 │      ]                                                                                            │
 │    }                                                                                              │
 ╰───────────────────────────────────────────────────────────────────────────────────────────────────╯
 ╭──────────────────────────────────────────────────────────────────────────────────────────────────────────────╮
 │ ✔  get_workspace_tasks (clickup MCP Server) {"list_ids":["901109097171","901109025704"],"assignees":["81476… │
 │                                                                                                              │
 │    {                                                                                                         │
 │      "summaries": [],                                                                                        │
 │      "total_count": 0,                                                                                       │
 │      "has_more": false,                                                                                      │
 │      "next_page": 0                                                                                          │
 │    }                                                                                                         │
 │    ♥ Support this project by sponsoring the developer at https://github.com/sponsors/taazkareem              │
 ╰──────────────────────────────────────────────────────────────────────────────────────────────────────────────╯
 ╭───────────────────────────────────────────────────────────────────────────────────────────────────╮
 │ ✔  get_workspace_hierarchy (clickup MCP Server) {}                                                │
 │                                                                                                   │
 │    {                                                                                              │
 │      "error": "Error getting workspace hierarchy: Request failed with status code 400"            │
 │    }                                                                                              │
 ╰───────────────────────────────────────────────────────────────────────────────────────────────────╯




 LOG DEBUG
 Error getting workspace members: ClickUpServiceError: Request failed with status code 400
    at WorkspaceService.handleAxiosError (file:///C:/Users/tfoliveira/Documents/Gitlab/clickup-mcp-server/build/services/clickup/base.js:200:15)
    at file:///C:/Users/tfoliveira/Documents/Gitlab/clickup-mcp-server/build/services/clickup/base.js:119:83
    at process.processTicksAndRejections (node:internal/process/task_queues:95:5)
    at async Axios.request (file:///C:/Users/tfoliveira/Documents/Gitlab/clickup-mcp-server/node_modules/axios/lib/core/Axios.js:40:14)
    at async WorkspaceService.getWorkspaceMembers (file:///C:/Users/tfoliveira/Documents/Gitlab/clickup-mcp-server/build/services/clickup/workspace.js:377:30)
    at async handleFindMemberByName (file:///C:/Users/tfoliveira/Documents/Gitlab/clickup-mcp-server/build/tools/member.js:74:25) {
  code: 'validation_error',
  data: AxiosError: Request failed with status code 400
      at settle (file:///C:/Users/tfoliveira/Documents/Gitlab/clickup-mcp-server/node_modules/axios/lib/core/settle.js:19:12)
      at IncomingMessage.handleStreamEnd (file:///C:/Users/tfoliveira/Documents/Gitlab/clickup-mcp-server/node_modules/axios/lib/adapters/http.js:599:11)
      at IncomingMessage.emit (node:events:523:35)
      at endReadableNT (node:internal/streams/readable:1367:12)
      at process.processTicksAndRejections (node:internal/process/task_queues:82:21) {
    code: 'ERR_BAD_REQUEST',
    config: {
      transitional: [Object],
      adapter: [Array],
      transformRequest: [Array],
      transformResponse: [Array],
      timeout: 65000,
      xsrfCookieName: 'XSRF-TOKEN',
      xsrfHeaderName: 'X-XSRF-TOKEN',
      maxContentLength: -1,
      maxBodyLength: -1,
      env: [Object],
      validateStatus: [Function: validateStatus],
      headers: [Object [AxiosHeaders]],
      baseURL: 'https://api.clickup.com/api/v2',
      method: 'get',
      url: '/team/9011970959',
      allowAbsoluteUrls: true,
      data: undefined
    },
    request: ClientRequest {
      _events: [Object: null prototype],
      _eventsCount: 7,
      _maxListeners: undefined,
      outputData: [],
      outputSize: 0,
      writable: true,
      destroyed: true,
      _last: true,
      chunkedEncoding: false,
      shouldKeepAlive: true,
      maxRequestsOnConnectionReached: false,
      _defaultKeepAlive: true,
      useChunkedEncodingByDefault: false,
      sendDate: false,
      _removedConnection: false,
      _removedContLen: false,
      _removedTE: false,
      strictContentLength: false,
      _contentLength: 0,
      _hasBody: true,
      _trailer: '',
      finished: true,
      _headerSent: true,
      _closed: true,
      socket: [Socket],
      _header: 'GET https://api.clickup.com/api/v2/team/9011970959 HTTP/1.1\r\n' +
        'Accept: application/json, text/plain, */*\r\n' +
        'Content-Type: application/json\r\n' +
        'Authorization: pk_81483134_V9MPPW3Q6ID6EOAN3AKB3DBMXPP51UU8\r\n' +
        'User-Agent: axios/1.8.4\r\n' +
        'Accept-Encoding: gzip, compress, deflate, br\r\n' +
        'Proxy-Authorization: Basic c2VydmljZWxpbnV4OkFiMTIzNDU2\r\n' +
        'host: api.clickup.com\r\n' +
        'Connection: keep-alive\r\n' +
        '\r\n',
      _keepAliveTimeout: 0,
      _onPendingData: [Function: nop],
      agent: [Agent],
      socketPath: undefined,
      method: 'GET',
      maxHeaderSize: undefined,
      insecureHTTPParser: undefined,
      joinDuplicateHeaders: undefined,
      path: 'https://api.clickup.com/api/v2/team/9011970959',
      _ended: true,
      res: [IncomingMessage],
      aborted: false,
      timeoutCb: null,
      upgradeOrConnect: false,
      parser: null,
      maxHeadersCount: null,
      reusedSocket: false,
      host: '10.0.1.186',
      protocol: 'http:',
      _redirectable: [Writable],
      [Symbol(kCapture)]: false,
      [Symbol(kBytesWritten)]: 0,
      [Symbol(kNeedDrain)]: false,
      [Symbol(corked)]: 0,
      [Symbol(kOutHeaders)]: [Object: null prototype],
      [Symbol(errored)]: null,
      [Symbol(kHighWaterMark)]: 16384,
      [Symbol(kUniqueHeaders)]: null
    },
    response: {
      status: 400,
      statusText: 'Bad Request',
      headers: [Object [AxiosHeaders]],
      config: [Object],
      request: [ClientRequest],
      data: '<!DOCTYPE HTML PUBLIC "-//W3C//DTD HTML 4.01 Transitional//EN" "http://www.w3.org/TR/html4/loose.dtd">\n' +
        '<HTML><HEAD><META HTTP-EQUIV="Content-Type" CONTENT="text/html; charset=iso-8859-1">\n' +
        '<TITLE>ERROR: The request could not be satisfied</TITLE>\n' +
        '</HEAD><BODY>\n' +
        '<H1>400 ERROR</H1>\n' +
        '<H2>The request could not be satisfied.</H2>\n' +
        '<HR noshade size="1px">\n' +
        'Bad request.\n' +
        "We can't connect to the server for this app or website at this time. There might be too much traffic or a configuration error. Try again later, or contact the app or website owner.\n" +
        '<BR clear="all">\n' +
        'If you provide content to customers through CloudFront, you can find steps to troubleshoot and help prevent this error by reviewing the CloudFront documentation.\n' +
        '<BR clear="all">\n' +
        '<HR noshade size="1px">\n' +
        '<PRE>\n' +
        'Generated by cloudfront (CloudFront)\n' +
        'Request ID: -yr3ekfl_r9XXNJXawausc0vd2c2R_wlS_6QQnNUL1Utz5e482NbhA==\n' +
        '</PRE>\n' +
        '<ADDRESS>\n' +
        '</ADDRESS>\n' +
        '</BODY></HTML>'
    },
    status: 400
  },
  status: undefined,
  context: undefined
}
Error getting workspace members: ClickUpServiceError: Request failed with status code 400
    at WorkspaceService.handleAxiosError (file:///C:/Users/tfoliveira/Documents/Gitlab/clickup-mcp-server/build/services/clickup/base.js:200:15)
    at file:///C:/Users/tfoliveira/Documents/Gitlab/clickup-mcp-server/build/services/clickup/base.js:119:83
    at process.processTicksAndRejections (node:internal/process/task_queues:95:5)
    at async Axios.request (file:///C:/Users/tfoliveira/Documents/Gitlab/clickup-mcp-server/node_modules/axios/lib/core/Axios.js:40:14)
    at async WorkspaceService.getWorkspaceMembers (file:///C:/Users/tfoliveira/Documents/Gitlab/clickup-mcp-server/build/services/clickup/workspace.js:377:30)
    at async handleGetWorkspaceMembers (file:///C:/Users/tfoliveira/Documents/Gitlab/clickup-mcp-server/build/tools/member.js:56:25) {
  code: 'validation_error',
  data: AxiosError: Request failed with status code 400
      at settle (file:///C:/Users/tfoliveira/Documents/Gitlab/clickup-mcp-server/node_modules/axios/lib/core/settle.js:19:12)
      at IncomingMessage.handleStreamEnd (file:///C:/Users/tfoliveira/Documents/Gitlab/clickup-mcp-server/node_modules/axios/lib/adapters/http.js:599:11)
      at IncomingMessage.emit (node:events:523:35)
      at endReadableNT (node:internal/streams/readable:1367:12)
      at process.processTicksAndRejections (node:internal/process/task_queues:82:21) {
    code: 'ERR_BAD_REQUEST',
    config: {
      transitional: [Object],
      adapter: [Array],
      transformRequest: [Array],
      transformResponse: [Array],
      timeout: 65000,
      xsrfCookieName: 'XSRF-TOKEN',
      xsrfHeaderName: 'X-XSRF-TOKEN',
      maxContentLength: -1,
      maxBodyLength: -1,
      env: [Object],
      validateStatus: [Function: validateStatus],
      headers: [Object [AxiosHeaders]],
      baseURL: 'https://api.clickup.com/api/v2',
      method: 'get',
      url: '/team/9011970959',
      allowAbsoluteUrls: true,
      data: undefined
    },
    request: ClientRequest {
      _events: [Object: null prototype],
      _eventsCount: 7,
      _maxListeners: undefined,
      outputData: [],
      outputSize: 0,
      writable: true,
      destroyed: true,
      _last: true,
      chunkedEncoding: false,
      shouldKeepAlive: true,
      maxRequestsOnConnectionReached: false,
      _defaultKeepAlive: true,
      useChunkedEncodingByDefault: false,
      sendDate: false,
      _removedConnection: false,
      _removedContLen: false,
      _removedTE: false,
      strictContentLength: false,
      _contentLength: 0,
      _hasBody: true,
      _trailer: '',
      finished: true,
      _headerSent: true,
      _closed: true,
      socket: [Socket],
      _header: 'GET https://api.clickup.com/api/v2/team/9011970959 HTTP/1.1\r\n' +
        'Accept: application/json, text/plain, */*\r\n' +
        'Content-Type: application/json\r\n' +
        'Authorization: pk_81483134_V9MPPW3Q6ID6EOAN3AKB3DBMXPP51UU8\r\n' +
        'User-Agent: axios/1.8.4\r\n' +
        'Accept-Encoding: gzip, compress, deflate, br\r\n' +
        'Proxy-Authorization: Basic c2VydmljZWxpbnV4OkFiMTIzNDU2\r\n' +
        'host: api.clickup.com\r\n' +
        'Connection: keep-alive\r\n' +
        '\r\n',
      _keepAliveTimeout: 0,
      _onPendingData: [Function: nop],
      agent: [Agent],
      socketPath: undefined,
      method: 'GET',
      maxHeaderSize: undefined,
      insecureHTTPParser: undefined,
      joinDuplicateHeaders: undefined,
      path: 'https://api.clickup.com/api/v2/team/9011970959',
      _ended: true,
      res: [IncomingMessage],
      aborted: false,
      timeoutCb: null,
      upgradeOrConnect: false,
      parser: null,
      maxHeadersCount: null,
      reusedSocket: false,
      host: '10.0.1.186',
      protocol: 'http:',
      _redirectable: [Writable],
      [Symbol(kCapture)]: false,
      [Symbol(kBytesWritten)]: 0,
      [Symbol(kNeedDrain)]: false,
      [Symbol(corked)]: 0,
      [Symbol(kOutHeaders)]: [Object: null prototype],
      [Symbol(errored)]: null,
      [Symbol(kHighWaterMark)]: 16384,
      [Symbol(kUniqueHeaders)]: null
    },
    response: {
      status: 400,
      statusText: 'Bad Request',
      headers: [Object [AxiosHeaders]],
      config: [Object],
      request: [ClientRequest],
      data: '<!DOCTYPE HTML PUBLIC "-//W3C//DTD HTML 4.01 Transitional//EN" "http://www.w3.org/TR/html4/loose.dtd">\n' +
        '<HTML><HEAD><META HTTP-EQUIV="Content-Type" CONTENT="text/html; charset=iso-8859-1">\n' +
        '<TITLE>ERROR: The request could not be satisfied</TITLE>\n' +
        '</HEAD><BODY>\n' +
        '<H1>400 ERROR</H1>\n' +
        '<H2>The request could not be satisfied.</H2>\n' +
        '<HR noshade size="1px">\n' +
        'Bad request.\n' +
        "We can't connect to the server for this app or website at this time. There might be too much traffic or a configuration error. Try again later, or contact the app or website owner.\n" +
        '<BR clear="all">\n' +
        'If you provide content to customers through CloudFront, you can find steps to troubleshoot and help prevent this error by reviewing the CloudFront documentation.\n' +
        '<BR clear="all">\n' +
        '<HR noshade size="1px">\n' +
        '<PRE>\n' +
        'Generated by cloudfront (CloudFront)\n' +
        'Request ID: jICpmdlGNqu9xXxff_hQgCTxVlhPvXG8YqoPCqu342AGn9cM_3Qvmw==\n' +
        '</PRE>\n' +
        '<ADDRESS>\n' +
        '</ADDRESS>\n' +
        '</BODY></HTML>'
    },
    status: 400
  },
  status: undefined,
  context: undefined
}