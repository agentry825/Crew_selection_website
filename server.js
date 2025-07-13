// server.js

// Import required modules
const express = require("express"); // Express framework for building the API
const cors = require("cors"); // Middleware to enable Cross-Origin Resource Sharing
const path = require("path"); // Module to work with file and directory paths
const multer = require("multer"); // Middleware for handling multipart/form-data (for image uploads)

const app = express(); // Initialize the Express application

// Middleware Setup
app.use(cors()); // Enable CORS for all routes to allow cross-origin requests
app.use(express.json()); // Parse incoming JSON requests and put the parsed data in req.body

// Serve static files from the "public" directory
app.use(express.static(path.join(__dirname, "public")));

// Serve uploaded images from the "uploads" directory
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

/**
 * In-Memory Data Storage
 * 
 * These arrays store the data for rowers and crews.
 * In a production environment, this data should be stored in a database.
 */

// Initialize ID counters for rowers and crews
let nextRowerId = 2; // Start from 2 since we have an initial rower with id 1
let nextCrewId = 2;  // Start from 2 since we have an initial crew with id 1

// Array to store rower objects
const rowers = [
  {
    id: 1,
    name: "John Doe",
    height: 190, // Height in centimeters
    weight: 85,  // Weight in kilograms
    twoKTime: "6:30", // 2K rowing time in mm:ss format
    isIll: false, // Boolean indicating if the rower is ill
    photoUrl: "" // URL to the rower's photo
  }
];

// Array to store crew objects
const crews = [
  {
    id: 1,
    name: "Men's 8+", // Name of the crew
    rowerIds: [1] // Array of rower IDs assigned to this crew
  }
];

/** ---- MULTER CONFIGURATION FOR IMAGE UPLOADS ---- **/

// Define storage strategy for multer
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/"); // Directory to save uploaded images
  },
  filename: function (req, file, cb) {
    // Generate a unique filename using current timestamp and original name
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1E9);
    const extension = path.extname(file.originalname); // Extract the file extension
    cb(null, uniqueSuffix + extension); // Set the filename
  }
});

// Initialize multer with storage configuration and file filters
const upload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB file size limit
  fileFilter: function (req, file, cb) {
    // Accept only JPEG and PNG files
    const filetypes = /jpeg|jpg|png/;
    const mimetype = filetypes.test(file.mimetype.toLowerCase());
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());

    if (mimetype && extname) {
      return cb(null, true); // Accept the file
    }
    cb(new Error("Unsupported file format. Only JPEG and PNG are allowed.")); // Reject the file
  }
});

/** ---- ROWERS ROUTES ---- **/

/**
 * @route   GET /rowers
 * @desc    Retrieve a list of all rowers with minimal information (id and name)
 * @access  Public
 */
app.get("/rowers", (req, res) => {
  // Map the rowers array to include only id and name for each rower
  const minimal = rowers.map(r => ({ id: r.id, name: r.name }));
  res.json(minimal); // Send the minimal rowers data as JSON
});

/**
 * @route   GET /rowers/:id
 * @desc    Retrieve detailed information about a specific rower by ID
 * @access  Public
 */
app.get("/rowers/:id", (req, res) => {
  const rowerId = parseInt(req.params.id, 10); // Extract and parse the rower ID from the URL parameters
  const rower = rowers.find(r => r.id === rowerId); // Find the rower with the matching ID

  if (!rower) {
    // If the rower is not found, send a 404 Not Found error
    return res.status(404).json({ error: "Rower not found" });
  }

  res.json(rower); // Send the detailed rower information as JSON
});

/**
 * @route   POST /rowers
 * @desc    Add a new rower to the system, including an optional photo upload
 * @access  Public
 */
app.post("/rowers", upload.single("photo"), (req, res) => {
  const { name, height, weight, twoKTime, isIll } = req.body; // Destructure the request body

  if (!name || !name.trim()) {
    // Validate that the 'name' field is present and not just whitespace
    return res.status(400).json({ error: "Name is required" });
  }

  let photoUrl = ""; // Initialize the photoUrl variable
  if (req.file) {
    // If a photo was uploaded, set the photoUrl to the file's accessible URL
    photoUrl = `/uploads/${req.file.filename}`;
  }

  // Create a new rower object with the provided data
  const newRower = {
    id: nextRowerId++, // Assign a unique ID and increment the counter
    name: name.trim(), // Trim any extra whitespace from the name
    height: height ? Number(height) : null, // Assign height if provided, else null
    weight: weight ? Number(weight) : null, // Assign weight if provided, else null
    twoKTime: twoKTime || "", // Assign 2K time if provided, else an empty string
    isIll: isIll === "true", // Convert isIll to a boolean based on string value
    photoUrl // Assign the photoUrl (can be empty string if no photo)
  };

  rowers.push(newRower); // Add the new rower to the rowers array
  res.status(201).json(newRower); // Send a 201 Created response with the new rower data
});

/** ---- CREWS ROUTES ---- **/

/**
 * @route   GET /crews
 * @desc    Retrieve a list of all crews with minimal information (id and name)
 * @access  Public
 */
app.get("/crews", (req, res) => {
  // Map the crews array to include only id and name for each crew
  const minimal = crews.map(c => ({ id: c.id, name: c.name }));
  res.json(minimal); // Send the minimal crews data as JSON
});

