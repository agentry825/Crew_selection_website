/* client.js */
/* global bootstrap */

/**
 * Convert a file to a Base64 data URL.
 * @param {File} file - The file to convert.
 * @returns {Promise<string>} - A promise that resolves with the Base64 string.
 */
function readFileAsDataURL(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader(); // Create a new FileReader instance
    reader.onload = (e) => resolve(e.target.result); // Resolve the promise with the result on successful read
    reader.onerror = (e) => reject(e); // Reject the promise if an error occurs
    reader.readAsDataURL(file); // Start reading the file as a data URL
  });
}

/** --- Error Alert Helpers --- **/

/**
 * Displays the error alert by removing the 'd-none' class.
 * This function makes the error alert visible to the user.
 */
function showErrorAlert() {
  const alertEl = document.getElementById("errorAlert"); // Get the error alert element by its ID
  if (alertEl) {
    alertEl.classList.remove("d-none"); // Remove the 'd-none' class to show the alert
  }
}

/**
 * Hides the error alert by adding the 'd-none' class.
 * This function makes the error alert invisible to the user.
 */
function hideErrorAlert() {
  const alertEl = document.getElementById("errorAlert"); // Get the error alert element by its ID
  if (alertEl) {
    alertEl.classList.add("d-none"); // Add the 'd-none' class to hide the alert
  }
}

/**
 * safeFetch: Wraps fetch in try/catch
 * and shows the error alert if the server cannot be reached.
 * @param {string} url - The API endpoint.
 * @param {object} options - Fetch options (method, headers, body, etc.).
 * @returns {Promise<object>} - The JSON response.
 */
async function safeFetch(url, options = {}) {
  try {
    const res = await fetch(url, options); // Perform the fetch request with the given URL and options
    if (!res.ok) {
      // If the response status is not OK (status code outside 200-299)
      throw new Error(`HTTP Error: ${res.status}`); // Throw an error to be caught in the catch block
    }
    hideErrorAlert(); // Hide any existing error alerts since the request was successful
    return await res.json(); // Parse and return the JSON response
  } catch (error) {
    showErrorAlert(); // Show the error alert to inform the user of the issue
    console.error("safeFetch Error:", error); // Log the error for debugging purposes
    throw error; // Rethrow the error in case further handling is needed
  }
}

/** --- API Helpers using safeFetch --- **/

/**
 * Fetches the list of all rowers.
 * @returns {Promise<Array>} - An array of rower objects.
 */
async function fetchRowers() {
  return safeFetch("/rowers"); // Send a GET request to the /rowers endpoint
}

/**
 * Fetches detailed information about a specific rower.
 * @param {number} rowerId - The ID of the rower to fetch.
 * @returns {Promise<object>} - The rower object with detailed information.
 */
async function fetchRowerDetails(rowerId) {
  return safeFetch(`/rowers/${rowerId}`); // Send a GET request to the /rowers/:id endpoint
}

/**
 * Fetches the list of all crews.
 * @returns {Promise<Array>} - An array of crew objects.
 */
async function fetchCrews() {
  return safeFetch("/crews"); // Send a GET request to the /crews endpoint
}

/**
 * Fetches detailed information about a specific crew.
 * @param {number} crewId - The ID of the crew to fetch.
 * @returns {Promise<object>} - The crew object with detailed information.
 */
async function fetchCrewDetails(crewId) {
  return safeFetch(`/crews/${crewId}`); // Send a GET request to the /crews/:id endpoint
}

/**
 * Adds a new rower to the system.
 * @param {FormData} formData - The form data containing rower information and photo.
 * @returns {Promise<object>} - The newly created rower object.
 */
async function addRower(formData) {
  return safeFetch("/rowers", {
    method: "POST", // HTTP method
    body: formData, // Send FormData including the image file
    // Note: Do not set the 'Content-Type' header when sending FormData; the browser will set it automatically
  });
}

/**
 * Adds a new crew to the system.
 * @param {object} data - The crew data to send in the request body.
 * @returns {Promise<object>} - The newly created crew object.
 */
async function addCrew(data) {
  return safeFetch("/crews", {
    method: "POST", // HTTP method
    headers: { "Content-Type": "application/json" }, // Set the Content-Type header to application/json
    body: JSON.stringify(data), // Convert the data object to a JSON string
  });
}

