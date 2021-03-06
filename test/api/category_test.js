"use strict";

const chai = require("chai");
const faker = require("faker");
const DB = require(`${project_root}/models`);
const Pagination = require(`${project_root}/libs/pagination_parser`);
const request = require("../utils/request");
const authClient = require("../utils/auth_client");

const expect = chai.expect;

describe("Category api's", () => {
  describe("List", () => {
    it("Should giving 401 response", async () => {
      const response = await request.get("/api/category");
      expect(response.status).to.equal(401);
    });

    it("Should give category list", async () => {
      // Initialize auth
      const authKey = await authClient.getAuthorizationKey();

      // create new category row
      await DB.ShortenCategory.create({
        name: "Book",
        description: "Book Category"
      });

      const response = await request.get("/api/category", {
        headers: { Authorization: `Basic ${authKey}` }
      });

      const responseData = response.data;
      expect(responseData.rows).to.have.length(1);
    });

    it("Should give a proper category list count", async () => {
      // Initialize auth
      const authKey = await authClient.getAuthorizationKey();

      // create 3 new category row
      await DB.ShortenCategory.bulkCreate([
        {
          name: "Book 1",
          description: "Book Category"
        },
        {
          name: "Book 2",
          description: "Book Category"
        },
        {
          name: "Book 3",
          description: "Book Category"
        }
      ]);

      const response = await request.get("/api/category", {
        headers: { Authorization: `Basic ${authKey}` }
      });

      const responseData = response.data;
      expect(responseData.rows).to.have.length(3);

      const payload = responseData.payload;
      expect(payload.count).to.equal(3);
      expect(payload.offset).to.equal(0);
      expect(payload.limit).to.equal(Pagination.LIMIT);
    });
  });

  describe("Edit", () => {
    it("Should be able to change category", async () => {
      // Initialize auth
      const authKey = await authClient.getAuthorizationKey();

      const CATEGORY_NAME = faker.lorem.words(4);
      const CATEGORY_DESC = faker.lorem.sentence(10);
      const category = await DB.ShortenCategory.create({
        name: CATEGORY_NAME,
        description: CATEGORY_DESC
      });

      const response = await request.put(
        `/api/category/${category.id}`,
        {
          name: faker.lorem.words(3),
          description: faker.lorem.sentence(8)
        },
        {
          headers: { Authorization: `Basic ${authKey}` }
        }
      );

      const categoryObj = response.data;
      expect(categoryObj.id).to.equal(category.id);
      expect(categoryObj.name).to.not.equal(CATEGORY_NAME);
      expect(categoryObj.description).to.not.equal(CATEGORY_DESC);
    });
  });

  describe("Detail", () => {
    it("Should get correct Category", async () => {
      // Initialize auth
      const authKey = await authClient.getAuthorizationKey();

      const CATEGORY_NAME = faker.lorem.words(4);
      const CATEGORY_DESC = faker.lorem.sentence(10);
      const category = await DB.ShortenCategory.create({
        name: CATEGORY_NAME,
        description: CATEGORY_DESC
      });

      const response = await request.get(`/api/category/${category.id}`, {
        headers: { Authorization: `Basic ${authKey}` }
      });

      const categoryObj = response.data;
      expect(categoryObj.id).to.be.a("string");
      expect(categoryObj.id).to.equal(category.id);
      expect(categoryObj.name).to.equal(CATEGORY_NAME);
      expect(categoryObj.description).to.equal(CATEGORY_DESC);
    });
  });

  describe("Create", () => {
    it("Should create a new Category", async () => {
      // Initialize auth
      const authKey = await authClient.getAuthorizationKey();

      const CATEGORY_NAME = faker.lorem.words(4);
      const CATEGORY_DESC = faker.lorem.sentence(10);

      const response = await request.post(
        `/api/category`,
        {
          name: CATEGORY_NAME,
          description: CATEGORY_DESC
        },
        {
          headers: {
            Authorization: `Basic ${authKey}`
          }
        }
      );

      const categoryObj = response.data;
      expect(response.status).to.equal(201);
      expect(categoryObj.name).to.equal(CATEGORY_NAME);
      expect(categoryObj.description).to.equal(CATEGORY_DESC);
    });
  });

  describe("Delete", () => {
    it("Should remove category", async () => {
      // Initialize auth
      const authKey = await authClient.getAuthorizationKey();

      const category = await DB.ShortenCategory.create({
        name: faker.lorem.words(4),
        description: faker.lorem.sentence(10)
      });

      const response = await request.delete(`/api/category/${category.id}`, {
        headers: { Authorization: `Basic ${authKey}` }
      });

      expect(response.status).to.equal(204);

      const responseGet = await request.get(`/api/category/${category.id}`, {
        headers: { Authorization: `Basic ${authKey}` }
      });

      expect(responseGet.status).to.equal(404);
    });
  });
});
