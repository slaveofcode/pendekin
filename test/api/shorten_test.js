"use strict";

const chai = require("chai");
const faker = require("faker");
const DB = require(`${project_root}/models`);
const CodeGenerator = require(`${project_root}/libs/code_generator`);
const Pagination = require(`${project_root}/libs/pagination_parser`);
const Password = require(`${project_root}/libs/password`);
const request = require("../utils/request");
const authClient = require("../utils/auth_client");
const axios = require("axios");

const expect = chai.expect;

chai.should();
chai.use(require("chai-things"));

describe("Shorten api's", () => {
  describe("List", () => {
    it("Should giving 401 response", async () => {
      const response = await request.get("/api/shorten");
      expect(response.status).to.equal(401);
    });

    it("Should be able to get all shorteners", async () => {
      // Initialize auth
      const authKey = await authClient.getAuthorizationKey();

      await DB.ShortenUrl.create({
        code: CodeGenerator.generate(),
        expired_at: faker.date.future(),
        url: faker.internet.url(),
        prefix: faker.random.alphaNumeric(3),
        suffix: faker.random.alphaNumeric(3),
        protected_password: faker.internet.password()
      });

      const response = await request.get("/api/shorten", {
        headers: { Authorization: `Basic ${authKey}` }
      });

      const responseData = response.data;
      expect(responseData.rows).to.have.length(1);

      const payload = responseData.payload;
      expect(payload.count).to.equal(1);
      expect(payload.offset).to.equal(0);
      expect(payload.limit).to.equal(Pagination.LIMIT);
    });

    it("Should be able to get paginated shorteners", async () => {
      // Initialize auth
      const authKey = await authClient.getAuthorizationKey();

      const shortens = [];
      for (let i = 0; i <= 24; i++) {
        // 25 items
        shortens.push({
          code: CodeGenerator.generate(),
          expired_at: faker.date.future(),
          url: faker.internet.url(),
          prefix: faker.random.alphaNumeric(2),
          suffix: faker.random.alphaNumeric(3),
          protected_password: faker.internet.password()
        });
      }

      await DB.ShortenUrl.bulkCreate(shortens);

      const responsePageOne = await request.get("/api/shorten", {
        headers: { Authorization: `Basic ${authKey}` },
        params: { page: 1 }
      });

      const responseDataOne = responsePageOne.data;
      expect(responseDataOne.rows).to.have.length(20);

      const payloadOne = responseDataOne.payload;
      expect(payloadOne.count).to.equal(25);
      expect(payloadOne.offset).to.equal(0);
      expect(payloadOne.limit).to.equal(Pagination.LIMIT);

      const responsePageTwo = await request.get("/api/shorten", {
        headers: { Authorization: `Basic ${authKey}` },
        params: { page: 2 }
      });

      const responseDataTwo = responsePageTwo.data;
      expect(responseDataTwo.rows).to.have.length(5);

      const payloadTwo = responseDataTwo.payload;
      expect(payloadTwo.count).to.equal(25);
      expect(payloadTwo.offset).to.equal(20);
      expect(payloadTwo.limit).to.equal(Pagination.LIMIT);
    });
  });

  describe("Create", () => {
    it("Should be able to create one shortener", async () => {
      // Initialize auth
      const authKey = await authClient.getAuthorizationKey();

      const params = {
        expired_at: faker.date.future(),
        url: faker.internet.url(),
        password: faker.internet.password()
      };

      const shortenCode = await request.post("/api/shorten", params, {
        headers: { Authorization: `Basic ${authKey}` }
      });

      const shortenData = shortenCode.data;
      expect(shortenCode.status).to.equal(201);
      expect(shortenData).to.be.an("object");
      expect(shortenData.parent_id).to.be.a("null");
      expect(shortenData).to.have.keys([
        "id",
        "parent_id",
        "is_index_urls",
        "is_auto_remove_on_visited",
        "code",
        "code_origin",
        "expired_at",
        "url",
        "shorten_category_id",
        "updated_at",
        "created_at",
        "has_password"
      ]);
    });

    it("Should be able to create one shortener with custom code", async () => {
      // Initialize auth
      const authKey = await authClient.getAuthorizationKey();

      const params = {
        url: faker.internet.url(),
        custom_code: "MAMAMIA"
      };

      const shortenCode = await request.post("/api/shorten", params, {
        headers: { Authorization: `Basic ${authKey}` }
      });

      const shortenData = shortenCode.data;

      expect(shortenCode.status).to.equal(201);
      expect(shortenData).to.be.an("object");
      expect(shortenData.code).to.equal(params.custom_code);
    });

    it("Should not be able to create one shortener with custom code with existing code", async () => {
      // Initialize auth
      const authKey = await authClient.getAuthorizationKey();

      const params = {
        url: faker.internet.url(),
        custom_code: "MAMAMIA"
      };

      await request.post("/api/shorten", params, {
        headers: { Authorization: `Basic ${authKey}` }
      });

      const shortenCode = await request.post("/api/shorten", params, {
        headers: { Authorization: `Basic ${authKey}` }
      });

      const shortenData = shortenCode.data;
      expect(shortenCode.status).to.equal(400);
      expect(shortenData.message).to.equal("Custom Code already exist");
    });

    it("Should be able to create one shortener with prefix code", async () => {
      // Initialize auth
      const authKey = await authClient.getAuthorizationKey();

      const params = {
        url: faker.internet.url(),
        prefix: "ME"
      };

      const shortenCode = await request.post("/api/shorten", params, {
        headers: { Authorization: `Basic ${authKey}` }
      });

      const shortenData = shortenCode.data;
      expect(shortenCode.status).to.equal(201);
      expect(shortenData.code.substr(0, 2)).to.equal(params.prefix);
    });

    it("Should be able to create one shortener with suffix code", async () => {
      // Initialize auth
      const authKey = await authClient.getAuthorizationKey();

      const params = {
        url: faker.internet.url(),
        suffix: "ERR"
      };

      const shortenCode = await request.post("/api/shorten", params, {
        headers: { Authorization: `Basic ${authKey}` }
      });

      const shortenData = shortenCode.data;
      expect(shortenCode.status).to.equal(201);

      const startIdxChars = shortenData.code.length - 3;
      expect(shortenData.code.substr(startIdxChars, 3)).to.equal(params.suffix);
    });

    it("Should be able to create one shortener with prefix and suffix code", async () => {
      // Initialize auth
      const authKey = await authClient.getAuthorizationKey();

      const params = {
        expired_at: faker.date.future(),
        url: faker.internet.url(),
        prefix: faker.random.alphaNumeric(2),
        suffix: faker.random.alphaNumeric(2),
        password: faker.internet.password()
      };

      const shortenCode = await request.post("/api/shorten", params, {
        headers: { Authorization: `Basic ${authKey}` }
      });

      const shortenData = shortenCode.data;
      expect(shortenCode.status).to.equal(201);

      expect(shortenData.code.substr(0, 2)).to.equal(params.prefix);
      const startIdxChars = shortenData.code.length - 2;
      expect(shortenData.code.substr(startIdxChars, 2)).to.equal(params.suffix);
    });

    it("Should be able to create bulk shorteners", async () => {
      // Initialize auth
      const authKey = await authClient.getAuthorizationKey();

      const shortenDatas = [];
      for (let i = 0; i <= 4; i++) {
        shortenDatas.push({
          expired_at: faker.date.future(),
          url: faker.internet.url(),
          password: faker.internet.password()
        });
      }

      const shortenCode = await request.post(
        "/api/shorten/bulk",
        shortenDatas,
        {
          headers: { Authorization: `Basic ${authKey}` }
        }
      );

      const shortenData = shortenCode.data;
      expect(shortenCode.status).to.equal(201);
      expect(shortenData).to.be.an("array");
      shortenData.should.all.have.keys([
        "id",
        "is_index_urls",
        "is_auto_remove_on_visited",
        "code",
        "code_origin",
        "expired_at",
        "url",
        "shorten_category_id",
        "updated_at",
        "created_at",
        "has_password"
      ]);
    });

    it("Should be able to create bulk shorteners with custom, prefix and suffix code", async () => {
      // Initialize auth
      const authKey = await authClient.getAuthorizationKey();

      const PREFIX = faker.random.alphaNumeric(2);
      const SUFFIX = faker.random.alphaNumeric(2);
      const shortenDatas = [];
      for (let i = 0; i <= 4; i++) {
        shortenDatas.push({
          expired_at: faker.date.future(),
          url: faker.internet.url(),
          password: faker.internet.password(),
          prefix: PREFIX,
          suffix: SUFFIX
        });
      }

      const shortenCode = await request.post(
        "/api/shorten/bulk",
        shortenDatas,
        {
          headers: { Authorization: `Basic ${authKey}` }
        }
      );

      const shortenData = shortenCode.data;
      expect(shortenCode.status).to.equal(201);
      expect(shortenData).to.be.an("array");
      for (let shorten of shortenData) {
        expect(shorten.code.substr(0, 2)).to.equal(PREFIX);
        const startIdxChars = shorten.code.length - 2;
        expect(shorten.code.substr(startIdxChars, 2)).to.equal(SUFFIX);
      }
    });

    it("Should be able to create shortener with auto-removed param", async () => {
      // Initialize auth
      const authKey = await authClient.getAuthorizationKey();

      const params = {
        url: faker.internet.url(),
        auto_removed: true
      };

      const shortenCode = await request.post("/api/shorten", params, {
        headers: { Authorization: `Basic ${authKey}` }
      });

      const shortenData = shortenCode.data;
      expect(shortenCode.status).to.equal(201);
      expect(shortenData).to.be.an("object");
      expect(shortenData.is_auto_remove_on_visited).to.be.a("boolean");
      expect(shortenData.is_auto_remove_on_visited).to.equal(true);
    });
  });

  describe("Check", () => {
    it("Should be able to check custom shortener code", async () => {
      // Initialize auth
      const authKey = await authClient.getAuthorizationKey();

      const params = {
        url: faker.internet.url(),
        custom_code: "MAMAMIA"
      };

      const checkResponse1 = await request.post(
        "/api/shorten/check",
        {
          code: params.custom_code
        },
        { headers: { Authorization: `Basic ${authKey}` } }
      );

      await request.post("/api/shorten", params, {
        headers: { Authorization: `Basic ${authKey}` }
      });

      const checkResponse = await request.post(
        "/api/shorten/check",
        {
          code: params.custom_code
        },
        { headers: { Authorization: `Basic ${authKey}` } }
      );

      expect(checkResponse1.status).to.equal(204); // NO Content
      expect(checkResponse.status).to.equal(409); // Conflict
    });
  });

  describe("Edit", () => {
    it("Should be able to edit url shortener item", async () => {
      // Initialize auth
      const authKey = await authClient.getAuthorizationKey();

      const param = {
        expired_at: faker.date.future(),
        url: faker.internet.url(),
        password: faker.internet.password()
      };

      const paramEdit = {
        url: faker.internet.url()
      };

      const config = {
        headers: { Authorization: `Basic ${authKey}` }
      };

      const shorten = await request.post("/api/shorten", param, config);

      const shortenEdit = await request.put(
        `/api/shorten/${shorten.data.id}`,
        paramEdit,
        config
      );

      const shortenData = shortenEdit.data;
      expect(shortenEdit.status).to.equal(200);
      expect(shortenData.url).to.equal(paramEdit.url);
    });

    it("Should be able to change expired shortener item", async () => {
      // Initialize auth
      const authKey = await authClient.getAuthorizationKey();

      const param = {
        expired_at: faker.date.future(),
        url: faker.internet.url(),
        password: faker.internet.password()
      };

      const paramEdit = {
        expired_at: faker.date.future(5)
      };

      const config = {
        headers: { Authorization: `Basic ${authKey}` }
      };

      const shorten = await request.post("/api/shorten", param, config);

      const shortenEdit = await request.put(
        `/api/shorten/${shorten.data.id}`,
        paramEdit,
        config
      );

      const shortenData = shortenEdit.data;
      expect(shortenEdit.status).to.equal(200);
      expect(shortenData.expired_at).to.equal(
        paramEdit.expired_at.toISOString()
      );
    });

    it("Should be able to change password shortener item", async () => {
      // Initialize auth
      const authKey = await authClient.getAuthorizationKey();

      const param = {
        expired_at: faker.date.future(),
        url: faker.internet.url(),
        password: faker.internet.password()
      };

      const paramEdit = {
        password: faker.internet.password()
      };

      const config = {
        headers: { Authorization: `Basic ${authKey}` }
      };

      const shorten = await request.post("/api/shorten", param, config);

      const shortenEdit = await request.put(
        `/api/shorten/${shorten.data.id}`,
        paramEdit,
        config
      );

      const shortenData = shortenEdit.data;
      expect(shortenEdit.status).to.equal(200);
    });

    it("Should be able to change category of shortener item", async () => {
      // Initialize auth
      const authKey = await authClient.getAuthorizationKey();

      const config = {
        headers: { Authorization: `Basic ${authKey}` }
      };

      const createCategory = async () => {
        const CATEGORY_NAME = faker.lorem.words(4);
        const CATEGORY_DESC = faker.lorem.sentence(10);

        return await request.post(
          `/api/category`,
          {
            name: CATEGORY_NAME,
            description: CATEGORY_DESC
          },
          config
        );
      };

      const categoryOne = await createCategory();
      const categoryTwo = await createCategory();

      const param = {
        expired_at: faker.date.future(),
        url: faker.internet.url(),
        password: faker.internet.password(),
        category_id: categoryOne.data.id
      };

      const paramEdit = {
        category_id: categoryTwo.data.id
      };

      const shorten = await request.post("/api/shorten", param, config);

      const shortenEdit = await request.put(
        `/api/shorten/${shorten.data.id}`,
        paramEdit,
        config
      );

      const shortenData = shortenEdit.data;
      expect(shortenEdit.status).to.equal(200);
      expect(shortenData.shorten_category_id).to.equal(categoryTwo.data.id);
    });
  });

  describe("Detail", () => {
    it("Should get correct shortener item", async () => {
      // Initialize auth
      const authKey = await authClient.getAuthorizationKey();

      const params = {
        expired_at: faker.date.future(),
        url: faker.internet.url(),
        password: faker.internet.password()
      };

      const config = {
        headers: { Authorization: `Basic ${authKey}` }
      };

      const shorten = await request.post("/api/shorten", params, config);

      const shortenCode = await request.get(
        `/api/shorten/${shorten.data.id}`,
        config
      );

      const shortenData = shortenCode.data;
      expect(shortenCode.status).to.equal(200);
      expect(shortenData.url).to.equal(params.url);
      expect(shortenData).to.be.a("object");
    });
  });

  describe("Delete", () => {
    it("Should remove shortener item", async () => {
      // Initialize auth
      const authKey = await authClient.getAuthorizationKey();

      const params = {
        url: faker.internet.url()
      };

      const config = {
        headers: { Authorization: `Basic ${authKey}` }
      };

      const shorten = await request.post("/api/shorten", params, config);
      const shortenCode = await request.delete(
        `/api/shorten/${shorten.data.id}`,
        config
      );

      expect(shortenCode.status).to.equal(204); // No Content

      const deletedShortenCode = await request.get(
        `/api/shorten/${shorten.data.id}`,
        config
      );

      expect(deletedShortenCode.status).to.equal(404); // No Content
      expect(deletedShortenCode.data.message).to.equal("Item not found");
    });

    it("Should remove bulk of shorteners", async () => {
      // Initialize auth
      const authKey = await authClient.getAuthorizationKey();

      const shortenDatas = [];
      for (let i = 0; i <= 4; i++) {
        shortenDatas.push({
          url: faker.internet.url()
        });
      }

      const config = {
        headers: { Authorization: `Basic ${authKey}` }
      };

      const shortens = await request.post(
        "/api/shorten/bulk",
        shortenDatas,
        config
      );
      const shortenIds = shortens.data.map(s => s.id);
      const shortenCode = await request.post(
        `/api/shorten/bulk/delete`,
        shortenIds,
        config
      );

      for (let deletedShortenId of shortenIds) {
        const deletedShorten = await request.get(
          `/api/shorten/${deletedShortenId}`,
          config
        );
        expect(deletedShorten.status).to.equal(404); // No Content
        expect(deletedShorten.data.message).to.equal("Item not found");
      }

      expect(shortenCode.status).to.equal(204);
    });
  });

  describe("Index", () => {
    it("Should be able to create new index", async () => {
      // Initialize auth
      const authKey = await authClient.getAuthorizationKey();

      const params = {
        url: faker.internet.url(),
        is_index: true
      };

      const shortenCode = await request.post("/api/shorten", params, {
        headers: { Authorization: `Basic ${authKey}` }
      });

      const shortenData = shortenCode.data;
      expect(shortenCode.status).to.equal(201);
      expect(shortenData.is_index_urls).to.be.a("boolean");
      expect(shortenData.is_index_urls).to.equal(true);
    });

    it("Should be able to add new item to index", async () => {
      // Initialize auth
      const authKey = await authClient.getAuthorizationKey();

      const paramIndex = {
        url: faker.internet.url(),
        is_index: true
      };

      const shortenDatas = [];
      for (let i = 0; i < 4; i++) {
        shortenDatas.push({
          url: faker.internet.url()
        });
      }

      const shortenCodeIndex = await request.post("/api/shorten", paramIndex, {
        headers: { Authorization: `Basic ${authKey}` }
      });

      const shortenCodes = await request.post(
        `/api/shorten/items`,
        {
          parent_id: shortenCodeIndex.data.id,
          items: shortenDatas
        },
        {
          headers: { Authorization: `Basic ${authKey}` }
        }
      );

      const shortenCodesData = shortenCodes.data;
      expect(shortenCodes.status).to.equal(201);
      expect(shortenCodesData).to.be.an("array");

      for (let code of shortenCodesData) {
        expect(code.parent_id).to.equal(shortenCodeIndex.data.id);
      }
    });
  });

  describe("Visit", () => {
    //   it('Should auto-removed once it visited', async () => {})
    //   it('Should not be able to visit shorten after expired', async () => {})
    //   it('Should not be able to visit expired index', async () => {
    //   })
  });
});
