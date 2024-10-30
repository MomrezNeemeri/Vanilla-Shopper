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