'use strict'

const chai = require('chai')
const code_generator = require('../../libs/code_generator')

const expect = chai.expect
const assert = chai.assert

describe('Code Generator', () => {
  
  it('Should be able to generate unique code', () => {
    const uniqueCode = code_generator.uniqueCode()
    expect(uniqueCode).to.be.a('string')
    assert.isTrue(uniqueCode.length > 0, 'Unique code length is bigger than zero')
  })

  it('Should be able to generate unique code on certain length', () => {
    const lengthFour = 4
    const generatedCode1 = code_generator.generate(lengthFour)
    expect(generatedCode1).to.be.a('string')
    assert.isTrue(generatedCode1.length > 0, 'Generated Code length is bigger than zero')
    assert.isTrue(generatedCode1.length >= lengthFour, `Generated Code length is equal or more than ${lengthFour}`)
    
    const lengthSix = 6
    const generatedCode2 = code_generator.generate(lengthSix)
    expect(generatedCode2).to.be.a('string')
    assert.isTrue(generatedCode2.length > 0, 'Generated Code length is bigger than zero')
    assert.isTrue(generatedCode2.length >= lengthSix, `Generated Code length is equal or more than ${lengthSix}`)

    const lengthEight = 8
    const generatedCode3 = code_generator.generate(lengthEight)
    expect(generatedCode3).to.be.a('string')
    assert.isTrue(generatedCode3.length > 0, 'Generated Code length is bigger than zero')
    assert.isTrue(generatedCode3.length >= lengthEight, `Generated Code length is equal or more than ${lengthEight}`)
  })

  it('Should be able to generate bulk unique code at certain length', () => {
    const bulkLength = 10
    const lengthCode = 4
    const generatedBulks = code_generator.generateBulk(bulkLength, lengthCode)
    expect(generatedBulks).to.be.an('array')
    assert.isTrue(generatedBulks.length === bulkLength, `Bulk generated code length is equal to ${bulkLength}`)

    generatedBulks.forEach((code) => {
      expect(code).to.be.a('string')
      assert.isTrue(code.length >= lengthCode, `Generated Code length is equal or more than ${lengthCode}`)
    })
  })

})