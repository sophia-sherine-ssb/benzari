# Golden Fleece website

A plain static site: HTML, CSS and a little JavaScript. No build step.

## Put it on GitHub Pages
1. Create a new GitHub repository (for example `golden-fleece-site`).
2. Drag the whole contents of this folder (including the `assets` folder and `.nojekyll`) onto the repository page under "Add file" > "Upload files". You can drop the folder in one go, so there is no need to upload images one by one. Commit.
3. In the repository: Settings > Pages > Build and deployment > Source: "Deploy from a branch", branch `main`, folder `/ (root)`. Save.
4. After a minute the site is live at `https://<your-username>.github.io/golden-fleece-site/`.

## Use a subdomain of benzari.org
1. In the repository, create a file named `CNAME` (no extension) containing one line: the subdomain, for example `goldenfleece.benzari.org`.
2. Where benzari.org's DNS is managed, add a CNAME record: name `goldenfleece`, value `<your-username>.github.io`.
3. In Settings > Pages, enter the same subdomain under "Custom domain" and tick "Enforce HTTPS" once it is available.

## Editing later
- Contact email: search for `benzari@usc.edu` in the five `.html` files.
- Team: `about.html`. Headshots go in `assets/` and get an `<img>` in each team card.
- Dashboard sample units: the script at the bottom of `dashboard.html`.
