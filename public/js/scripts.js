// public/js/scripts.js

// click listeners for author links
const authorLinks = document.querySelectorAll("a[id]");

for (let link of authorLinks) {
  link.addEventListener("click", getAuthorInfo);
}

async function getAuthorInfo(evt) {
  evt.preventDefault();

  const authorId = this.id;
  const url = `/api/author/${authorId}`;

  // local API
  const response = await fetch(url);
  const data = await response.json();

  if (!data || !data[0]) return;

  const author = data[0];

  // fill modal
  const authorInfo = document.querySelector("#authorInfo");
  authorInfo.innerHTML = `
    <h2>${author.firstName} ${author.lastName}</h2>
    <img src="${author.portrait}"
         alt="Portrait of ${author.firstName} ${author.lastName}"
         class="img-fluid mb-3">
    <p><strong>Born:</strong> ${author.dob}</p>
    ${author.dod ? `<p><strong>Died:</strong> ${author.dod}</p>` : ""}
    <p><strong>Profession:</strong> ${author.profession}</p>
    <p><strong>Country:</strong> ${author.country}</p>
    <p>${author.biography}</p>
  `;

  const links = document.querySelectorAll("a[id]");

for (let link of links) {
  link.addEventListener("click", loadAuthor);
}

async function loadAuthor(e) {
  e.preventDefault();

  const authorId = this.id;
  const url = `/api/author/${authorId}`;

  const response = await fetch(url);
  const data = await response.json();
  const author = data[0];

  const div = document.getElementById("authorInfo");
  div.innerHTML = `
    <h3>${author.firstName} ${author.lastName}</h3>
    <img src="${author.portrait}" class="img-fluid mb-3">
    <p><strong>Born:</strong> ${author.dob}</p>
    ${author.dod ? `<p><strong>Died:</strong> ${author.dod}</p>` : ""}
    <p><strong>Profession:</strong> ${author.profession}</p>
    <p><strong>Country:</strong> ${author.country}</p>
    <p>${author.biography}</p>
  `;

  const modal = new bootstrap.Modal(document.getElementById("authorModal"));
  modal.show();
}

  // bootstrap modal
  const modalEl = document.getElementById("authorModal");
  const myModal = new bootstrap.Modal(modalEl);
  myModal.show();
}
