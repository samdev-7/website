export const PAGES = ["about", "work", "writing", "contact"];

export const EMAIL = "sam@samliu.dev";
export const PLACE = "waterloo, on";

export function heroWidths(timeW) {
  const w = Math.max(timeW, PLACE.length);
  return {
    navW: PAGES.reduce((s, p) => s + p.length + 2, PAGES.length - 1),
    contactW: EMAIL.length,
    info: [PLACE.padStart(w), " ".repeat(w)],
  };
}

export const heroMenuHtml = () =>
  PAGES.map((p) => `<a href="/${p}"><span>${p}</span></a>`).join(
    '<span class="sep" aria-hidden="true"><span>|</span></span>'
  );

export const SITE = "https://samliu.dev";
export const DATA_URL =
  import.meta.env.PUBLIC_DATA_URL ?? "https://now.samliu.dev";

export const person = (description) => ({
  "@type": "Person",
  "@id": `${SITE}/#person`,
  name: "Sam Liu",
  alternateName: "sam liu",
  url: SITE,
  email: "mailto:sam@samliu.dev",
  description,
  homeLocation: { "@type": "Place", name: "Ottawa, Canada" },
  worksFor: {
    "@type": "Organization",
    name: "Hack Club",
    url: "https://hackclub.com",
  },
  affiliation: {
    "@type": "CollegeOrUniversity",
    name: "University of Waterloo",
    url: "https://uwaterloo.ca",
  },
  sameAs: ["https://github.com/samdev-7", "https://www.linkedin.com/in/samliu"],
});
