const common = {
  requireModule: ['ts-node/register'],
  failFast: true
}

module.exports = {
  default: {
    ...common,
    require: ['./features/**/*.js', './features/**/*.ts'],
    paths: ['features']
  },
  exposition: {
    ...common,
    paths: ['extensions/exposition/features'],
    require: ['extensions/exposition/features/**/*.ts']
  }
}
