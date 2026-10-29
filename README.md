# Nova Dock — public page

Static one-page site (HTML, CSS, JavaScript). No build step. It contains no application code.

- `index.html` — the page
- `css/style.css` — styles
- `js/lang-en.js`, `js/lang-bg.js` — all texts. Default language is English. A new language = a new `lang-xx.js` file plus a button in the `.lang` group.
- `img/` — screenshots (English UI), logo, favicon

## Adding the Microsoft Store link

In `index.html` there are two `<span class="btn soon">` elements ("Coming soon to Microsoft Store").
Replace each with:

    <a class="btn primary" href="YOUR-STORE-LINK"><svg class="i"><use href="#i-windows"/></svg><span data-i18n="cta.getstore">Get it from Microsoft Store</span></a>

and add `"cta.getstore"` to both language files.

## Publish

GitHub Pages: repository `novadock`, branch `main`, folder `/ (root)`.
