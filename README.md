# MeSize — Legal

Public legal pages for the **MeSize** mobile app, served with GitHub Pages.

- **Privacy Policy** → [`/privacy.html`](https://verbytskyinazar.github.io/mesize-legal/privacy.html)
- **Terms of Service** → [`/terms.html`](https://verbytskyinazar.github.io/mesize-legal/terms.html)

## Editing

The Markdown files are the source of truth:

- `privacy-policy.md`
- `terms-of-service.md`

After editing, regenerate the HTML (no dependencies needed):

```bash
node build.mjs
```

Then commit `*.md` and the rebuilt `*.html`. `build.mjs` is a tiny, dependency-free
Markdown→HTML converter tailored to these documents.

## Contact

verbytskyi.nazar@gmail.com
