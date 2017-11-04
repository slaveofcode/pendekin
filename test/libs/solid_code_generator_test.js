"use strict";

const chai = require("chai");
const redis = require(`${project_root}/redis`);
const solid_code_generator = require(`${lib_root}/solid_code_generator`);

const expect = chai.expect;
const redisClient = redis();

describe("Solid Code Generator", () => {
  it("Should generate random code with specific length", () => {
    const code1 = solid_code_generator.getUniqueCode(6);
    const code2 = solid_code_generator.getUniqueCode(10);
    const code3 = solid_code_generator.getUniqueCode(100);

    expect(code1).to.be.a("string");
    expect(code1.length).to.equal(6);
    expect(code2).to.be.a("string");
    expect(code2.length).to.equal(10);
    expect(code3).to.be.a("string");
    expect(code3.length).to.equal(100);
  });
  it.only("Should be able to check existing generated code on redis", async () => {
    const KEY = "ABC123";
    redisClient.del(KEY);

    const exist = await solid_code_generator.checkUniqueCode(KEY);
    expect(exist).to.be.a("null");

    await redisClient.hsetAsync(KEY, "name", "Aditya Kresna Permana");

    const exist2 = await solid_code_generator.checkUniqueCode(KEY);
    expect(exist2).to.be.a("null");
  });
  it("Should be able to generate guaranteed-unique-code on specific length", () => {});
});
