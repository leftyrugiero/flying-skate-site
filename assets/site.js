function renderMarkdown(source) {
  const lines = source.replace(/\r\n/g, "\n").split("\n");
  const html = [];
  let inList = false;

  function closeList() {
    if (inList) {
      html.push("</ul>");
      inList = false;
    }
  }

  function inline(text) {
    return text
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/`([^`]+)`/g, "<code>$1</code>")
      .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2">$1</a>');
  }

  for (const line of lines) {
    if (!line.trim()) {
      closeList();
      continue;
    }

    if (line.startsWith("### ")) {
      closeList();
      html.push(`<h3>${inline(line.slice(4))}</h3>`);
    } else if (line.startsWith("## ")) {
      closeList();
      html.push(`<h2>${inline(line.slice(3))}</h2>`);
    } else if (line.startsWith("# ")) {
      closeList();
      html.push(`<h1>${inline(line.slice(2))}</h1>`);
    } else if (line.startsWith("- ")) {
      if (!inList) {
        html.push("<ul>");
        inList = true;
      }
      html.push(`<li>${inline(line.slice(2))}</li>`);
    } else {
      closeList();
      html.push(`<p>${inline(line)}</p>`);
    }
  }

  closeList();
  return html.join("\n");
}

async function loadMarkdownPage() {
  const target = document.querySelector("[data-markdown-src]");
  if (!target) {
    return;
  }

  const inlineSource = document.getElementById("markdown-source");
  if (inlineSource) {
    target.innerHTML = renderMarkdown(inlineSource.textContent.trim());
    return;
  }

  const source = target.getAttribute("data-markdown-src");
  try {
    const response = await fetch(source);
    if (!response.ok) {
      throw new Error(`Unable to load ${source}`);
    }
    const markdown = await response.text();
    target.innerHTML = renderMarkdown(markdown);
  } catch (error) {
    target.innerHTML = "<h1>Content unavailable</h1><p>Please try again later or contact support.flyingskate@gmail.com.</p>";
    console.error(error);
  }
}

loadMarkdownPage();
