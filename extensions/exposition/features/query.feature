Feature: Queries

  Background:
    Given the `pots` database contains:
      | _id                              | title      | volume | temperature |
      | 4c4759e6f9c74da989d64511df42d6f4 | First pot  | 100    | 80          |
      | 99988d785d7d445cad45dbf8531f560b | Second pot | 200    | 30          |
      | a7edded6b2ab47a0aca9508cc4da4138 | Third pot  | 300    | 50          |
      | bc6913d317334d76acd07d9f25f73535 | Fourth pot | 400    | 90          |

  Scenario: Request with `id` query parameter
    Given the `pots` is running with the following manifest:
      """yaml
      exposition:
        /pot:
          io:output: true
          GET: observe
      """
    When the following request is received:
      """
      GET /pots/pot/?id=99988d785d7d445cad45dbf8531f560b HTTP/1.1
      host: nex.toa.io
      accept: application/yaml
      """
    Then the following reply is sent:
      """
      200 OK
      content-type: application/yaml

      id: 99988d785d7d445cad45dbf8531f560b
      title: Second pot
      volume: 200
      """

  Scenario: Request with query criteria
    Given the `pots` is running with the following manifest:
      """yaml
      exposition:
        /:
          io:output: true
          GET: enumerate
      """
    When the following request is received:
      """
      GET /pots/?criteria=volume<300&limit=10 HTTP/1.1
      host: nex.toa.io
      accept: application/yaml
      """
    Then the following reply is sent:
      """
      200 OK
      content-type: application/yaml

      - id: 4c4759e6f9c74da989d64511df42d6f4
        title: First pot
        volume: 100
      - id: 99988d785d7d445cad45dbf8531f560b
        title: Second pot
        volume: 200
      """

  Scenario: Request with `omit` and `limit`
    Given the `pots` is running with the following manifest:
      """yaml
      exposition:
        /:
          io:output: true
          GET: enumerate
      """
    When the following request is received:
      """
      GET /pots/?omit=1&limit=2 HTTP/1.1
      host: nex.toa.io
      accept: application/yaml
      """
    Then the following reply is sent:
      """
      200 OK
      content-type: application/yaml

      - id: 99988d785d7d445cad45dbf8531f560b
        title: Second pot
        volume: 200
      - id: a7edded6b2ab47a0aca9508cc4da4138
        title: Third pot
        volume: 300
      """

  Scenario: Request with sorting
    Given the `pots` is running with the following manifest:
      """yaml
      exposition:
        /:
          io:output: true
          GET: enumerate
      """
    When the following request is received:
      """
      GET /pots/?sort=volume:desc&limit=2 HTTP/1.1
      host: nex.toa.io
      accept: application/yaml
      """
    Then the following reply is sent:
      """
      200 OK
      content-type: application/yaml

      - id: bc6913d317334d76acd07d9f25f73535
        title: Fourth pot
        volume: 400
      - id: a7edded6b2ab47a0aca9508cc4da4138
        title: Third pot
        volume: 300
      """

  Scenario: Request to a route with path variable
    Given the `pots` is running with the following manifest:
      """yaml
      exposition:
        /:id:
          io:output: true
          GET: observe
      """
    When the following request is received:
      """
      GET /pots/99988d785d7d445cad45dbf8531f560b/ HTTP/1.1
      host: nex.toa.io
      accept: application/yaml
      """
    Then the following reply is sent:
      """
      200 OK
      content-type: application/yaml

      id: 99988d785d7d445cad45dbf8531f560b
      title: Second pot
      volume: 200
      """

  Scenario: Request to a route with path variable using OR operator
    Given the `pots` is running with the following manifest:
      """yaml
      exposition:
        /:volume:
          io:output: true
          GET:
            query:
              criteria: ',volume==100'
            endpoint: enumerate
      """
    When the following request is received:
      """
      GET /pots/200/ HTTP/1.1
      host: nex.toa.io
      accept: application/yaml
      """
    Then the following reply is sent:
      """
      200 OK
      content-type: application/yaml

      - id: 4c4759e6f9c74da989d64511df42d6f4
        title: First pot
        volume: 100
        temperature: 80
      - id: 99988d785d7d445cad45dbf8531f560b
        title: Second pot
        volume: 200
      """

  Scenario: Request to a route with predefined criteria
    Given the `pots` is running with the following manifest:
      """yaml
      exposition:
        /big:
          io:output: true
          GET:
            endpoint: enumerate
            query:
              criteria: volume>200
      """
    When the following request is received:
      """
      GET /pots/big/ HTTP/1.1
      host: nex.toa.io
      accept: application/yaml
      """
    Then the following reply is sent:
      """
      200 OK
      content-type: application/yaml

      - id: a7edded6b2ab47a0aca9508cc4da4138
        title: Third pot
        volume: 300
      - id: bc6913d317334d76acd07d9f25f73535
        title: Fourth pot
        volume: 400
      """

  Scenario: Request to a route with open criteria
    Given the `pots` is running with the following manifest:
      """yaml
      exposition:
        /big:
          io:output: true
          GET:
            endpoint: enumerate
            query:
              criteria: volume>200; # open criteria
      """
    When the following request is received:
      """
      GET /pots/big/?criteria=temperature>50 HTTP/1.1
      host: nex.toa.io
      accept: application/yaml
      """
    Then the following reply is sent:
      """
      200 OK
      content-type: application/yaml

      - id: bc6913d317334d76acd07d9f25f73535
        title: Fourth pot
        volume: 400
        temperature: 90
      """

  Scenario: Request to a route with predefined query
    Given the `pots` is running with the following manifest:
      """yaml
      exposition:
        /hottest2:
          io:output: true
          GET:
            endpoint: enumerate
            query:
              criteria: temperature>60
              sort: temperature:desc
              limit: 2
      """
    When the following request is received:
      """
      GET /pots/hottest2/ HTTP/1.1
      host: nex.toa.io
      accept: application/yaml
      """
    Then the following reply is sent:
      """
      200 OK
      content-type: application/yaml

      - id: bc6913d317334d76acd07d9f25f73535
        title: Fourth pot
        volume: 400
        temperature: 90
      - id: 4c4759e6f9c74da989d64511df42d6f4
        title: First pot
        volume: 100
        temperature: 80
      """

  Scenario: Query parameters
    Given the `echo` is running with the following manifest:
      """yaml
      exposition:
        /:
          GET:
            io:output: true
            query:
              parameters: [name]
            endpoint: compute
      """
    When the following request is received:
      """
      GET /echo/?name=John HTTP/1.1
      host: nex.toa.io
      accept: text/plain
      """
    Then the following reply is sent:
      """
      200 OK

      Hello John
      """
    When the following request is received:
      """
      GET /echo/?foo=bar HTTP/1.1
      host: nex.toa.io
      accept: text/plain
      """
    Then the following reply is sent:
      """
      400 Bad Request

      Query parameter 'foo' is not allowed
      """
