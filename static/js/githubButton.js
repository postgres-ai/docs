'use strict'
;(function (w) {
  const numberWithCommas = (x) => {
    return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',')
  }

  const setGitHubStars = () => {
    const githubStars = localStorage.getItem('github-star-count')
    const gitHubButton = document.getElementsByClassName(
      'github-star-placeholder',
    )

    for (let i = 0; i < gitHubButton.length; i++) {
      gitHubButton[i].innerHTML = githubStars
    }
  }

  setTimeout(() => {
    fetch('https://api.github.com/repos/postgres-ai/database-lab-engine')
      .then((response) => response.json())
      .then((data) =>
        setTimeout(() => {
          localStorage.setItem(
            'github-star-count',
            numberWithCommas(data.stargazers_count),
          )
          setGitHubStars()
        }, 100),
      )
  })

  w.addEventListener('click', setGitHubStars)
})(window)
