declare namespace toa.mock.gherkin {

    type Keyword = 'Given' | 'When' | 'Then' | 'Before' | 'After' | 'BeforeAll' | 'AfterAll'

    type Expression = (sentence?: string | number) => Function

    type Steps = Record<Keyword, Expression>

    namespace table {
        type Constructor = (table: any[][]) => Table
    }

    interface Table {
        rows(): any[][]

        raw(): any[][]
    }

}

export const steps: toa.mock.gherkin.Steps
export const table: toa.mock.gherkin.table.Constructor
export const clear: () => void
