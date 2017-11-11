"use strict";

const chai = require("chai");
const redis = require(`${project_root}/redis`);
const solid_code_generator = require(`${lib_root}/solid_code_generator`);

const expect = chai.expect;
const redisClient = redis();

describe("Solid Code Generator", () => {
  it("Should generate random code with specific length", () => {
    const code1 = solid_code_generator.getCode(6);
    const code2 = solid_code_generator.getCode(10);
    const code3 = solid_code_generator.getCode(100);

    expect(code1).to.be.a("string");
    expect(code1.length).to.equal(6);
    expect(code2).to.be.a("string");
    expect(code2.length).to.equal(10);
    expect(code3).to.be.a("string");
    expect(code3.length).to.equal(100);
  });
  it("Should be able to check existing generated code on redis", async () => {
    const KEY = "ABC123";
    const KEYCODE = `SHORTEN:${KEY}`;

    const exist = await solid_code_generator.isCodeExist(KEY);
    expect(exist).to.equal(false);

    await redisClient.hsetAsync(KEYCODE, "name", "Aditya Kresna");

    const exist2 = await solid_code_generator.isCodeExist(KEY);
    expect(exist2).to.equal(true);
  });
  it("Should be able to generate guaranteed-unique-code on specific length", async () => {
    const code = await solid_code_generator.generate(6);
    expect(code.length).to.equal(6);
    expect(code).to.be.a("string");

    const codeWithPrefix = await solid_code_generator.generate(7, "COUPON");
    expect(codeWithPrefix.length).to.equal(14);
    expect(codeWithPrefix).to.be.a("string");
    expect(codeWithPrefix).to.match(/^COUPON\-([a-zA-Z0-9]{7})$/);

    const codeWithCustomPrefix = await solid_code_generator.generate(
      4,
      "COUPON",
      "+"
    );
    expect(codeWithCustomPrefix.length).to.equal(11);
    expect(codeWithCustomPrefix).to.be.a("string");
    expect(codeWithCustomPrefix).to.match(/^COUPON\+([a-zA-Z0-9]{4})$/);
  });
  it("Should be able to generate bulk guaranteed-unique-code", async () => {
    const codes = await solid_code_generator.generateBulk(1000, 6);

    for (const code of codes) {
      expect(code).to.be.a("string");
      expect(code).to.be.lengthOf(6);
    }
    expect(codes).to.be.an("array");
    expect(codes).to.be.lengthOf(1000);
  });
});
