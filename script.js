// contentful
const client = contentful.createClient({
    // This is the space ID. A space is like a project folder in Contentful terms
    space: 'i2pxgno7npjg',
    // This is the access token for this space. Normally you get both ID and the token in the Contentful web app
    accessToken: '-6VCttKiTxmCLARHE_m1JtF1jQ5OwSSwQ2z_3P4v25I',
})
console.log(client);



// variables
const cartBtn = document.querySelector('.cart-btn');
const closeCartBtn = document.querySelector('.close-cart');
const clearCartBtn = document.querySelector('.clear-cart');
const cartDOM = document.querySelector('.cart');
const cartOverlay = document.querySelector('.cart-overlay');
const CartItems = document.querySelector('.cart-items');
const cartTotal = document.querySelector('.cart-total');
const cartContent = document.querySelector('.cart-content');
const productsDOM = document.querySelector('.products-center');
const closeCart = document.querySelector('.close-cart');

// cart items
let cart = [];

let buttonsDOM = []

let removeBtnDOM = [];

// getting products from json file
class Products {
    async getProducts() {
        try {

            const response = await client.getEntries({
                content_type: 'shoppingCartProducts'
            });
            console.log(response);



            let result = await fetch('items.json');
            let data = await result.json();
            let products = response.items;
            products = products.map(items => {
                const { title, price } = items.fields;
                const { id } = items.sys;
                const image = items.fields.image.fields.file.url;
                return { title, price, id, image };
            })
            return products;
        }

        catch (error) {
            console.error('Error:', error);
        }
    }
}
// display products
class UI {
    displayProducts(products) {
        let result = '';
        products.forEach(product => {
            result += `
                        <article class="product">
                    <div class="img-container">
                        <img src=${product.image} alt="product"
                            class="product-img" />
                        <button class="bag-btn" data-id=${product.id}>
                            <i class="fas fa-shopping-cart"></i>
                            Add to Cart
                        </button>
                    </div>
                    <h3>${product.title}</h3>
                    <h4>$${product.price}</h4>
                </article>                          `;
        });
        productsDOM.innerHTML = result;
    }
    getbagBtns() {
        const bagBtns = [...document.querySelectorAll(".bag-btn")];
        buttonsDOM = bagBtns;
        bagBtns.forEach(btn => {
            let id = btn.dataset.id;
            let inCart = cart.find(item => item.id === id);
            if (inCart) {
                btn.innerText = "In Cart";
                btn.disabled = true;
            }
            else {
                btn.addEventListener('click', (event) => {
                    event.target.innerText = "In Cart";
                    event.target.disabled = true;



                    // get product from products
                    let cartItems = { ...Storage.getProducts(id), count: 1 };
                    // add to cart
                    cart = [...cart, cartItems];
                    // save cart in local storage
                    Storage.saveCart(cart);
                    // set cart total
                    this.setCartValues(cart);
                    // display cart
                    this.addCartItem(cartItems);
                    // show cart
                    //this.showCart();
                    // popup
                    this.addtoCartpopup();
                }
                )
            }

        });
    }
    setCartValues(cart) {
        let itemsTotal = 0;
        let tempTotal = 0;
        let productCount = 0;
        cart.map(item => {
            productCount += 1;
            tempTotal += item.price * item.count;
            itemsTotal += item.count;
        });
        cartTotal.innerText = parseFloat(tempTotal.toFixed(2));
        CartItems.innerText = productCount;
    }
    addCartItem(cartItem) {
        let cart = '';
        cart += `
                        <div class="cart-item" data-id = ${cartItem.id}>
                        <img src=${cartItem.image} alt="product">
                        <div>
                            <h4>${cartItem.title}</h4>
                            <h5>$${cartItem.price}</h5>
                            <span class="remove-item" data-id = ${cartItem.id}>remove</span>
                        </div>
                        <div>
                            <i class="fas fa-chevron-up" data-id = ${cartItem.id}></i>
                            <p class="item-amount">${cartItem.count}</p>
                            <i class="fas fa-chevron-down" data-id = ${cartItem.id}></i>
                        </div>
                    </div>                        `;
        cartContent.innerHTML += cart;
        console.log(cartContent);
    }

