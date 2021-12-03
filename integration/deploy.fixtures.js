'use strict'

const chart = {
  apiVersion: 'v2',
  type: 'application',
  name: 'dummies',
  description: 'Integration tests context',
  version: '0.0.0',
  appVersion: '0.0.0',
  dependencies: [
    {
      name: 'mongodb',
      repository: 'https://charts.bitnami.com/bitnami',
      version: '10.29.2',
      alias: 'messages-mongodb'
    },
    {
      name: 'mongodb',
      repository: 'https://charts.bitnami.com/bitnami',
      version: '10.29.2',
      alias: 'stats-mongodb'
    },
    {
      name: 'mongodb',
      repository: 'https://charts.bitnami.com/bitnami',
      version: '10.29.2',
      alias: 'credits-mongodb'
    },
    {
      name: 'mongodb',
      repository: 'https://charts.bitnami.com/bitnami',
      version: '10.29.2',
      alias: 'dummies-mongodb'
    },
    {
      name: 'rabbitmq',
      repository: 'https://charts.bitnami.com/bitnami',
      version: '8.24.3'
    }
  ]
}

const values = {
  'messages-mongodb': {
    architecture: 'standalone',
    fullnameOverride: 'messages-mongodb',
    auth: {
      usernames: ['user'],
      passwords: ['password'],
      databases: ['messages']
    }
  },
  'stats-mongodb': {
    architecture: 'standalone',
    fullnameOverride: 'stats-mongodb',
    auth: {
      usernames: ['user'],
      passwords: ['password'],
      databases: ['stats']
    }
  },
  'credits-mongodb': {
    architecture: 'standalone',
    fullnameOverride: 'credits-mongodb',
    auth: {
      usernames: ['user'],
      passwords: ['password'],
      databases: ['credits']
    }
  },
  'dummies-mongodb': {
    architecture: 'standalone',
    fullnameOverride: 'dummies-mongodb',
    auth: {
      usernames: ['user'],
      passwords: ['password'],
      databases: ['dummies']
    }
  },
  rabbitmq: {
    fullnameOverride: 'rabbitmq',
    auth: {
      user: expect.any(String),
      password: expect.any(String),
      erlangCookie: expect.any(String)
    }
  }
}

exports.chart = chart
exports.values = values
