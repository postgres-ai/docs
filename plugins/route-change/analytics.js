import ExecutionEnvironment from '@docusaurus/ExecutionEnvironment'

export default (function () {
  if (!ExecutionEnvironment.canUseDOM) {
    return null
  }

  const setGitHubStars = () => {
    const githubStars = localStorage.getItem('github-star-count')
    const gitHubButton = document.getElementsByClassName(
      'github-star-placeholder',
    )[0]

    if (gitHubButton) {
      gitHubButton.innerHTML = githubStars
    }
  }

  return {
    onRouteDidUpdate() {
      setGitHubStars()
    },
  }
})()
