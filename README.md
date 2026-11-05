# Afterlives

**A digital literary research studio.** Afterlives helps students study how stories change as they move across media, languages, and cultures. It is a research assistant, not an automated literary critic: the researcher owns the interpretation.

This is a small prototype with **no build step and no dependencies**: plain HTML, CSS, and JavaScript.

## The four features

| Feature | What it does |
|---|---|
| **Story Lineage** | A branching tree of a story's documented versions. Each connection is labeled *documented adaptation*, *stated inspiration*, or *thematic parallel*, with its evidence. |
| **Comparison Room** | Pick two versions and read passages side by side. Content words missing from the other passage are highlighted as *potential* differences. Write annotations per topic. |
| **Critical Lens** | Suggested research questions, each linked to the passages that prompted it. Accept, revise, reject, or add a competing interpretation. |
| **Context Ledger** | A record per version (creator, source, date, language, medium, credits), with every entry marked *verified*, *interpretation*, *missing*, or *AI-generated*. |

Your annotations, questions, and interpretations are saved in your browser (`localStorage`) and can be downloaded as Markdown from **Research Notes**.

## Run it locally

Open `index.html` in a browser. That's it. (Or run `python -m http.server` in this folder and visit http://localhost:8000.)

## Put it on GitHub Pages

1. Create a new repository on GitHub and upload every file in this folder (including the hidden `.nojekyll` file).
2. Go to **Settings → Pages**.
3. Under **Build and deployment**, choose **Deploy from a branch**, select **main** and **/ (root)**, then **Save**.
4. After a minute your site is live at `https://<your-username>.github.io/<repository-name>/`.

## Files

```
index.html   page shell and navigation
styles.css   visual identity: ivory, charcoal, muted burgundy; serif headings, sans-serif UI
data.js      the collection (story, versions, passages, ledger, suggestions)
app.js       views, routing, comparison highlighting, notes, export
```

## Replace the demo with a real case study

The included story, versions, and passages are **invented demo data**. To use a real case study, edit `data.js` only:

- `versions`: each has `id`, `short`, `title`, `medium`, `year`, `lang`, `summary`.
- `edges`: `{ from, to, type, evidence }` where `type` is `documented adaptation`, `stated inspiration`, or `thematic parallel`. Only claim a connection you can document.
- `topics`: the passage categories to compare (opening, ending, and so on).
- `passages[versionId][topicId]`: short excerpts. Use public-domain, licensed, or rights-cleared text, or your own summaries.
- `ledger[versionId]`: rows of `{ field, value, status }` where `status` is `verified`, `interpretation`, `missing`, or `ai`.
- `suggestions`: `{ id, pair: [fromId, toId], topic, observation, question, passages: [{ v, t }] }`. Keep the *observation* (what the text shows) separate from the *question* (a possible explanation to test).

Keep the collection small: one narrative and two or three related versions.

## About the AI

The suggestions in the Critical Lens are **prepared examples**, not live model output, which keeps the prototype free to host and easy to demonstrate. To add live AI later:

- Never put an API key in front-end code on GitHub Pages; anyone could read it. Call the model through a small server-side function (for example a Cloudflare Worker or Netlify Function) that holds the key.
- Send only the selected passages and their metadata, and ask the model to return JSON in the same shape as `suggestions`, citing the passages it relied on.
- Keep the human checks: show the linked passages, label output as AI-generated, and let the researcher accept, revise, or reject it.
- Test AI observations against your own close readings and record the errors.

## Notes

- The page works offline except for the Google Fonts (Newsreader and Inter), which fall back to Georgia and system fonts.
- Keyboard accessible: nodes in the lineage tree can be focused and activated with Enter or Space.
- Notes live in one browser on one device; use the Markdown download to keep a copy.