/**
 * Adds a rower to a specific crew.
 * @param {number} crewId - The ID of the crew to add the rower to.
 * @param {number} rowerId - The ID of the rower to add.
 * @returns {Promise<object>} - The updated crew object.
 */
async function addRowerToCrew(crewId, rowerId) {
  return safeFetch(`/crews/${crewId}/addRower`, {
    method: "POST", // HTTP method
    headers: { "Content-Type": "application/json" }, // Set the Content-Type header to application/json
    body: JSON.stringify({ rowerId }), // Convert the rowerId to a JSON string
  });
}

/**
 * Removes a rower from a specific crew.
 * @param {number} crewId - The ID of the crew to remove the rower from.
 * @param {number} rowerId - The ID of the rower to remove.
 * @returns {Promise<object>} - The updated crew object.
 */
async function removeRowerFromCrew(crewId, rowerId) {
  return safeFetch(`/crews/${crewId}/removeRower`, {
    method: "POST", // HTTP method
    headers: { "Content-Type": "application/json" }, // Set the Content-Type header to application/json
    body: JSON.stringify({ rowerId }), // Convert the rowerId to a JSON string
  });
}

/** --- Create UI Elements --- **/

/**
 * Creates a draggable card element representing a rower.
 * @param {object} rower - The rower data.
 * @returns {HTMLElement} - The rower card element.
 */
function createRowerCard(rower) {
  const card = document.createElement("div"); // Create a new div element for the card
  card.classList.add("rower-card", "border", "rounded", "p-2", "mb-2", "bg-white"); // Add multiple classes for styling
  card.draggable = true; // Make the card draggable
  card.dataset.rowerId = rower.id; // Store the rower ID in a data attribute for later use

  // Determine the rower's photo. Use a default image if none is provided.
  const rowerPhoto = rower.photoUrl || "https://maxrigging.com/wp-content/uploads/2017/12/erging-Page-01.png";

  // Set the inner HTML of the card with the rower's photo and information
  card.innerHTML = `
    <img src="${rowerPhoto}" alt="Photo of ${rower.name}" class="img-thumbnail mb-2" style="max-width: 100px;">
    <div>
      <strong>${rower.name}</strong><br>
      <span style="font-size: 0.85rem;">#${rower.id}</span>
    </div>
  `;

  /**
   * Event Listener: dragstart
   * 
   * When the user starts dragging the rower card, store the rower ID
   * in the dataTransfer object to identify which rower is being dragged.
   */
  card.addEventListener("dragstart", (e) => {
    e.dataTransfer.setData("text/plain", String(rower.id)); // Store the rower ID as a string
  });

  /**
   * Event Listener: click
   * 
   * When the rower card is clicked, display the rower's detailed information
   * in a modal window.
   */
  card.addEventListener("click", () => {
    showRowerModal(rower); // Call the function to show the modal with rower details
  });

  return card; // Return the constructed rower card element
}

/**
 * Creates a box element representing a crew where rowers can be dropped.
 * @param {object} crew - The crew data.
 * @returns {HTMLElement} - The crew box element.
 */
function createCrewBox(crew) {
  const box = document.createElement("div"); // Create a new div element for the crew box
  box.classList.add("crew-box", "border", "rounded", "p-3", "mb-3", "bg-light"); // Add multiple classes for styling
  box.dataset.crewId = crew.id; // Store the crew ID in a data attribute for later use

  // Set the inner HTML of the crew box with the crew's name and a container for rowers
  box.innerHTML = `
    <h6>${crew.name} <small>(ID: ${crew.id})</small></h6>
    <div class="crew-rowers" id="crewRowers-${crew.id}"></div>
  `;

  /**
   * Event Listener: dragover
   * 
   * Allows the crew box to be a valid drop target by preventing the default behavior.
   */
  box.addEventListener("dragover", (e) => {
    e.preventDefault(); // Prevent default to allow drop
  });

  /**
   * Event Listener: drop
   * 
   * Handles the drop event when a rower is dropped onto the crew box.
   * Adds the rower to the crew and updates the UI accordingly.
   */
  box.addEventListener("drop", async (e) => {
    e.preventDefault(); // Prevent default behavior
    const rowerIdStr = e.dataTransfer.getData("text/plain"); // Retrieve the rower ID from the dataTransfer object
    const rowerId = parseInt(rowerIdStr, 10); // Convert the rower ID to an integer
    if (Number.isNaN(rowerId)) return; // If the rower ID is not a number, do nothing

    try {
      await addRowerToCrew(crew.id, rowerId); // Add the rower to the crew via the API
      await renderCrews(); // Re-render the crews to reflect the changes
      await renderRowers(); // Re-render the rowers to update their assignment status
    } catch (err) {
      console.error("Failed to add rower to crew:", err); // Log the error for debugging
      // The error alert is already shown by safeFetch
    }
  });

  return box; // Return the constructed crew box element
}

