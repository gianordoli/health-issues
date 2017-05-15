// @flow weak

// Libraries
import log from 'loglevel';

// Styles
import '../../sass/intro.scss';

export class Intro {

  constructor(parentContainer: HTMLElement) {
    this.createElements(parentContainer);
  }

  createStoryBlock(id: number, content: string[]) {
    const div = document.createElement('div');
    div.id = 'story-' + id;
    div.classList.add('story-block');

    for(const c of content) {
      const p = document.createElement('p');      
      p.innerHTML = c;
      div.appendChild(p);
    }
    return div;
  }

  createElements(parentContainer: HTMLElement) {

    const elementsContainer = document.createElement('div');
    elementsContainer.id = 'intro';
    elementsContainer.classList.add('page');
    parentContainer.appendChild(elementsContainer);

    const chartsContainer = document.createElement('div')
    chartsContainer.classList.add('charts-container');
    elementsContainer.appendChild(chartsContainer);

    const copyContainer = document.createElement('div')
    copyContainer.classList.add('copy-container');
    elementsContainer.appendChild(copyContainer);

    copyContainer.appendChild(this.createStoryBlock(
      1, ['Most searches for health issues have a clear pattern throughout the year. Notice how the interest in sore throat goes up towards the end of the year in the US and down as it gets close to the Summer.']));

    copyContainer.appendChild(this.createStoryBlock(
      2, ['However, this cycle is also affected by an overall trend — in this case, searches for sore throat have been increasing since 2004.']));

    copyContainer.appendChild(this.createStoryBlock(
      3, ['If we were to split the seasonal cycle and the overall trend into 2, our charts would look like this.']));

    copyContainer.appendChild(this.createStoryBlock(
      4, ['Those yearly cycles can be combined to reveal what would be a “normal” pattern. That allows us to take a closer look into how seasonal factors — in this case, the weather — affect the interest for a given health issue.']));

    copyContainer.appendChild(this.createStoryBlock(
      5, ['Because they’re influenced by the weather, those cycles will look almost like mirrored images from one hemisphere to another, since their seasons are the flipped.']));

    copyContainer.appendChild(this.createStoryBlock(
      6, ['But factors other than the weather can affect the cycles too. Notice how the searches for stomach bug coincide with the end-of-year holidays seasons in both the US and Brazil.',
        'In Brazil, 2 minor spikes also happen around  Easter and the Sep 7th, the country’s Indepence Day.']));

    copyContainer.appendChild(this.createStoryBlock(
      7, ['But the overall trend is important too. It allows us to see how outbreaks developed — or at least how people reacted to them. The zyka virus didn’t really spread in the US, but it became a major concern because in the early 2016 anyway.',
      'A concern bigger than it was in Brazil, where most of the cases developed.']));
  }
}
