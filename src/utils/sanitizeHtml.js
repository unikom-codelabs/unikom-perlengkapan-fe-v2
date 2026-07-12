const ALLOWED_TAGS = new Set([
  "P",
  "BR",
  "STRONG",
  "B",
  "EM",
  "I",
  "U",
  "S",
  "UL",
  "OL",
  "LI",
  "A",
  "BLOCKQUOTE",
]);

const DANGEROUS_SELECTORS =
  "script,style,iframe,object,embed,link,meta,base,form";

const SAFE_HREF_PATTERN = /^(https?:|mailto:|tel:|#|\/)/i;

const decodeHtmlEntities = (text = "") => {
  const parser = new DOMParser();
  const doc = parser.parseFromString(String(text), "text/html");
  return doc.documentElement.textContent || "";
};

export const stripHtml = (htmlText = "") =>
  decodeHtmlEntities(String(htmlText).replace(/<[^>]*>/g, " "))
    .replace(/\u00a0/g, " ")
    .replace(/\s+/g, " ")
    .trim();

export const sanitizeRichText = (htmlText = "") => {
  const parser = new DOMParser();
  const doc = parser.parseFromString(String(htmlText || ""), "text/html");
  doc
    .querySelectorAll(DANGEROUS_SELECTORS)
    .forEach((node) => node.remove());

  doc.body.querySelectorAll("*").forEach((element) => {
    const tagName = element.tagName.toUpperCase();
    if (!ALLOWED_TAGS.has(tagName)) {
      element.replaceWith(...element.childNodes);
      return;
    }

    [...element.attributes].forEach((attribute) => {
      const attrName = attribute.name.toLowerCase();
      if (
        attrName.startsWith("on") ||
        attrName === "style" ||
        attrName === "class" ||
        attrName === "id"
      ) {
        element.removeAttribute(attribute.name);
        return;
      }

      if (tagName === "A" && attrName === "href") {
        const value = attribute.value.trim();
        if (!SAFE_HREF_PATTERN.test(value)) {
          element.removeAttribute("href");
        }
        return;
      }

      if (!(tagName === "A" && attrName === "href")) {
        element.removeAttribute(attribute.name);
      }
    });
    if (tagName === "A") {
      element.setAttribute("target", "_blank");
      element.setAttribute("rel", "noopener noreferrer");
    }
  });

  return doc.body.innerHTML.replace(/&nbsp;|&#160;/gi, " ").trim();
};
