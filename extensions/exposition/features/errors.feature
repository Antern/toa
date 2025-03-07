Feature: Errors

  Scenario Outline: Missing routes
    Given the `greeter` is running with the following manifest:
      """yaml
      namespace: basic
      """
    When the following request is received:
      """
      GET <path> HTTP/1.1
      host: nex.toa.io
      accept: text/plain
      """
    Then the following reply is sent:
      """
      404 Not Found

      Route not found
      """
    Examples:
      | path                                 |
      | /basic/greeter/non-existent-segment/ |
      | /basic/non-existent-component/       |
      | /non-existent-namespace/             |

  Scenario: Missing trailing slash
    Given the `greeter` is running with the following manifest:
      """yaml
      namespace: basic
      """
    When the following request is received:
      """
      GET /basic/greeter HTTP/1.1
      host: nex.toa.io
      accept: application/json
      """
    Then the following reply is sent:
      """
      404 Not Found
      content-type: application/json

      "Trailing slash is required"
      """

  Scenario: Missing method
    Given the `greeter` is running
    When the following request is received:
      """
      PATCH /greeter/ HTTP/1.1
      host: nex.toa.io
      accept: application/yaml
      """
    Then the following reply is sent:
      """
      405 Method Not Allowed
      """

  Scenario: Unsupported method
    When the following request is received:
      """
      COPY /basic/greeter/ HTTP/1.1
      host: nex.toa.io
      accept: application/yaml
      """
    Then the following reply is sent:
      """
      501 Not Implemented
      """

  Scenario: Request body does not match input schema
    Given the `pots` is running with the following manifest:
      """yaml
      exposition:
        /:
          POST: create
      """
    When the following request is received:
      """
      POST /pots/ HTTP/1.1
      host: nex.toa.io
      accept: application/yaml
      content-type: application/yaml

      foo: Hello
      bar: 1.5
      """
    Then the following reply is sent:
      """
      400 Bad Request
      content-type: application/yaml

      must have required property 'title'
      """

  Scenario: Query limit out of range
    Given the `pots` is running with the following manifest:
      """yaml
      exposition:
        /:
          GET: enumerate
      """
    When the following request is received:
      """
      GET /pots/?limit=1001 HTTP/1.1
      host: nex.toa.io
      accept: text/plain
      """
    Then the following reply is sent:
      """
      400 Bad Request
      content-type: text/plain

      Query limit must be between 1 and 100 inclusive
      """

  Scenario: Closed query criteria
    Given the `pots` is running with the following manifest:
      """yaml
      exposition:
        /hot:
          GET:
            endpoint: enumerate
            query:
              criteria: temperature>60
      """
    When the following request is received:
      """
      GET /pots/hot/?criteria=volume>500 HTTP/1.1
      host: nex.toa.io
      accept: text/plain
      """
    Then the following reply is sent:
      """
      400 Bad Request
      content-type: text/plain

      Query criteria is closed
      """

  Scenario: Additional query parameters
    Given the `pots` is running with the following manifest:
      """yaml
      exposition:
        /:
          GET:
            endpoint: enumerate
      """
    When the following request is received:
      """
      GET /pots/?foo=bar HTTP/1.1
      host: nex.toa.io
      accept: text/plain
      """
    Then the following reply is sent:
      """
      400 Bad Request
      content-type: text/plain

      Query Property foo is not expected to be here
      """

  Scenario: Malformed authorization header
    Given the annotation:
      """yaml
      /:
        GET: {}
      """
    When the following request is received:
      """
      GET / HTTP/1.1
      host: nex.toa.io
      authorization: Basic
      accept: text/plain
      """
    Then the following reply is sent:
      """
      401 Unauthorized

      Malformed authorization header
      """

  Scenario Outline: Exception is thrown (debug: <debug>)
    Given the annotation:
      """yaml
      debug: <debug>
      /:
        GET:
          anonymous: true
          dev:throw: Broken!
      """
    When the following request is received:
      """
      GET / HTTP/1.1
      host: nex.toa.io
      accept: text/plain
      """
    Then the following reply is sent:
      """
      500 Internal Server Error
      <response>
      """
    Examples:
      | debug | response          |
      | false | content-length: 0 |
      | true  | Error: Broken!    |

  Scenario: Not acceptable request
    Given the annotation:
      """yaml
      /:
        GET:
          io:output: true
          anonymous: true
          dev:stub: hello
      """
    When the following request is received:
      """
      GET / HTTP/1.1
      host: nex.toa.io
      accept: image/jpeg
      """
    Then the following reply is sent:
      """
      406 Not Acceptable
      """

  Scenario: Not acceptable request with error
    When the following request is received:
      """
      GET /robots.txt HTTP/1.1
      host: nex.toa.io
      accept: text/html
      """
    Then the following reply is sent:
      """
      404 Not Found
      """
