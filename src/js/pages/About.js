// @flow weak

// Libraries
import log from 'loglevel';

export default class About {

  constructor(parentContainer: HTMLElement) {
    this.createElements(parentContainer);
  }

  createElements(parentContainer: HTMLElement) {

    const elementsContainer = document.createElement('div');
    elementsContainer.id = 'about';
    elementsContainer.classList.add('page');
    parentContainer.appendChild(elementsContainer);

    const summary = document.createElement('div');
    summary.innerHTML = "SearchMD is a collaboration between the Google News Lab and Gabriel Gianordoli. It uses Google Search Trends to identify patterns in health-related searches.";
    elementsContainer.appendChild(summary);

    const aboutData = document.createElement('div');
    elementsContainer.appendChild(aboutData);

      let h4 = document.createElement('h4');
      h4.innerHTML = "Data";
      aboutData.appendChild(h4);

      let p = document.createElement('p');
      p.innerHTML = "All data in this project comes from Google Trends, and the search terms are <a href='https://www.google.com/intl/es419/insidesearch/features/search/knowledge.html' target='_blank'>Google Knowledge Graph</a> topics — which provides language-agnostic results and prevents “shingles” from returning searches for “roof shingles,” for example.";
      aboutData.appendChild(p);

      p = document.createElement('p');
      p.innerHTML = "The seasonal and trend are generated using a statistical method called seasonal trend decomposition. Take a look into this <a href='' target='_blank'>Medium post</a> for more information.";
      aboutData.appendChild(p);

      const aboutTeam = document.createElement('div');
      elementsContainer.appendChild(aboutTeam);

        h4 = document.createElement('h4');
        h4.innerHTML = "Team";
        aboutTeam.appendChild(h4);

        p = document.createElement('p');
        p.classList.add('type-body-2');
        p.innerHTML = "Consultancy";
        aboutTeam.appendChild(p);

        p = document.createElement('p');
        p.innerHTML = "Simon Rogers (Google News Lab) and Alberto Cairo";
        aboutTeam.appendChild(p);

        p = document.createElement('p');
        p.classList.add('type-body-2');
        p.innerHTML = "Data Support";
        aboutTeam.appendChild(p);

        p = document.createElement('p');
        p.innerHTML = "Sabrina Elfarra and Jennifer Lee (Google News Lab)";
        aboutTeam.appendChild(p);

        p = document.createElement('p');
        p.classList.add('type-body-2');
        p.innerHTML = "Concept";
        aboutTeam.appendChild(p);

        p = document.createElement('p');
        p.innerHTML = "<a href='http://gianordoli.com' target='_blank'>Gabriel Gianordoli</a> and <a href='http://laurasalaberry.com' target='_blank'>Laura Salaberry</a>";
        aboutTeam.appendChild(p);

        p = document.createElement('p');
        p.classList.add('type-body-2');
        p.innerHTML = "Data Visualization, Design and Development";
        aboutTeam.appendChild(p);

        p = document.createElement('p');
        p.innerHTML = "Gabriel Gianordoli";
        aboutTeam.appendChild(p);

        p = document.createElement('p');
        p.classList.add('type-body-2');
        p.innerHTML = "Art Direction and Illustration";
        aboutTeam.appendChild(p);

        p = document.createElement('p');
        p.innerHTML = "Laura Salaberry";
        aboutTeam.appendChild(p);

        p = document.createElement('p');
        p.classList.add('type-body-2');
        p.innerHTML = "Research";
        aboutTeam.appendChild(p);

        p = document.createElement('p');
        p.innerHTML = "André Biernath";
        aboutTeam.appendChild(p);
  }
}