/** --- Rendering Logic --- **/

/**
 * Renders the list of rowers not assigned to any crew.
 * Fetches all rowers and displays those who are not part of any crew.
 */
async function renderRowers() {
  const container = document.getElementById("rowersContainer"); // Get the container element for rowers
  container.innerHTML = ""; // Clear the container

  try {
    const rowerList = await fetchRowers(); // Fetch the list of all rowers

    for (const r of rowerList) {
      const fullRower = await fetchRowerDetails(r.id); // Fetch detailed information for each rower
      if (!fullRower) continue; // If rower details are not found, skip to the next

      // Check if the rower is in any crew
      const allCrews = await fetchCrews(); // Fetch the list of all crews
      let inCrew = false; // Flag to track if the rower is in a crew
      for (const c of allCrews) {
        const crewDetail = await fetchCrewDetails(c.id); // Fetch detailed information for each crew
        if (crewDetail && crewDetail.rowerIds.includes(fullRower.id)) {
          inCrew = true; // If the rower is found in the crew's rowerIds, set the flag
          break; // Exit the loop as the rower is already assigned to a crew
        }
      }

      if (!inCrew) {
        // If the rower is not in any crew, create and append the rower card to the container
        container.appendChild(createRowerCard(fullRower));
      }
    }
  } catch (err) {
    console.error("Error rendering rowers:", err); // Log the error for debugging
    // The error alert is already shown by safeFetch
  }
}

/**
 * Renders all crews and their respective rowers.
 * Fetches all crews and displays each crew along with its assigned rowers.
 */
async function renderCrews() {
  const container = document.getElementById("crewsContainer"); // Get the container element for crews
  container.innerHTML = ""; // Clear the container

  try {
    const crewList = await fetchCrews(); // Fetch the list of all crews

    for (const c of crewList) {
      const crewDetail = await fetchCrewDetails(c.id); // Fetch detailed information for each crew
      if (!crewDetail) continue; // If crew details are not found, skip to the next

      const box = createCrewBox(crewDetail); // Create a crew box element
      container.appendChild(box); // Append the crew box to the container

      const rowersDiv = box.querySelector(`#crewRowers-${crewDetail.id}`); // Get the container for rowers within the crew box
      for (const rowerId of crewDetail.rowerIds) {
        const rowerDetail = await fetchRowerDetails(rowerId); // Fetch detailed information for each rower in the crew
        if (rowerDetail) {
          const card = createRowerCard(rowerDetail); // Create a rower card element
          // Rower styling
          card.style.backgroundColor = "#f9f9f9"; // Set background color
          card.style.border = "1px solid #ccc"; // Set border styling
          rowersDiv.appendChild(card); // Append the rower card to the crew's rowers container
        }
      }
    }
  } catch (err) {
    console.error("Error rendering crews:", err); // Log the error for debugging
    // The error alert is already shown by safeFetch
  }
}

/** --- Rower Modal --- **/

/**
 * Displays the modal with detailed information about a rower.
 * @param {object} rower - The rower data.
 */
function showRowerModal(rower) {
  // Populate the modal elements with rower details
  document.getElementById("modalRowerId").textContent = rower.id;
  document.getElementById("modalRowerName").textContent = rower.name;
  document.getElementById("modalRowerHeight").textContent = rower.height ?? "N/A";
  document.getElementById("modalRowerWeight").textContent = rower.weight ?? "N/A";
  document.getElementById("modalRower2kTime").textContent = rower.twoKTime;
  document.getElementById("modalRowerIll").textContent = rower.isIll ? "Yes" : "No";

  const modalRowerPhoto = document.getElementById("modalRowerPhoto"); // Get the image element in the modal
  if (rower.photoUrl) {
    modalRowerPhoto.src = rower.photoUrl; // Set the source to the rower's photo URL if available
  } else {
    modalRowerPhoto.src = "https://maxrigging.com/wp-content/uploads/2017/12/erging-Page-01.png"; // Set to default image if no photo is available
  }

  const rowerModalEl = document.getElementById("rowerModal"); // Get the modal element by its ID
  const modal = new bootstrap.Modal(rowerModalEl); // Initialize the Bootstrap modal
  modal.show(); // Display the modal to the user
}

