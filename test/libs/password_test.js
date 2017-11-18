'use strict'

const chai = require('chai')
const passwordLib = require('../../libs/password')

const expect = chai.expect
const assert = chai.assert

describe('Password Lib', () => {
  it('Should be able to hash password', async () => {
    const passwordString = 'thisIsExamplePassword'
    const hashedPassword = await passwordLib.hashPassword(passwordString)

    expect(hashedPassword).to.be.a('string')
    assert.notEqual(passwordString, hashedPassword, 'Password should not match with hashed password')
  })
  it('Should be able to compare password with hash password', async () => {
    const passwordString = 'thisIsExamplePassword'
    const hashedPassword = await passwordLib.hashPassword(passwordString)

    const comparedResult = await passwordLib.comparePassword(passwordString, hashedPassword)

    expect(comparedResult).to.be.a('boolean')
    assert.isTrue(comparedResult, 'Password not same with its hash')
  })
})