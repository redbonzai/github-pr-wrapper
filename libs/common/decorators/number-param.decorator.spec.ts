import { Test, TestingModule } from "@nestjs/testing";
import { Controller, Get } from "@nestjs/common";
import { NumberParam } from "./number-param.decorator";
import { INestApplication } from "@nestjs/common";
import * as request from "supertest";

@Controller("test")
class TestController {
  @Get("number-param/:value")
  testNumberParam(@NumberParam("value") value: number) {
    return { value };
  }
}

describe("NumberParam Decorator", () => {
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

  it("should validate numeric route parameter", () => {
    return request(app.getHttpServer())
      .get("/test/number-param/123")
      .expect(200)
      .expect({ value: 123 });
  });

  it("should throw error for non-numeric route parameter", () => {
    return request(app.getHttpServer())
      .get("/test/number-param/test123")
      .expect(400)
      .expect((res) => {
        expect(res.body.message).toBe("Invalid number: test123");
      });
  });

  it("should throw error if route parameter is missing", () => {
    return request(app.getHttpServer()).get("/test/number-param/").expect(404); // Because the route does not match, it should return 404
  });

  it("should throw error if route parameter is null", () => {
    return request(app.getHttpServer())
      .get("/test/number-param/null")
      .expect(400)
      .expect((res) => {
        expect(res.body.message).toBe("Invalid number: null");
      });
  });

  it("should throw error if route parameter is undefined", () => {
    return request(app.getHttpServer())
      .get("/test/number-param/undefined")
      .expect(400)
      .expect((res) => {
        expect(res.body.message).toBe("Invalid number: undefined");
      });
  });
});
