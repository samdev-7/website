export const PAGES = ["about", "work", "writing", "contact"];

export function heroMinCols(heroJs) {
  const title = JSON.parse(heroJs.match(/const TITLE = (\[.*\]);/)[1]);
  const menu = PAGES.reduce((s, p) => s + p.length + 2, PAGES.length - 1);
  return Math.max(...title.map((l) => l.length), menu) + 6 + 2 * 4;
}

export const heroMenuHtml = () =>
  PAGES.map((p) => `<a href="/${p}"><span>${p}</span></a>`).join(
    '<span class="sep" aria-hidden="true"><span>|</span></span>'
  );

export const SITE = "https://samliu.dev";

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
