import { Test, TestingModule } from "@nestjs/testing";
import { Controller, Get } from "@nestjs/common";
import { NumberQuery } from "./number-query.decorator";
import { INestApplication } from "@nestjs/common";
import * as request from "supertest";

@Controller("test")
class TestController {
  @Get("number-query")
  testNumberQuery(@NumberQuery("value") value: number) {
    return { value };
  }
}

describe("NumberQuery Decorator", () => {
  let app: INestApplication;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TestController],
    }).compile();

    app = module.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it("should validate numeric query parameter", () => {
    return request(app.getHttpServer())
      .get("/test/number-query?value=123")
      .expect(200)
      .expect({ value: 123 });
  });

  it("should throw error for non-numeric query parameter", () => {
    return request(app.getHttpServer())
      .get("/test/number-query?value=test123")
      .expect(400)
      .expect((res) => {
        expect(res.body.message).toBe("Invalid number: test123");
      });
  });

  it("should throw error if query parameter is missing", () => {
    return request(app.getHttpServer())
      .get("/test/number-query")
      .expect(400)
      .expect((res) => {
        expect(res.body.message).toBe("Invalid number: undefined");
      });
  });

  it("should throw error if query parameter is null", () => {
    return request(app.getHttpServer())
      .get("/test/number-query?value=null")
      .expect(400)
      .expect((res) => {
        expect(res.body.message).toBe("Invalid number: null");
      });
  });

  it("should throw error if query parameter is undefined", () => {
    return request(app.getHttpServer())
      .get("/test/number-query?value=undefined")
      .expect(400)
      .expect((res) => {
        expect(res.body.message).toBe("Invalid number: undefined");
      });
  });
});