    showCart() {

        cartOverlay.classList.add('transparentBcg');
        cartDOM.classList.add('showCart');

    }
    setupAPP() {
        cart = Storage.getCart();
        this.setCartValues(cart);
        this.populateCart(cart);
        cartBtn.addEventListener('click', () => {
            this.showCart();
            this.getClearbtn();

        });
        closeCartBtn.addEventListener('click', this.hideCart)
    }
    populateCart(cart) {
        cart.forEach(item => this.addCartItem(item));
    }
    hideCart() {
        cartOverlay.classList.remove('transparentBcg');
        cartDOM.classList.remove('showCart');
    }
    cartLogic() {
        // clear whole cart

        clearCartBtn.addEventListener('click', () => this.clearCart());

        // cart func
        cartContent.addEventListener('click', event => {
            if (event.target.classList.contains('fa-chevron-up')) {
                let t = event.target;
                let id = t.dataset.id;
                let tempItem = cart.find(item => item.id === id);
                tempItem.count++;
                const amountElement = t.closest('.cart-item').querySelector('.item-amount');
                amountElement.textContent = tempItem.count;
                this.setCartValues(cart);
                Storage.saveCart(cart);

                console.log(amountElement);



            }
        });

        cartContent.addEventListener('click', event => {
            if (event.target.classList.contains('fa-chevron-down')) {
                let t = event.target;
                let id = t.dataset.id;
                let tempItem = cart.find(item => item.id === id);
                if (tempItem.count > 1) {
                    tempItem.count--;
                }
                const amountElement = t.closest('.cart-item').querySelector('.item-amount');
                amountElement.textContent = tempItem.count;
                this.setCartValues(cart);
                Storage.saveCart(cart);

                console.log(amountElement);



            }
        });

    }
    clearCart() {
        let cartItem = cart.map(item => item.id);
        cartItem.forEach(id => this.removeItemFromCart(id));
        while (cartContent.children.length > 0) {
            cartContent.removeChild(cartContent.children[0]);

        }
        this.hideCart();
    }

    removeItemFromCart(id) {
        cart = cart.filter(item => item.id !== id);
        this.setCartValues(cart);
        Storage.saveCart(cart);
        let button = this.getsingleButton(id);
        // this.populateCart(cart);
        button.innerHTML = `<i class="fas fa-shopping-cart"></i>
                            Add to Cart`;
        button.disabled = false;
        console.log(cart);
    }






    // remove single item
    clearsingleItem(id) {
        // Remove a single item by ID and update the cart UI
        this.removeItemFromCart(id);
        console.log(id);
        let itemElement = cartContent.querySelector(`[data-id="${id}"]`);
        while (cartContent.children.length > 0) {
            cartContent.removeChild(itemElement)

        }

    }
    getsingleButton(id) {
        return buttonsDOM.find(button => button.dataset.id === id);
    }

    getClearbtn() {
        const removeBtn = [...document.querySelectorAll('.remove-item')];
        removeBtnDOM = removeBtn;
        removeBtnDOM.forEach(btn => {

            let id = btn.dataset.id;
            let removeitem = cart.find(item => item.id === id);
            if (removeitem) {
                btn.addEventListener('click', (event) => {
                    console.log(`Removing item with ID: ${id}`);
                    this.clearsingleItem(id); // Remove the single item from cart
                    event.target.disabled = true;
                }
                )

            }
            else {
                console.log('not remove item');

            }
        });


    }


    //popup for added to cart
    addtoCartpopup() {
        console.log('popup');
        const popup = document.querySelector('.added-to-cart');


        popup.style.display = "flex";
        popup.style.opacity = "1";
        popup.style.zIndex = "100";


        setTimeout(function () {
            popup.style.opacity = "0";
            setTimeout(function () {
                popup.style.display = "none";
            }, 500);
        }, 1000);
    }


}

// local storage
class Storage {
    static saveproducts(products) {
        localStorage.setItem("products", JSON.stringify(products));
    }
    static getProducts(id) {
        let product = JSON.parse(localStorage.getItem('products'));
        return product.find(item => item.id === id);
    }
    static saveCart(cart) {
        localStorage.setItem("cart", JSON.stringify(cart));
    }
    static getCart() {
        return localStorage.getItem('cart') ? JSON.parse(localStorage.getItem('cart')) : [];
    }
}

// events
document.addEventListener('DOMContentLoaded', () => {
    const ui = new UI();
    const products = new Products();
    // setup application
    ui.setupAPP();
    // get products
    products.getProducts().then(products => {
        ui.displayProducts(products);
        console.log(products);
        Storage.saveproducts(products);
    }).then(() => {
        ui.getClearbtn();
        ui.getbagBtns();
        ui.cartLogic();
    });
});



// Add an event listener to the "Shop Now" button
document.getElementById('shop-now-btn').addEventListener('click', function () {
    const bannerHeight = document.querySelector('.hero').offsetHeight;
    window.scrollBy({
        top: bannerHeight, // Scroll down by one viewport height
        behavior: 'smooth' // Smooth scrolling effect
    });
});
