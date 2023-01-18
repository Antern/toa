Feature: Local call samples

  Scenario Outline: Sample with local call passes
    Given I have an operation sample for `increment` of `math.calculations`:
      """yaml
      title: Increment by 1
      input:
        value: <a>
      output: <sum>
      local:
        add:
          input:
            a: <a>
            b: 1
          output: <sum>
      """
    When I replay it
    Then it passes
    Examples:
      | a | sum |
      | 1 | 2   |
      | 2 | 3   |
      | 1 | 3   |

  Scenario: Calls sample can be array

  Because of times: 2 argument increment calls add twice.

    Given I have an operation sample for `increment` of `math.calculations`:
      """yaml
      title: Increment by 1 twice
      input:
        value: 2
        times: 2
      output: 4
      local:
        add:
          - input:
              a: 2
              b: 1
            output: 3
          - input:
              a: 3
              b: 1
            output: 4
      """
    When I replay it
    Then it passes

  Scenario: Sample with actual local call passes

  If the local call sample does not contain output an actual call will be performed.

    Given I have an operation sample for `increment` of `math.calculations`:
      """yaml
      title: Increment by 1
      input:
        value: 1
      output: 2
      local:
        add:
          input:
            a: 1
            b: 1
      """
    When I replay it
    Then it passes

  Scenario: Sample with no call input validation passes
    Given I have an operation sample for `increment` of `math.calculations`:
      """yaml
      title: Increment by 1
      input:
        value: 1
      output: 2
      local:
        add:
          output: 2
      """
    When I replay it
    Then it passes

  Scenario: Sample with local call fails on call mismatch
    Given I have an operation sample for `increment` of `math.calculations`:
      """yaml
      title: Increment by 1
      input:
        value: 2
      output: 2
      local:
        add:
          input:
            a: 1
            b: 2
      """
    When I replay it
    Then it fails

  Scenario: Sample with local call fails on reply mismatch
    Given I have an operation sample for `increment` of `math.calculations`:
      """yaml
      title: Increment by 1
      input:
        value: 2
      output: 2
      local:
        add:
          output: 1
      """
    When I replay it
    Then it fails

  Scenario: Sample with local call query passes
    Given I have an operation sample for `same` of `tea.pots`:
      """yaml
      title: Return pots of steel
      input: steel
      local:
        enumerate:
          query:
            criteria: 'material==steel'
            limit: 10
          output: []
      """
    When I replay it
    Then it passes

  Scenario: Sample with local call query fails on mismatch
    Given I have an operation sample for `same` of `math.calculations`:
      """yaml
      title: Return pots of steel
      input: steel
      local:
        enumerate:
          query:
            criteria: 'material==glass'
            limit: 10
      """
    When I replay it
    Then it fails
