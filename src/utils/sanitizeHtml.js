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
  "H1",
  "H2",
  "H3",
  "H4",
  "H5",
  "H6",
  "IMG",
  "SPAN",
  "SUB",
  "SUP",
  "PRE",
  "CODE",
]);

const DANGEROUS_SELECTORS =
  "script,style,iframe,object,embed,link,meta,base,form,input,button,select,textarea,svg,math";

const SAFE_HREF_PATTERN = /^(https?:|mailto:|tel:|#|\/|data:image\/)/i;

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

// Attributes allowed per tag.  Only these survive sanitisation.
const ALLOWED_ATTRS = {
  A:   new Set(["href", "title"]),
  IMG: new Set(["src", "alt", "width", "height"]),
};


const URL_ATTRS = new Set(["href", "src"]);

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

    const allowedSet = ALLOWED_ATTRS[tagName];

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

      
      if (!allowedSet || !allowedSet.has(attrName)) {
        element.removeAttribute(attribute.name);
        return;
      }

      
      if (URL_ATTRS.has(attrName)) {
        const value = attribute.value.trim();
        if (!SAFE_HREF_PATTERN.test(value)) {
          element.removeAttribute(attribute.name);
        }
      }
    });

    
    if (tagName === "A") {
      element.setAttribute("target", "_blank");
      element.setAttribute("rel", "noopener noreferrer");
    }
  });

  return doc.body.innerHTML.replace(/&nbsp;|&#160;/gi, " ").trim();
};
