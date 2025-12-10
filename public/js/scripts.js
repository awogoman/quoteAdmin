// public/js/scripts.js

document.addEventListener("DOMContentLoaded", () => {
  console.log("scripts.js loaded");

  const authorLinks = document.querySelectorAll(".author-info-link");
  console.log("Found author links:", authorLinks.length);

  authorLinks.forEach((link) => {
    link.addEventListener("click", async (evt) => {
      evt.preventDefault();

      const authorId = link.dataset.authorId;
      if (!authorId) {
        console.warn("No authorId on link", link);
        return;
      }

      try {
        const response = await fetch(`/api/author/${authorId}`);
        if (!response.ok) throw new Error("Network response was not ok");

        const author = await response.json();
        console.log("Author data:", author);

        const dobText = author.dobFormatted || "Unknown";
        const dodText = author.dodFormatted || "Still alive";

        const infoEl = document.getElementById("authorInfo");
        if (!infoEl) {
          console.error("#authorInfo element not found");
          return;
        }

        infoEl.innerHTML = `
          <div class="text-center mb-3">
            ${
              author.portrait
                ? `<img src="${author.portrait}"
                        class="img-fluid rounded mb-3"
                        alt="Portrait of ${author.firstName} ${author.lastName}">`
                : ""
            }
            <h2>${author.firstName} ${author.lastName}</h2>
          </div>
          <p><strong>DOB:</strong> ${dobText}</p>
          <p><strong>DOD:</strong> ${dodText}</p>
          <p><strong>Profession:</strong> ${author.profession || "Unknown"}</p>
          <p><strong>Country:</strong> ${author.country || "Unknown"}</p>
          <p>${author.biography || ""}</p>
        `;

        const modalEl = document.getElementById("authorModal");
        if (!modalEl) {
          console.error("#authorModal element not found");
          return;
        }

        const modal = new bootstrap.Modal(modalEl);
        modal.show();
      } catch (err) {
        console.error("Error fetching author info:", err);
      }
    });
  });
    // Fallback debugging handler for modal close buttons
  const modalEl = document.getElementById("authorModal");
  if (modalEl) {
    const closeButtons = modalEl.querySelectorAll('[data-bs-dismiss="modal"]');

    closeButtons.forEach((btn) => {
      btn.addEventListener("click", () => {
        const modal = bootstrap.Modal.getInstance(modalEl) || new bootstrap.Modal(modalEl);
        modal.hide();
        console.log("Author modal closed via fallback handler");
      });
    });
  }
});

