# Areeba Imran — Portfolio

A static website (HTML, CSS, JavaScript). No build step, no installs.

## Files
- `index.html` — all sections and the seven projects
- `styles.css` — design (locked palette: #F5F0E8, #FFFCF7, #E8DFD2, #242321, #302C28, #47413A)
- `script.js` — 3D object (Three.js), animations, menu
- `config.js` — **your email / GitHub / LinkedIn** (empty fields stay hidden)
- `public/images/areeba-profile.png` — your photograph

## Preview
Double-click `index.html`. The 3D object loads Three.js from the internet, so be online. If you are offline, a CSS 3D cube is shown instead.

## Add your contact details
Open `config.js` and fill in only what you want shown.

## Add the VERITAS / Writify Studio links later
In `index.html`, replace each `<span class="soon">Link coming soon</span>` with:
`<a class="link" href="YOUR-URL" target="_blank" rel="noopener noreferrer">Open live app <b>↗</b></a>`

## Deploy (free)
- **Netlify:** go to app.netlify.com/drop and drag the whole `portfolio` folder in.
- **GitHub Pages:** upload the folder's contents to a repo, then Settings → Pages → deploy from `main` / root.
- **Vercel:** import the repo; framework preset "Other".