/** --- Form Setup --- **/

/**
 * Sets up event handlers for forms.
 * This includes handling form submissions for adding rowers and crews.
 */
function setupFormHandlers() {
  const rowerForm = document.getElementById("rowerForm"); // Get the rower form element by its ID
  rowerForm.addEventListener("submit", async (e) => {
    e.preventDefault(); // Prevent the default form submission behavior

    const name = document.getElementById("rowerName").value.trim(); // Get and trim the rower's name
    const height = document.getElementById("rowerHeight").value.trim(); // Get and trim the rower's height
    const weight = document.getElementById("rowerWeight").value.trim(); // Get and trim the rower's weight
    const twoKTime = document.getElementById("rower2kTime").value.trim(); // Get and trim the rower's 2K time
    const isIll = document.getElementById("rowerIsIll").checked; // Get the rower's health status
    const fileInput = document.getElementById("rowerPhotoFile"); // Get the file input element for the rower's photo

    // Create a new FormData object to hold the form data, including the image file
    const formData = new FormData();
    formData.append("name", name); // Append the rower's name
    if (height) formData.append("height", height); // Append the rower's height if provided
    if (weight) formData.append("weight", weight); // Append the rower's weight if provided
    formData.append("twoKTime", twoKTime); // Append the rower's 2K time
    formData.append("isIll", isIll); // Append the rower's health status

    if (fileInput.files && fileInput.files[0]) {
      formData.append("photo", fileInput.files[0]); // Append the uploaded photo file
    }

    try {
      const res = await addRower(formData); // Send a POST request to add the new rower with FormData
      console.log("New rower created:", res); // Log the newly created rower
      rowerForm.reset(); // Reset the form fields
      await renderRowers(); // Re-render the rowers to include the new rower
    } catch (err) {
      // The error alert is already shown by safeFetch
      console.error("Failed to add rower:", err); // Log the error for debugging
    }
  });

  const crewForm = document.getElementById("crewForm"); // Get the crew form element by its ID
  crewForm.addEventListener("submit", async (e) => {
    e.preventDefault(); // Prevent the default form submission behavior
    const name = document.getElementById("crewName").value.trim(); // Get and trim the crew's name
    try {
      const res = await addCrew({ name }); // Send a POST request to add the new crew
      console.log("New crew created:", res); // Log the newly created crew
      crewForm.reset(); // Reset the form fields
      await renderCrews(); // Re-render the crews to include the new crew
    } catch (err) {
      // The error alert is already shown by safeFetch
      console.error("Failed to add crew:", err); // Log the error for debugging
    }
  });
}

/**
 * Sets up drag-and-drop events for the rowers container.
 * This allows rowers to be dragged and dropped into crews.
 */
function setupRowersContainerDrop() {
  const container = document.getElementById("rowersContainer"); // Get the rowers container element by its ID

  // Add event listeners for dragover and dragleave to provide visual feedback
  container.addEventListener("dragover", (e) => {
    e.preventDefault(); // Necessary to allow a drop
    container.classList.add("drag-over"); // Add the visual highlight
  });

  container.addEventListener("dragleave", () => {
    container.classList.remove("drag-over"); // Remove the visual highlight
  });

  container.addEventListener("drop", async (e) => {
    e.preventDefault(); // Prevent default behavior
    container.classList.remove("drag-over"); // Remove the visual highlight

    const rowerIdStr = e.dataTransfer.getData("text/plain"); // Retrieve the rower ID
    const rowerId = parseInt(rowerIdStr, 10); // Convert to integer
    if (Number.isNaN(rowerId)) return; // Validate

    try {
      // Remove the rower from any current crew
      const allCrews = await fetchCrews(); // Fetch the list of all crews
      for (const c of allCrews) {
        const crewDetail = await fetchCrewDetails(c.id); // Fetch detailed information for each crew
        if (crewDetail && crewDetail.rowerIds.includes(rowerId)) {
          await removeRowerFromCrew(c.id, rowerId); // Remove the rower from the current crew
          break; // Assuming a rower is only in one crew
        }
      }
      await renderCrews(); // Update the crews UI
      await renderRowers(); // Update the rowers UI
    } catch (err) {
      console.error("Failed to remove rower from crew:", err); // Log the error for debugging
      // Error alert is already handled by safeFetch
    }
  });
}

