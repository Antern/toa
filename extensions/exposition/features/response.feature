Feature: Response

  Scenario: Error as YAML
    Given the `echo` is running with the following manifest:
      """yaml
      exposition:
        /:
          GET: error
      """
    When the following request is received:
      """
      GET /echo/ HTTP/1.1
      accept: application/yaml
      """
    Then the following reply is sent:
      """
      409 Conflict
      content-type: application/yaml

      code: CODE
      message: message
      """

  Scenario: Error as msgpack
    Given the `echo` is running with the following manifest:
      """yaml
      exposition:
        /:
          GET: error
      """
    When the following request is received:
      """
      GET /echo/ HTTP/1.1
      accept: application/msgpack
      """
    Then the following reply is sent:
      """
      409 Conflict
      content-type: application/msgpack

      � �code�CODE�message�message
      """
