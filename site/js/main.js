window.addEventListener('DOMContentLoaded', async () => {
  // TODO: Basic caching using localstorage?
  const ghRelease = await (await fetch('https://api.github.com/repos/psidex/CustomQuickSearch/releases/latest')).json();
  const ghReleaseATag = document.querySelector('#github-dl a');
  ghReleaseATag.href = `${ghRelease.html_url}`;
  ghReleaseATag.textContent = `GitHub Release ${ghRelease.name}`;
});
