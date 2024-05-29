# Trakt Manager

Control your Trakt account directly from Raycast.

# Usage

Since Trakt API doesn't provide poster images for any movies or shows, this extension had to make use of the TMDB API to fetch all movie and show details. When you use the extension for the first time, you would need to provide a TMDB API key, after that you will be asked to sign in to Trakt using OAuth. Once all the authentication processes are done, you can start searching for movies and shows and take action like add to watchlist or checkin on Trakt. You can read about how to get a TMDB API key [here](https://developer.themoviedb.org/docs/getting-started). For Trakt, the sign in process is pretty standard to how you would login on the web app. Once you click the `Sign in with Trakt` button, a new browser tab will be open to authenticate the extension with your account.

> [!NOTE]
> Please note that you would need a VIP Trakt account to be able to perform actions like add to watchlist or checkin to a movie or show episode.

# Commands

| Status             | Command        | Description                                 | <kbd>↵</kbd>          | <kbd>⌘</kbd> + <kbd>E</kbd> | <kbd>⌘</kbd> + <kbd>D</kbd> | <kbd>⌘</kbd> + <kbd>L</kbd> |
| ------------------ | -------------- | ------------------------------------------- | --------------------- | --------------------------- | --------------------------- | --------------------------- |
| :white_check_mark: | Search Movies  | Searches for movies with the title provided | Add To Watchlist      | Check-in Movie              | Open Trakt link in browser  |                             |
| :white_check_mark: | Search Shows   | Searches for shows with the title provided  |                       |                             |                             |                             |
| :construction:     | Show Watchlist |                                             | Remove From Watchlist |                             |                             |                             |