/** --- Export Buttons --- **/

/**
 * Exports crew data as a TXT file.
 * Gathers all crews and their assigned rowers, formats the data, and triggers a download.
 */
async function exportAsTxt() {
  try {
    const crews = await fetchCrews(); // Fetch the list of all crews
    let txtContent = "Crew List\n\n"; // Initialize the TXT content with a header
    for (const c of crews) {
      const detail = await fetchCrewDetails(c.id); // Fetch detailed information for each crew
      txtContent += `Crew: ${c.name} (ID: ${c.id})\n`; // Add the crew name and ID to the TXT content
      if (!detail || detail.rowerIds.length === 0) {
        txtContent += "  No Rowers\n\n"; // Indicate that the crew has no assigned rowers
        continue; // Move to the next crew
      }
      for (const rId of detail.rowerIds) {
        const r = await fetchRowerDetails(rId); // Fetch detailed information for each rower in the crew
        if (r) {
          txtContent += `  Rower: ${r.name}, ID: ${r.id}, 2K: ${r.twoKTime}\n`; // Add rower details to the TXT content
        }
      }
      txtContent += "\n"; // Add a newline for separation between crews
    }

    const blob = new Blob([txtContent], { type: "text/plain" }); // Create a Blob object with the TXT content
    const url = URL.createObjectURL(blob); // Create a temporary URL for the Blob
    const link = document.createElement("a"); // Create a new anchor element
    link.href = url; // Set the href attribute to the Blob URL
    link.download = "crews.txt"; // Set the download attribute with the desired file name
    link.click(); // Programmatically click the link to trigger the download
    URL.revokeObjectURL(url); // Revoke the Blob URL to free up memory
  } catch (err) {
    console.error("Failed to export as TXT:", err); // Log the error for debugging
    // The error alert is already shown by safeFetch
  }
}

/**
 * Exports crew data as a CSV file.
 * Gathers all crews and their assigned rowers, formats the data in CSV format, and triggers a download.
 */
async function exportAsCsv() {
  try {
    const crews = await fetchCrews(); // Fetch the list of all crews
    let csvContent = "CrewName,CrewID,RowerName,RowerID,2KTime\n"; // Initialize the CSV content with headers
    for (const c of crews) {
      const detail = await fetchCrewDetails(c.id); // Fetch detailed information for each crew
      if (!detail || detail.rowerIds.length === 0) {
        csvContent += `"${c.name}",${c.id},,,\n`; // Add crew information without rowers
        continue; // Move to the next crew
      }
      for (const rId of detail.rowerIds) {
        const r = await fetchRowerDetails(rId); // Fetch detailed information for each rower in the crew
        if (r) {
          csvContent += `"${c.name}",${c.id},"${r.name}",${r.id},"${r.twoKTime}"\n`; // Add rower details to the CSV content
        }
      }
    }

    const blob = new Blob([csvContent], { type: "text/csv" }); // Create a Blob object with the CSV content
    const url = URL.createObjectURL(blob); // Create a temporary URL for the Blob
    const link = document.createElement("a"); // Create a new anchor element
    link.href = url; // Set the href attribute to the Blob URL
    link.download = "crews.csv"; // Set the download attribute with the desired file name
    link.click(); // Programmatically click the link to trigger the download
    URL.revokeObjectURL(url); // Revoke the Blob URL to free up memory
  } catch (err) {
    console.error("Failed to export as CSV:", err); // Log the error for debugging
    // The error alert is already shown by safeFetch
  }
}

/** --- Initialization --- **/

/**
 * Initializes the application by setting up event handlers and rendering initial data.
 * This function is called when the DOM content is fully loaded.
 */
window.addEventListener("DOMContentLoaded", async () => {
  setupFormHandlers(); // Set up form submission handlers for adding rowers and crews
  setupRowersContainerDrop(); // Set up drag-and-drop event handlers for the rowers container
  await renderRowers(); // Render the list of rowers not assigned to any crew
  await renderCrews(); // Render the list of crews and their assigned rowers

  // Set up event listeners for export buttons
  document.getElementById("exportTxtBtn").addEventListener("click", exportAsTxt); // Export crew data as TXT
  document.getElementById("exportCsvBtn").addEventListener("click", exportAsCsv); // Export crew data as CSV
});
