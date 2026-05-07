class QuickAddModal extends HTMLElement {
    constructor() {
        super();

        this.overlay = this.querySelector('.quick-add-overlay');
        this.closeBtn = this.querySelector('.quick-add-close');

        this.productData = JSON.parse(
            this.querySelector('.product-json').textContent
        );

        this.selectedOptions = {};

        this.initialVariant = this.productData.variants.find( variant => variant.available ) || this.productData.variants[0];

        this.productData.options.forEach((option, index) => {
            this.selectedOptions[option] = this.initialVariant.options[index];
        });
    }

    connectedCallback() {
        this.setupOpenTriggers();
        this.setupCloseEvents();
        this.setupOptionListeners();

        this.updateVariant();
    }

    setupOpenTriggers() {
        const handle = this.dataset.productHandle;

        document
            .querySelectorAll(`[data-product-handle="${handle}"]`)
            .forEach(trigger => {
                if (trigger === this) return;

                trigger.addEventListener('click', () => {
                    this.open();
                });
            });
    }

    setupCloseEvents() {
        this.overlay.addEventListener('click', () => {
            this.close();
        });

        this.closeBtn.addEventListener('click', () => {
            this.close();
        });

        document.addEventListener('keydown', (event) => {
            if (event.key === 'Escape') {
                this.close();
            }
        });
    }

    open() {
        this.classList.add('active');
        document.body.style.overflow = 'hidden';
    }

    close() {
        this.classList.remove('active');
        document.body.style.overflow = '';
    }

    setupOptionListeners() {
        this.querySelectorAll('.quick-add-color')
            .forEach(button => {
                button.addEventListener('click', () => {
                    const optionPosition =
                        Number(button.dataset.optionPosition) - 1;

                    const optionName =
                        this.productData.options[optionPosition];

                    const optionValue =
                        button.dataset.optionValue;

                    this.selectedOptions[optionName] = optionValue;

                    button
                        .closest('.quick-add-color-list')
                        .querySelectorAll('.quick-add-color')
                        .forEach(btn => btn.classList.remove('active'));

                    button.classList.add('active');

                    this.updateVariant();
                });
            });

        this.querySelectorAll('custom-select')
            .forEach(select => {

                select.addEventListener('select:change', (event) => {
                    const optionPosition = Number(select.dataset.optionPosition) - 1;

                    const optionName = this.productData.options[optionPosition];
                    
                    this.selectedOptions[optionName] = event.detail.value;
                    
                    this.updateVariant();
                });
            });

        this.querySelector('.quick-add-atc')
            .addEventListener('click', () => {
                this.addToCart();
            });
    }

    updateVariant() {
        const variant = this.productData.variants.find(variant => {
            return this.productData.options.every((optionName, index) => {
                return (
                    variant.options[index] === this.selectedOptions[optionName]
                );

            });

        });

        if (!variant) return;

        this.activeVariant = variant;

        this.updatePrice();
        this.updateImage();
        this.updateButton();
    }

    updatePrice() {
        const price = this.querySelector('.quick-add-price');

        price.textContent = Shopify.formatMoney(this.activeVariant.price);
    }

    updateImage() {
        if (!this.activeVariant.featured_image) return;

        const image = this.querySelector('.quick-add-image');

        image.src = this.activeVariant.featured_image.src;
    }

    updateButton() {
        const button = this.querySelector('.quick-add-atc');
        const buttonText = button.querySelector('.quick-add-atc-text');

        button.dataset.variantId = this.activeVariant.id;

        button.disabled = !this.activeVariant.available;

        buttonText.textContent = this.activeVariant.available ? 'Add to cart' : 'Sold out';
    }

    async addToCart() {
        if (!this.activeVariant) return;

        const button = this.querySelector('.quick-add-atc');
        const buttonText = button.querySelector('.quick-add-atc-text');

        button.disabled = true;
        buttonText.textContent = 'Adding...';

        try {
            await fetch('/cart/add.js', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    id: this.activeVariant.id,
                    quantity: 1
                })
            });
            
            buttonText.textContent = 'Added';

        } catch (error) {

            buttonText.textContent = 'Error';
        }

        setTimeout(() => {
            this.updateButton();
        }, 1200);
    }
}

customElements.define(
    'quick-add-modal',
    QuickAddModal
);



class CustomSelect extends HTMLElement {
  connectedCallback() {
    this.trigger = this.querySelector('.custom-select-trigger');

    this.text = this.querySelector('.custom-select-text');

    this.options = this.querySelectorAll('.custom-select-option');

    this.trigger.addEventListener('click', (event) => {
      event.stopPropagation();
      this.classList.toggle('is-open');
    });

    this.options.forEach(option => {
      option.addEventListener('click', () => {
        this.select(option);
      });
    });

    document.addEventListener('click', () => {
      this.close();
    });
  }

  select(option) {
    this.options.forEach(option => {
      option.classList.remove('is-active');
    });

    option.classList.add('is-active');
    const value = option.dataset.value;
    this.dataset.value = value;
    this.text.textContent = value;

    this.dispatchEvent(new CustomEvent(
      'select:change',
      {
        bubbles: true,
        detail: { value }
      }
    ));

    this.close();
  }

  close() {
    this.classList.remove('is-open');
  }
}

customElements.define(
  'custom-select',
  CustomSelect
);