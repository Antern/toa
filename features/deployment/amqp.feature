Feature: AMQP deployment

  Scenario: Proxies for single external AMQP broker

  Deploy context with one broker for all.

    Given I have components:
      | dummies.one |
      | dummies.two |
    And I have a context with:
      """
      amqp: amqp://host.docker.internal:5672
      """
    When I export deployment
    Then exported values should contain:
      """
      proxies:
        - name: bindings-amqp-system
          target: host.docker.internal
        - name: bindings-amqp-dummies-one
          target: host.docker.internal
        - name: bindings-amqp-dummies-two
          target: host.docker.internal
      """

  Scenario: Proxies for multiple external AMQP brokers

  Deploy context with individual broker for each component within the same namespace.

    Given I have components:
      | dummies.one |
      | dummies.two |
    And I have a context with:
      """
      amqp:
        system: amqp://system-host
        dummies.one: amqp://host1
        dummies.two: amqps://host2:5761
      """
    When I export deployment
    Then exported values should contain:
      """
      proxies:
        - name: bindings-amqp-system
          target: system-host
        - name: bindings-amqp-dummies-one
          target: host1
        - name: bindings-amqp-dummies-two
          target: host2
      """

  Scenario: Custom protocol and port for external brokers

    Given I have components:
      | dummies.one |
      | dummies.two |
    And I have a context with:
      """
      amqp:
        system: amqps://system-host:5761
        dummies.one: amqps://host1
        dummies.two: amqp://host2:5762
      """
    When I export deployment
    Then exported values should contain:
      """
      variables:
        dummies-one:
          - name: TOA_BINDINGS_AMQP_SYSTEM_PROTOCOL
            value: amqps
          - name: TOA_BINDINGS_AMQP_SYSTEM_PORT
            value: 5761
          - name: TOA_BINDINGS_AMQP_DUMMIES_ONE_PROTOCOL
            value: amqps
        dummies-two:
          - name: TOA_BINDINGS_AMQP_SYSTEM_PROTOCOL
            value: amqps
          - name: TOA_BINDINGS_AMQP_SYSTEM_PORT
            value: 5761
          - name: TOA_BINDINGS_AMQP_DUMMIES_TWO_PORT
            value: 5762
      """
