class HeaderV2 extends HTMLElement {
  constructor() {
    super();
  }

  connectedCallback() {
    this.menuToggle = this.querySelector('.menu-toggle');
    this.drawer = this.querySelector('.header-drawer');

    this.isOpen = false;

    if (!this.menuToggle || !this.drawer) return;

    this.menuToggle.addEventListener('click', () => {
      this.toggleDrawer();
    });
  }

  toggleDrawer() {
    this.isOpen = !this.isOpen;

    this.classList.toggle('drawer-open', this.isOpen);

    this.menuToggle.setAttribute(
      'aria-label',
      this.isOpen ? 'Close header drawer' : 'Open header drawer'
    );
  }
}

customElements.define('header-v2', HeaderV2);