/**
 * @route   GET /crews/:id
 * @desc    Retrieve detailed information about a specific crew by ID
 * @access  Public
 */
app.get("/crews/:id", (req, res) => {
  const crewId = parseInt(req.params.id, 10); // Extract and parse the crew ID from the URL parameters
  const crew = crews.find(c => c.id === crewId); // Find the crew with the matching ID

  if (!crew) {
    // If the crew is not found, send a 404 Not Found error
    return res.status(404).json({ error: "Crew not found" });
  }

  res.json(crew); // Send the detailed crew information as JSON
});

/**
 * @route   POST /crews
 * @desc    Add a new crew to the system
 * @access  Public
 */
app.post("/crews", (req, res) => {
  const { name } = req.body; // Destructure the 'name' from the request body

  if (!name || !name.trim()) {
    // Validate that the 'name' field is present and not just whitespace
    return res.status(400).json({ error: "Name is required" });
  }

  // Create a new crew object with the provided name
  const newCrew = {
    id: nextCrewId++, // Assign a unique ID and increment the counter
    name: name.trim(), // Trim any extra whitespace from the name
    rowerIds: [] // Initialize with an empty array of rower IDs
  };

  crews.push(newCrew); // Add the new crew to the crews array
  res.status(201).json(newCrew); // Send a 201 Created response with the new crew data
});

/**
 * @route   POST /crews/:id/addRower
 * @desc    Add a rower to a specific crew
 * @access  Public
 */
app.post("/crews/:id/addRower", (req, res) => {
  const crewId = parseInt(req.params.id, 10); // Extract and parse the crew ID from the URL parameters
  const { rowerId } = req.body; // Destructure the 'rowerId' from the request body

  const crew = crews.find(c => c.id === crewId); // Find the crew with the matching ID
  if (!crew) {
    // If the crew is not found, send a 404 Not Found error
    return res.status(404).json({ error: "Crew not found" });
  }

  const rower = rowers.find(r => r.id === rowerId); // Find the rower with the matching ID
  if (!rower) {
    // If the rower is not found, send a 404 Not Found error
    return res.status(404).json({ error: "Rower not found" });
  }

  if (!crew.rowerIds.includes(rowerId)) {
    // Check if the rower is not already in the crew
    crew.rowerIds.push(rowerId); // Add the rower ID to the crew's rowerIds array
  }

  res.json(crew); // Send the updated crew data as JSON
});

/**
 * @route   POST /crews/:id/removeRower
 * @desc    Remove a rower from a specific crew
 * @access  Public
 */
app.post("/crews/:id/removeRower", (req, res) => {
  const crewId = parseInt(req.params.id, 10); // Extract and parse the crew ID from the URL parameters
  const { rowerId } = req.body; // Destructure the 'rowerId' from the request body

  const crew = crews.find(c => c.id === crewId); // Find the crew with the matching ID
  if (!crew) {
    // If the crew is not found, send a 404 Not Found error
    return res.status(404).json({ error: "Crew not found" });
  }

  // Remove the rowerId from the crew's rowerIds array
  crew.rowerIds = crew.rowerIds.filter(id => id !== rowerId);
  res.json(crew); // Send the updated crew data as JSON
});

/** ---- Fallback Route ---- **/

/**
 * @route   GET *
 * @desc    Handle any undefined routes by serving the index.html file
 * @access  Public
 */
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html")); // Serve the index.html file from the public directory
});

/** ---- Test Reset Route ---- **/

/**
 * @route   POST /test/reset
 * @desc    Reset the in-memory data to initial state (useful for testing)
 * @access  Public (only available when NODE_ENV is set to 'test')
 */
if (process.env.NODE_ENV === "test") {
  app.post("/test/reset", (req, res) => {
    // Reset the rowers array to its initial state
    rowers.length = 0; // Clear the array
    rowers.push({
      id: 1,
      name: "John Doe",
      height: 190,
      weight: 85,
      twoKTime: "6:30",
      isIll: false,
      photoUrl: "" // Reset photoUrl
    });

    // Reset the crews array to its initial state
    crews.length = 0; // Clear the array
    crews.push({
      id: 1,
      name: "Men's 8+",
      rowerIds: [1]
    });

    // Reset the ID counters
    nextRowerId = 2;
    nextCrewId = 2;

    res.status(200).json({ message: "Test data reset" }); // Send a confirmation message
  });
}

/** ---- Error Handling Middleware ---- **/

/**
 * Error handling middleware to catch and respond to errors gracefully.
 * Specifically handles errors thrown by multer during file uploads.
 */
app.use((err, req, res, next) => {
  console.error(err.stack); // Log the error stack for debugging

  if (err instanceof multer.MulterError) {
    // Handle Multer-specific errors
    if (err.code === "LIMIT_FILE_SIZE") {
      // If the file size exceeds the limit
      return res.status(400).json({ error: "File size exceeds the allowed limit of 5MB." });
    }
    return res.status(400).json({ error: err.message }); // Send other Multer errors
  } else if (err) {
    // Handle general errors
    return res.status(500).json({ error: "Internal server error." });
  }

  next(); // Pass to the next middleware if no error is handled
});

/** ---- Export the Express App ---- **/

module.exports = app; // Export the app for use in other files (e.g., server startup script)
