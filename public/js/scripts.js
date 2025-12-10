// public/js/scripts.js
document.addEventListener("DOMContentLoaded", () => {
  const authorLinks = document.querySelectorAll(".author-info-link");

  for (let link of authorLinks) {
    link.addEventListener("click", getAuthorInfo);
  }

  async function getAuthorInfo(evt) {
    evt.preventDefault();

    const authorId = this.dataset.authorId;
    const url = `/api/author/${authorId}`;

    try {
      const response = await fetch(url);
      if (!response.ok) throw new Error("Network response was not ok");
      const author = await response.json();

      const dobText = author.dobFormatted || "Unknown";
      const dodText = author.dodFormatted || "Still alive";

      document.getElementById("authorInfo").innerHTML = `
        <div class="text-center mb-3">
          ${author.portrait ? `<img src="${author.portrait}" class="img-fluid rounded mb-3" alt="Portrait of ${author.firstName} ${author.lastName}">` : ""}
          <h2>${author.firstName} ${author.lastName}</h2>
        </div>
        <p><strong>DOB:</strong> ${dobText}</p>
        <p><strong>DOD:</strong> ${dodText}</p>
        <p><strong>Profession:</strong> ${author.profession || "Unknown"}</p>
        <p><strong>Country:</strong> ${author.country || "Unknown"}</p>
        <p>${author.biography || ""}</p>
      `;

      const modalEl = document.getElementById("authorModal");
      const modal = new bootstrap.Modal(modalEl);
      modal.show();
    } catch (err) {
      console.error("Error fetching author info:", err);
    }
  }
});
