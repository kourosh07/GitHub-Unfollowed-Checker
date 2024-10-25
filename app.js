document.getElementById("check").addEventListener("click", async () => {
  const username = document.getElementById("username").value.trim();
  const resultDiv = document.getElementById("result");
  const errorDiv = document.getElementById("error");
  const loadingDiv = document.getElementById("loading");

  resultDiv.innerHTML = "";
  errorDiv.innerHTML = "";
  loadingDiv.classList.remove("hidden"); 

  if (!username) {
    errorDiv.innerHTML = "Please enter a valid GitHub username.";
    loadingDiv.classList.add("hidden"); 
    return;
  }

  try {
    const following = await fetchData(
      `https://api.github.com/users/${username}/following`
    );
    const followers = await fetchData(
      `https://api.github.com/users/${username}/followers`
    );

    loadingDiv.classList.add("hidden"); 

    if (following.length === 0) {
      resultDiv.innerHTML = `<p>You are not following anyone.</p>`;
      return;
    }

    const followersSet = new Set(followers.map((user) => user.login));

    const notFollowingBack = following.filter(
      (user) => !followersSet.has(user.login)
    );

    if (notFollowingBack.length === 0) {
      resultDiv.innerHTML = `<p>Everyone you follow is following you back.</p>`;
    } else {
      notFollowingBack.forEach((user) => {
        const userCard = document.createElement("div");
        userCard.classList.add("user-card");
        userCard.innerHTML = `
                    <a href="${user.html_url}" target="_blank">
                        <img src="${user.avatar_url}" alt="${user.login}" width="60" height="60" style="border-radius:50%">
                        <p>${user.login}</p>
                    </a>
                `;
        resultDiv.appendChild(userCard);
      });
    }
  } catch (error) {
    loadingDiv.classList.add("hidden"); 
    console.error("Error during API fetch:", error); 
    errorDiv.innerHTML = `An error occurred: ${error.message}. Please try again later.`;
  }
});

async function fetchData(url) {
  let data = [];
  let response;
  let page = 1;

  try {
    do {
      response = await fetch(`${url}?per_page=100&page=${page}`);

      if (!response.ok) {
        const errorMessage = await response.json();
        throw new Error(`Error ${response.status}: ${errorMessage.message}`);
      }

      const pageData = await response.json();
      data = data.concat(pageData);
      page++;
    } while (
      response.headers.get("Link") &&
      response.headers.get("Link").includes('rel="next"')
    );
  } catch (error) {
    console.error(`Error fetching data from ${url}:`, error);
    throw error;
  }

  return data;
}
