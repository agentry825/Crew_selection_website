// app.test.js

/* eslint-env jest */

const request = require("supertest"); // Import SuperTest for HTTP assertions
const app = require("./server"); // Import the Express app from server.js

// Define a test suite for the Rowing App API
describe("Rowing App API", () => {

  /**
   * Reset data before each test
   * 
   * Ensures that each test runs with a clean state by resetting the in-memory data.
   * This prevents tests from affecting each other and ensures consistency.
   */
  beforeEach(async () => {
    await request(app)
      .post("/test/reset") // Send a POST request to the /test/reset endpoint
      .expect(200); // Expect a 200 OK response
  });

  /**
   * Test GET /rowers
   * 
   * Verifies that the GET /rowers endpoint returns a 200 status code and an array of rowers.
   * Also checks that the response body matches the expected initial data.
   */
  it("GET /rowers should return 200 and an array", async () => {
    const res = await request(app)
      .get("/rowers") // Send a GET request to the /rowers endpoint
      .expect("Content-Type", /json/) // Expect the Content-Type header to include 'json'
      .expect(200); // Expect a 200 OK response

    expect(Array.isArray(res.body)).toBe(true); // Assert that the response body is an array
    expect(res.body).toEqual([
      { id: 1, name: "John Doe" } // Assert that the array contains the initial rower
    ]);
  });

  /**
   * Test POST /rowers
   * 
   * Verifies that the POST /rowers endpoint successfully creates a new rower.
   * Checks that the response contains the correct data and that a unique ID is assigned.
   */
  it("POST /rowers should create a new rower", async () => {
    const newRower = {
      name: "Test Rower", // Name of the new rower
      height: 180, // Height in centimeters
      weight: 75, // Weight in kilograms
      twoKTime: "6:50", // 2K rowing time in mm:ss format
      isIll: false // Health status indicating the rower is not ill
    };

    const res = await request(app)
      .post("/rowers") // Send a POST request to the /rowers endpoint
      .send(newRower) // Attach the newRower object as the request body
      .set("Content-Type", "application/json") // Set the Content-Type header to application/json
      .expect("Content-Type", /json/) // Expect the Content-Type header to include 'json'
      .expect(201); // Expect a 201 Created response

    expect(res.body).toHaveProperty("id"); // Assert that the response body has an 'id' property
    expect(res.body.name).toBe("Test Rower"); // Assert that the name matches
    expect(res.body.height).toBe(180); // Assert that the height matches
    expect(res.body.weight).toBe(75); // Assert that the weight matches
    expect(res.body.twoKTime).toBe("6:50"); // Assert that the 2K time matches
    expect(res.body.isIll).toBe(false); // Assert that the health status matches
  });

  /**
   * Test GET /crews
   * 
   * Verifies that the GET /crews endpoint returns a 200 status code and an array of crews.
   * Also checks that the response body matches the expected initial data.
   */
  it("GET /crews should return 200 and an array", async () => {
    const res = await request(app)
      .get("/crews") // Send a GET request to the /crews endpoint
      .expect("Content-Type", /json/) // Expect the Content-Type header to include 'json'
      .expect(200); // Expect a 200 OK response

    expect(Array.isArray(res.body)).toBe(true); // Assert that the response body is an array
    expect(res.body).toEqual([
      { id: 1, name: "Men's 8+" } // Assert that the array contains the initial crew
    ]);
  });

  /**
   * Test POST /crews
   * 
   * Verifies that the POST /crews endpoint successfully creates a new crew.
   * Checks that the response contains the correct data and that a unique ID is assigned.
   */
  it("POST /crews should create a new crew", async () => {
    const newCrew = { name: "Test Crew" }; // Name of the new crew

    const res = await request(app)
      .post("/crews") // Send a POST request to the /crews endpoint
      .send(newCrew) // Attach the newCrew object as the request body
      .set("Content-Type", "application/json") // Set the Content-Type header to application/json
      .expect("Content-Type", /json/) // Expect the Content-Type header to include 'json'
      .expect(201); // Expect a 201 Created response

    expect(res.body).toHaveProperty("id"); // Assert that the response body has an 'id' property
    expect(res.body.name).toBe("Test Crew"); // Assert that the name matches
    expect(res.body.rowerIds).toEqual([]); // Assert that the rowerIds array is initially empty
  });


});
