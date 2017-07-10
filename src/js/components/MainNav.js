// @flow weak

import icons from '../util/icons';
import log from 'loglevel';

export default class MainNav {

  data: {
    ticking: boolean,
    introIsMounted: boolean,
    storiesOffsetTop: number,
  };
  hamburger: HTMLElement;
  nav: HTMLElement;

  constructor(parentContainer: HTMLElement) {
    this.data = {
      ticking: false,
      introIsMounted: false,
      storiesOffsetTop: 0,
    }
    this.createElements(parentContainer);
  }

  moveBurger(scrollY: number, self: MainNav) {
    const { hamburger } = self;
    let { introIsMounted, storiesOffsetTop } = self.data;

    if (!introIsMounted) {
      const introPage = document.querySelector('#intro.page');
      if (introPage) introIsMounted = introPage.getBoundingClientRect().height === 0 ? false : true;
      self.updateData({ introIsMounted });

    } else if (storiesOffsetTop === 0) {
      const storiesPage = document.querySelector('#stories.page');
      if (storiesPage) storiesOffsetTop = storiesPage.getBoundingClientRect().top;
      self.updateData({ storiesOffsetTop });
    } else if (scrollY > storiesOffsetTop) {
      hamburger.classList.add('moved');
    } else {
      hamburger.classList.remove('moved');
    }
  }

  hamburgerClick(evt: Event, self: MainNav) {
    const { nav } = self;
    nav.classList.add('open');
  }

  closeClick(evt: Event, self: MainNav) {
    const { nav } = self;
    nav.classList.remove('open');
  }

  navMouseLeave(evt: Event, self: MainNav) {
    const { nav } = self;
    nav.classList.remove('open');
  }

  updateData(obj) {
    const { data } = this;
    Object.assign(data, obj);
  }

  createElements(parentContainer: HTMLElement) {
    const mainNavContainer = document.createElement('div');
    mainNavContainer.classList.add('main-nav', 'sticky');
    parentContainer.appendChild(mainNavContainer);

    this.hamburger = document.createElement('div');
    const { hamburger } = this;
    hamburger.classList.add('hamburger');
    hamburger.innerHTML = icons.hamburgerMenu;
    const bindHamburgerClick = evt => this.hamburgerClick(evt, this);
    hamburger.addEventListener('click', bindHamburgerClick);
    mainNavContainer.appendChild(hamburger);

    this.nav = document.createElement('nav');
    const { nav } = this;
    const bindNavMouseLeave = evt => this.navMouseLeave(evt, this);
    nav.addEventListener('mouseleave', bindNavMouseLeave);
    mainNavContainer.appendChild(nav);

    const close = document.createElement('div');
    close.classList.add('close');
    close.innerHTML = icons.close;
    const bindCloseClick = evt => this.closeClick(evt, this);
    close.addEventListener('click', bindCloseClick);
    nav.appendChild(close);

    const linksContainer = document.createElement('ul');
    nav.appendChild(linksContainer);

    const links = ['intro', 'stories', 'explore', 'ranking', 'about'];
    for (const l of links) {
      const li = document.createElement('li');
      linksContainer.appendChild(li);

      const button = document.createElement('a');
      button.innerHTML = l;
      button.setAttribute('href', `#${l}`);
      button.addEventListener('click', bindCloseClick);
      button.addEventListener('touchend', bindCloseClick);
      li.appendChild(button);
    }
  }
}
