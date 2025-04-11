import express from "express";
import path from "path";

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());

// Serve static files from the client's dist directory
app.use(express.static(path.join(__dirname, "../../dist")));

// Simple API endpoint example
app.get("/api/hello", (_req, res) => {
  res.json({ message: "Hello from server!" });
});

// For any other routes, send the index.html
app.get("/*splat", (req, res) => {
  res.sendFile(path.join(__dirname, "../../dist/index.html"));
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

// All paths go to this handler
// Eventually serves the app code for the Giffy app
// app.get("/", (_req, res) => res.send("Hello World!"));

// Handles CRUD opperations for the Giffy app
// app.use("/giffy", giffyRouter);

// Stops people form being idiots
// app.use(redirectRouter); (can add back later, from previous classwork is not currently connected to anything)
